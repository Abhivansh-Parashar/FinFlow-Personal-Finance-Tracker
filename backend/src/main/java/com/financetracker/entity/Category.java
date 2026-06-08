package com.financetracker.entity;

import com.financetracker.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents a transaction category (e.g. "Food", "Salary").
 *
 * TODO (Milestone 2 — Categories):
 *  - Add fields: id, name, icon, color, type (INCOME/EXPENSE), isDefault, createdAt
 *  - Add @ManyToOne to User (nullable — null means system/default category)
 *  - Add @OneToMany to Transaction
 */
@Entity
@Table(name = "categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category {

    // TODO: Add your entity fields here

}
