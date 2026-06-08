package com.financetracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;

/**
 * Represents a monthly spending budget for a category.
 *
 * TODO (Milestone 5 — Budget):
 *  - Add fields: id, budgetAmount, spentAmount (computed/cached), month (YearMonth), createdAt, updatedAt
 *  - Add @ManyToOne to User and Category
 *  - Add unique constraint: (user_id, category_id, month)
 */
@Entity
@Table(name = "budgets", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "category_id", "month"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Budget {

    // TODO: Add your entity fields here

}
