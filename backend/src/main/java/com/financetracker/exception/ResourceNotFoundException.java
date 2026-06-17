package com.financetracker.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a requested entity is not found in the database.
 * Automatically results in a 404 response.
 *
 * Usage: throw new ResourceNotFoundException("Transaction", "id", id);
 *
 * TODO: Add constructor(String resourceName, String fieldName, Object fieldValue)
 *       Build a meaningful message: "Transaction not found with id: 42"
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(resourceName + " not found with " + fieldName + ": " + fieldValue);
    }
    public ResourceNotFoundException(String message){
        super(message);
    }
}
