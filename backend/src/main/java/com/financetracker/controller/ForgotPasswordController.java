package com.financetracker.controller;

import com.financetracker.dto.request.ForgotPasswordRequest;
import com.financetracker.dto.request.ResetPasswordRequest;
import com.financetracker.dto.response.ApiResponse;
import com.financetracker.service.ForgotPasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Handles the forgot-password / reset-password flow.
 *
 * Both endpoints are PUBLIC — no JWT required.
 * Make sure /api/v1/auth/** is permitted in SecurityConfig (it already is).
 *
 * TODO (Milestone — Forgot Password):
 *
 * POST /api/v1/auth/forgot-password
 *   1. Accept ForgotPasswordRequest (@Valid @RequestBody)
 *   2. Call forgotPasswordService.requestPasswordReset(request.getEmail())
 *   3. Always return 200 with a generic message:
 *        "If that email is registered, a reset link has been sent"
 *      (never reveal whether the email exists)
 *
 * POST /api/v1/auth/reset-password
 *   1. Accept ResetPasswordRequest (@Valid @RequestBody)
 *   2. Call forgotPasswordService.resetPassword(request.getToken(), request.getNewPassword())
 *   3. Return 200 with message: "Password reset successfully"
 *   4. Catch token-not-found / expired / already-used exceptions → return 400 with error message
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    // TODO: implement POST /forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<?>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        forgotPasswordService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(
                ApiResponse.success(
                        "If an account with that email exists, a reset link has been sent.",
                        null
                )
        );
    }

    // TODO: implement POST /reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<?>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        forgotPasswordService.resetPassword(
                request.getToken(),
                request.getNewPassword()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "If an account with that email exists, a reset link has been sent.",
                        null
                )
        );
    }
}
