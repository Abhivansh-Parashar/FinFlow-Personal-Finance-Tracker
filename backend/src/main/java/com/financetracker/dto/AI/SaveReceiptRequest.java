package com.financetracker.dto.AI;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SaveReceiptRequest(
        BigDecimal amount,
        String merchant,
        LocalDate date,
        String categoryName

) {}