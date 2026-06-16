package com.financetracker.controller;

import com.financetracker.dto.request.LoginRequest;
import com.financetracker.dto.request.RegisterRequest;
import com.financetracker.dto.response.ApiResponse;
import com.financetracker.dto.response.AuthResponse;
import com.financetracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 *
 * Base URL: /api/v1/auth
 *
 * TODO (Milestone 1):
 *  POST /register → call authService.register() → 201 CREATED
 *  POST /login    → call authService.login()    → 200 OK
 *
 * These endpoints must be PUBLICLY accessible (no JWT required).
 * Configure this in SecurityConfig.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request){
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request){
        return  ResponseEntity.ok(authService.login(request));
    }
}
