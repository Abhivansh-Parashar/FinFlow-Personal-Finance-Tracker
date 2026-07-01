package com.financetracker.entity;

import com.financetracker.enums.TransactionType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank
    @Column(nullable = false)
    private String name;
    private String icon;
    private String color;
    @Enumerated(EnumType.STRING)
    private TransactionType type;
    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;
    private LocalDateTime createdAt;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    @OneToMany(mappedBy = "category")
    private List<Transaction> transactions;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
