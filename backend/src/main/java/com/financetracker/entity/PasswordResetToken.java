package com.financetracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Stores a one-time password-reset token tied to a user.
 *
 * TODO (Milestone — Forgot Password):
 *  - This entity creates a password_reset_tokens table via JPA
 *  - Fields are already complete below — just implement the service logic
 *
 * Security notes:
 *  - token is stored as plain UUID here for simplicity.
 *    For production, store a BCrypt hash and compare on verify.
 *  - expiresAt should be set to now + 1 hour when token is created.
 *  - used flag ensures the token can only be consumed once.
 */
@Entity
@Table(name="password_reset_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        used = false;
    }
}
