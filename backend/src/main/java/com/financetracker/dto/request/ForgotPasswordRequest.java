package com.financetracker.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Request body for POST /api/v1/auth/forgot-password
 *
 * TODO: No changes needed here — fields are complete.
 *       Just use this DTO in ForgotPasswordController.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ForgotPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;
}
