package com.financetracker.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * TODO: Add fields — name, email, password
 *       Add validation annotations: @NotBlank, @Email, @Size(min=8)
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {
    @NotBlank
    private String name;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 8, max = 100)
    private String password;
}
