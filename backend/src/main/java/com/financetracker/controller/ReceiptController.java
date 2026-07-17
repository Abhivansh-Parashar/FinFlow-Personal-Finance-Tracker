package com.financetracker.controller;

import com.financetracker.dto.AI.ReceiptExtractionResult;
import com.financetracker.entity.User;
import com.financetracker.service.ReceiptExtractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptExtractionService receiptExtractionService;

    @PostMapping(
            value = "/extract",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ReceiptExtractionResult> extractReceipt(

            @RequestParam("file") MultipartFile file,

            @AuthenticationPrincipal User user
    ) {

        ReceiptExtractionResult response =
                receiptExtractionService.extract(file, user);

        return ResponseEntity.ok(response);
    }
}