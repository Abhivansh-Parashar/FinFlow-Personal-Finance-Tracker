package com.financetracker.service;

import com.financetracker.dto.AI.ReceiptExtractionResult;
import com.financetracker.entity.User;
import org.springframework.web.multipart.MultipartFile;

public interface ReceiptExtractionService {

    ReceiptExtractionResult extract(
            MultipartFile file,
            User user
    );

}