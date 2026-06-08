package com.financetracker.exception;

import com.financetracker.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * Centralized exception handler using @RestControllerAdvice.
 * All unhandled exceptions are caught here and returned as structured JSON.
 *
 * TODO (Milestone 1):
 *  Handle:
 *  - ResourceNotFoundException        → 404 with message
 *  - MethodArgumentNotValidException  → 400 with field-level validation errors
 *  - AccessDeniedException            → 403
 *  - BadCredentialsException          → 401
 *  - Exception (catch-all)            → 500 "Internal server error"
 *
 * Return ApiResponse.error(message) for all handlers.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleResourceNotFound(ResourceNotFoundException ex) {
        // TODO: Implement
        return null;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        // TODO: Extract field errors and return 400
        return null;
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGenericException(Exception ex) {
        // TODO: Log and return 500
        return null;
    }
}
