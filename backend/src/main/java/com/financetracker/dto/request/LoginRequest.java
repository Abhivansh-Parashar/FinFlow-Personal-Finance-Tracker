package com.financetracker.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * TODO: Add fields — email, password
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginRequest {
    @NotBlank
    @Email
    private String email;
    @NotBlank
    private  String password;
}
