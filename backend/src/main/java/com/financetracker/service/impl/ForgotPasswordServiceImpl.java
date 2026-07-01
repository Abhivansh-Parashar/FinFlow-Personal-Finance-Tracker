package com.financetracker.service.impl;

import com.financetracker.entity.PasswordResetToken;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.PasswordResetTokenRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.service.ForgotPasswordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementation of {@link ForgotPasswordService}.
 *
 * Before implementing, add these to application.properties:
 *
 *   # Email (use Gmail app password for local dev)
 *   spring.mail.host=smtp.gmail.com
 *   spring.mail.port=587
 *   spring.mail.username=your-email@gmail.com
 *   spring.mail.password=your-app-password
 *   spring.mail.properties.mail.smtp.auth=true
 *   spring.mail.properties.mail.smtp.starttls.enable=true
 *   app.frontend-url=http://localhost:3000
 *
 * Also add to pom.xml:
 *   <dependency>
 *       <groupId>org.springframework.boot</groupId>
 *       <artifactId>spring-boot-starter-mail</artifactId>
 *   </dependency>
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ForgotPasswordServiceImpl implements ForgotPasswordService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void requestPasswordReset(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if(userOptional.isEmpty()){
            log.info("Password requested for an non existing email: {}", email);
            return;
        }

        User user = userOptional.get();
        String token = UUID.randomUUID().toString();
        log.info("Password reset token created for user {}", user.getId());

        PasswordResetToken passwordResetToken = PasswordResetToken
                .builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();

        tokenRepository.save(passwordResetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        sendResetEmail(user.getEmail(), resetLink);
        log.info("Password reset process completed for user {}", user.getId());
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        log.info("Password reset requested with token.");
        Optional<PasswordResetToken> passwordResetTokenOptional = tokenRepository.findByToken(token);

        if(passwordResetTokenOptional.isEmpty()){
            log.warn("Invalid password reset token received.");
            throw new ResourceNotFoundException("Invalid password reset token.");
        }

        PasswordResetToken passwordResetToken = passwordResetTokenOptional.get();

        if (passwordResetToken.isUsed()) {
            log.warn("Attempt to reuse password reset token.");
            throw new IllegalStateException(
                    "This password reset link has already been used."
            );
        }

        if (passwordResetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Expired password reset token.");
            throw new IllegalStateException(
                    "Password reset link has expired."
            );
        }

        User user = passwordResetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        log.info("Password updated for user {}", user.getId());

        userRepository.save(user);

        passwordResetToken.setUsed(true);
        tokenRepository.deleteAllByUserId(user.getId());

    }

    private void sendResetEmail(String toEmail, String resetLink) {
         SimpleMailMessage message = new SimpleMailMessage();
         message.setTo(toEmail);
         message.setSubject("FinFlow — Password Reset Request");
         message.setText("Click the link below to reset your password:\n\n" + resetLink
                 + "\n\nThis link expires in 1 hour. If you did not request this, ignore this email.");
        try {
            mailSender.send(message);
            log.info("Password reset email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", toEmail, e);
            throw e;
        }
     }
}
