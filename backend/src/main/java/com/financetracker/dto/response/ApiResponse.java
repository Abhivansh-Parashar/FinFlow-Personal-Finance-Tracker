package com.financetracker.dto.response;

import lombok.*;

/**
 * Generic wrapper for all API responses.
 * Usage: return ResponseEntity.ok(ApiResponse.success("Transaction created", data));
 *
 * TODO: Add fields — success (boolean), message, data (T), timestamp
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiResponse<T> {

    // TODO: Add fields

    public static <T> ApiResponse<T> success(String message, T data) {
        // TODO: Implement
        return null;
    }

    public static <T> ApiResponse<T> error(String message) {
        // TODO: Implement
        return null;
    }
}
