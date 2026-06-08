package com.financetracker.dto.request;

import com.financetracker.enums.TransactionType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * TODO: Add fields — description, amount, transactionType, date, categoryId, note
 *       Add: @NotBlank, @Positive, @NotNull, @PastOrPresent
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TransactionRequest {
    // TODO: Add fields
}
