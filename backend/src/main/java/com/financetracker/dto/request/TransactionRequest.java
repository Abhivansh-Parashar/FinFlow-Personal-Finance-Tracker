package com.financetracker.dto.request;

import com.financetracker.enums.TransactionType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * TODO: Add fields — description, amount, transactionType, date, categoryId, note
 *       Add: @NotBlank, @Positive, @NotNull, @PastOrPresent
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TransactionRequest {
    @NotBlank
    private String description;
    @NotNull @Positive
    private BigDecimal amount;
    @NotNull
    private TransactionType transactionType;
    @PastOrPresent @NotNull
    private LocalDateTime date;
    @NotNull
    private Long categoryId;
    private String note;

}
