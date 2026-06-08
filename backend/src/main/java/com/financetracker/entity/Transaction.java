package com.financetracker.entity;

import com.financetracker.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a single financial transaction (income or expense).
 *
 * TODO (Milestone 3 — Transactions):
 *  - Add fields: id, description, amount, transactionType, date, note, createdAt, updatedAt
 *  - Add @ManyToOne to User and Category
 *  - Add @NotNull, @Positive, @NotBlank validations
 */
@Entity
@Table(name = "transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {

    // TODO: Add your entity fields here

}
