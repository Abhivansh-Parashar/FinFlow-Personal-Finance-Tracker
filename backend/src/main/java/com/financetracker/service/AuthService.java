package com.financetracker.service;

import com.financetracker.dto.request.LoginRequest;
import com.financetracker.dto.request.RegisterRequest;
import com.financetracker.dto.response.AuthResponse;

/**
 * Service contract for authentication operations.
 *
 * TODO (Milestone 1 — User Auth):
 *  - register(): validate email uniqueness, hash password with BCrypt, save User, return JWT
 *  - login(): load user by email, verify password, generate JWT token, return AuthResponse
 *
 * Key Spring concepts to use:
 *  - PasswordEncoder (BCryptPasswordEncoder)
 *  - AuthenticationManager (authenticate())
 *  - JwtService (generateToken())
 */
public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
