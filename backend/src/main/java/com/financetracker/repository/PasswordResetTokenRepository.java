package com.financetracker.repository;

import com.financetracker.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository for password reset tokens.
 *
 * TODO (Milestone — Forgot Password):
 *  Methods are already declared — just inject this repository into ForgotPasswordServiceImpl
 *  and call them in the right order.
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    // Delete all tokens for a user (call this after successful reset)
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.user.id = :userId")
    void deleteAllByUserId(Long userId);

    // Cleanup job — delete tokens older than 24 hours (optional, good practice)
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(LocalDateTime now);
}
