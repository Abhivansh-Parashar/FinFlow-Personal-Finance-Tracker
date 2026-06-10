package com.financetracker.dto.response;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Generic wrapper for all API responses.
 * Usage: return ResponseEntity.ok(ApiResponse.success("Transaction created", data));
 *
 * TODO: Add fields — success (boolean), message, data (T), timestamp
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(String message, T data) {

        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {

        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
