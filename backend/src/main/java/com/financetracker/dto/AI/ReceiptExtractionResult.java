package com.financetracker.dto.AI;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ReceiptExtractionResult(

        BigDecimal amount,
        String merchant,
        LocalDate date,
        String suggestedCategory,
        String rawModelNotes
) {

}
