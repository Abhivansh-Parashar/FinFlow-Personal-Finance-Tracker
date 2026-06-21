package com.financetracker.entity;

import com.financetracker.enums.TransactionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.math.BigDecimal;
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
@Table(name = "transacctions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank
    private String description;
    @NotNull @Positive
    private BigDecimal amount;
    @Enumerated(EnumType.STRING)
    @NotNull
    private TransactionType transactionType;
    private LocalDateTime date;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @PrePersist
    private void onCreate(){
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    private void onUpdate(){
        updatedAt = LocalDateTime.now();
    }

    public BigDecimal get() {
        return null;
    }
}
