package com.financetracker.entity;

import com.financetracker.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents an application user.
 *
 * TODO (Milestone 1 — User Auth):
 *  - Add fields: id, name, email, password, role, currency, monthlyBudget, createdAt, updatedAt
 *  - Add @OneToMany relationships to Transaction, Budget, Category
 *  - Implement UserDetails interface for Spring Security
 */
@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    // TODO: Add your entity fields here

}
