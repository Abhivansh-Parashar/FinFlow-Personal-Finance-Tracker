package com.financetracker.service;

/**
 * Service contract for the forgot-password / reset-password flow.
 */
public interface ForgotPasswordService {

    /**
     * Step 1 of the forgot-password flow.
     * Generates a reset token and sends it to the user's email.
     *
     * TODO:
     *  1. Look up user by email — if NOT found, still return success (don't reveal existence)
     *  2. Delete any existing tokens for this user (one token at a time)
     *  3. Generate a secure token: UUID.randomUUID().toString()
     *  4. Save a new PasswordResetToken:
     *       token = generated token
     *       user  = found user
     *       expiresAt = LocalDateTime.now().plusHours(1)
     *       used  = false
     *  5. Build reset link: frontendUrl + "/reset-password?token=" + token
     *  6. Send email with that link (use JavaMailSender — see application.properties TODO)
     *  7. Return a generic message: "If that email is registered, a reset link has been sent"
     *
     * @param email the email address entered by the user
     */
    void requestPasswordReset(String email);

    /**
     * Step 2 of the forgot-password flow.
     * Validates the token and sets a new password.
     *
     * TODO:
     *  1. Look up token in PasswordResetTokenRepository — throw exception if not found
     *  2. Check token.isUsed() — throw exception if already used
     *  3. Check token.getExpiresAt().isAfter(LocalDateTime.now()) — throw if expired
     *  4. Load the user from token.getUser()
     *  5. Encode and set the new password: user.setPassword(passwordEncoder.encode(newPassword))
     *  6. Save user
     *  7. Mark token as used: token.setUsed(true), save token
     *       OR: delete all tokens for this user via deleteAllByUserId()
     *
     * @param token       the reset token from the URL param
     * @param newPassword the new password chosen by the user
     */
    void resetPassword(String token, String newPassword);
}
