package com.financetracker.controller;

import com.financetracker.dto.request.UpdateProfileRequest;
import com.financetracker.dto.response.ApiResponse;
import com.financetracker.dto.response.UserResponse;
import com.financetracker.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for user profile.
 *
 * Base URL: /api/v1/users
 *
 * TODO (Milestone 7):
 *  GET    /me           → getProfile()            → 200
 *  PUT    /me           → updateProfile()          → 200
 *  PUT    /me/password  → changePassword()         → 200
 *  DELETE /me           → deleteAccount()          → 204
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // TODO: Implement endpoints

}
