package com.financetracker.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when trying to create a duplicate resource (e.g. email already registered).
 * Results in a 409 CONFLICT response.
 *
 * Usage: throw new DuplicateResourceException("Email already registered");
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
