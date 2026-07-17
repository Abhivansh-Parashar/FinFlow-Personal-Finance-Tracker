package com.financetracker.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.config.GeminiProperties;
import com.financetracker.dto.AI.ReceiptExtractionResult;
import com.financetracker.entity.Category;
import com.financetracker.entity.User;
import com.financetracker.enums.TransactionType;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.service.ReceiptExtractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReceiptExtractionServiceImpl implements ReceiptExtractionService {

    private final WebClient geminiWebClient;
    private final GeminiProperties geminiProperties;
    private final ObjectMapper objectMapper;
    private final CategoryRepository categoryRepository;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(60);
    private static final String RESPONSE_MIME_TYPE = "application/json";
    private static final double TEMPERATURE = 0.1;
    private static final int MAX_OUTPUT_TOKENS = 1024;
    private static final Pattern JSON_OBJECT_PATTERN = Pattern.compile("\\{[\\s\\S]*\\}");

    private String buildPrompt(User user) {

        List<String> categories = categoryRepository
                .findAvailableCategories(
                        user.getId(),
                        TransactionType.EXPENSE
                )
                .stream()
                .map(Category::getName)
                .toList();

        String availableCategories = String.join(", ", categories);

        return """
                You are an expert receipt extraction assistant.

                The image may contain printed or handwritten receipts.

                Return ONLY valid JSON.

                {
                  "amount": number,
                  "merchant":"string",
                  "date":"yyyy-MM-dd",
                  "suggestedCategory":"string",
                  "rawModelNotes":"string"
                }

                Rules:
                1. Read printed and handwritten text.
                2. Choose ONLY one category from:
                %s
                3. Never invent categories.
                4. If none match, return "Other".
                5. Ignore currency symbols.
                6. Return only JSON.
                """.formatted(availableCategories);
    }

    @Override
    public ReceiptExtractionResult extract(
            MultipartFile file,
            User user
    ) {

        validateFile(file);

        String base64Image = convertToBase64(file);

        String mimeType = file.getContentType();

        Map<String, Object> requestBody =
                buildRequestBody(
                        base64Image,
                        mimeType,
                        user
                );

        String response = callGemini(requestBody);

        return parseGeminiResponse(response);
    }

    private String convertToBase64(MultipartFile file) {

        try {
            return Base64.getEncoder()
                    .encodeToString(file.getBytes());

        } catch (IOException e) {

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to read uploaded receipt.",
                    e
            );
        }
    }

    private Map<String, Object> buildRequestBody(
            String base64Image,
            String mimeType,
            User user
    ) {

        Map<String, Object> textPart = Map.of(
                "text",
                buildPrompt(user)
        );

        Map<String, Object> inlineData = Map.of(
                "mime_type", mimeType,
                "data", base64Image
        );

        Map<String, Object> imagePart = Map.of(
                "inline_data",
                inlineData
        );

        List<Object> parts = List.of(
                textPart,
                imagePart
        );

        Map<String, Object> content = Map.of(
                "parts",
                parts
        );

        List<Object> contents = List.of(content);

        Map<String, Object> generationConfig = Map.of(
                "responseMimeType",
                RESPONSE_MIME_TYPE,
                "temperature",
                TEMPERATURE,
                "maxOutputTokens",
                MAX_OUTPUT_TOKENS
        );

        return Map.of(
                "contents",
                contents,
                "generationConfig",
                generationConfig
        );
    }
    private String callGemini(Map<String, Object> requestBody) {

        return geminiWebClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1beta/models/{model}:generateContent")
                        .queryParam("key", geminiProperties.apiKey())
                        .build(geminiProperties.model())
                )
                .bodyValue(requestBody)
                .retrieve()

                .onStatus(
                        HttpStatusCode::is4xxClientError,
                        response -> response.bodyToMono(String.class)
                                .flatMap(errorBody ->
                                        Mono.error(
                                                new ResponseStatusException(
                                                        response.statusCode(),
                                                        "Gemini Error: " + errorBody
                                                )
                                        )
                                )
                )

                .onStatus(
                        HttpStatusCode::is5xxServerError,
                        response -> Mono.error(
                                new ResponseStatusException(
                                        HttpStatus.SERVICE_UNAVAILABLE,
                                        "Gemini is temporarily unavailable."
                                )
                        )
                )

                .bodyToMono(String.class)
                .timeout(REQUEST_TIMEOUT)
                .block();
    }

    private ReceiptExtractionResult parseGeminiResponse(String response) {

        try {

            JsonNode root = objectMapper.readTree(response);

            // Check if the model's response was truncated by the API
            String finishReason = root
                    .path("candidates")
                    .path(0)
                    .path("finishReason")
                    .asText("");

            if ("MAX_TOKENS".equals(finishReason)) {
                log.warn("Gemini response was truncated (MAX_TOKENS). Consider increasing maxOutputTokens.");
            }

            JsonNode textNode = root
                    .path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode() || textNode.asText().isBlank()) {

                log.error("Gemini returned empty response. Full API response: {}", response);

                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Gemini returned an empty response."
                );
            }

            String generatedJson = cleanJsonText(textNode.asText());

            log.debug("Cleaned Gemini JSON: {}", generatedJson);

            return objectMapper.readValue(
                    generatedJson,
                    ReceiptExtractionResult.class
            );

        } catch (JsonProcessingException e) {

            log.error("Failed to parse Gemini response. Raw response: {}", response, e);

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to parse Gemini response.",
                    e
            );
        }
    }

    /**
     * Cleans the raw text from Gemini — strips markdown code fences
     * and extracts the JSON object even if surrounded by extra text.
     */
    private String cleanJsonText(String rawText) {

        String cleaned = rawText.strip();

        // Strip markdown code fences: ```json ... ``` or ``` ... ```
        if (cleaned.startsWith("```")) {
            cleaned = cleaned
                    .replaceFirst("^```(?:json)?\\s*", "")
                    .replaceFirst("\\s*```$", "");
        }

        // Extract the first complete JSON object if there's surrounding text
        Matcher matcher = JSON_OBJECT_PATTERN.matcher(cleaned);
        if (matcher.find()) {
            cleaned = matcher.group();
        }

        return cleaned.strip();
    }

    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File cannot be empty."
            );
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only image files are allowed."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File size cannot exceed 5 MB."
            );
        }
    }
}