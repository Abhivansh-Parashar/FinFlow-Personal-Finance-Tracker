package com.financetracker.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.config.MistralProperties;
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

    private final WebClient mistralWebClient;
    private final MistralProperties mistralProperties;
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

        String response = callMistral(requestBody);

        return parseMistralResponse(response);
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

    private Map<String,Object> buildRequestBody(
            String base64Image,
            String mimeType,
            User user
    ){

        Map<String,Object> textContent = Map.of(
                "type",
                "text",
                "text",
                buildPrompt(user)
        );


        Map<String,Object> imageContent = Map.of(
                "type",
                "image_url",
                "image_url",
                Map.of(
                        "url",
                        "data:" + mimeType +
                                ";base64," +
                                base64Image
                )
        );


        Map<String,Object> message = Map.of(
                "role",
                "user",
                "content",
                List.of(
                        textContent,
                        imageContent
                )
        );


        return Map.of(
                "model",
                mistralProperties.model(),

                "messages",
                List.of(message),

                "temperature",
                0.1,

                "max_tokens",
                1024
        );
    }
    private String callMistral(
            Map<String,Object> requestBody
    ){

        return mistralWebClient.post()

                .uri(mistralProperties.url())

                .header(
                        "Authorization",
                        "Bearer " + mistralProperties.apiKey()
                )

                .bodyValue(requestBody)

                .retrieve()


                .onStatus(
                        HttpStatusCode::is4xxClientError,
                        response ->
                                Mono.error(
                                        new ResponseStatusException(
                                                response.statusCode(),
                                                "Mistral API error"
                                        )
                                )
                )


                .bodyToMono(String.class)

                .timeout(REQUEST_TIMEOUT)

                .block();
    }

    private ReceiptExtractionResult parseMistralResponse(String response) {

        try {

            JsonNode root = objectMapper.readTree(response);

            // Check if the model's response was truncated by the API
            String finishReason = root
                    .path("choices")
                    .path(0)
                    .path("finish_reason")
                    .asText("");

            if ("length".equals(finishReason) || "model_length".equals(finishReason)) {
                log.warn("Mistral response was truncated. Consider increasing max_tokens.");
            }

            JsonNode textNode = root
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content");

            if (textNode.isMissingNode() || textNode.asText().isBlank()) {

                log.error("Mistral returned empty response. Full API response: {}", response);

                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Mistral returned an empty response."
                );
            }

            String generatedJson = cleanJsonText(textNode.asText());

            log.debug("Cleaned Mistral JSON: {}", generatedJson);

            return objectMapper.readValue(
                    generatedJson,
                    ReceiptExtractionResult.class
            );

        } catch (JsonProcessingException e) {

            log.error("Failed to parse Mistral response. Raw response: {}", response, e);

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to parse Mistral response.",
                    e
            );
        }
    }

    /**
     * Cleans the raw text from Mistral — strips markdown code fences
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