package com.financetracker.security.jwt;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

/**
 * Service for JWT token generation, validation, and extraction.
 *
 * TODO (Milestone 1 — JWT):
 *
 * generateToken(UserDetails userDetails):
 *   - Use Jwts.builder()
 *   - Set subject = userDetails.getUsername() (email)
 *   - Set issuedAt = new Date()
 *   - Set expiration = new Date(now + jwtExpirationMs)
 *   - Sign with HS256 and the secret key
 *   - Return .compact()
 *
 * isTokenValid(String token, UserDetails userDetails):
 *   - Extract username from token
 *   - Check: username equals userDetails.getUsername() && !isTokenExpired(token)
 *
 * extractUsername(String token):
 *   - Parse claims → getSubject()
 *
 * Key concept: @Value("${app.jwt.secret}") injects value from application.properties
 */
@Service
public class JwtService {

    // TODO: @Value("${app.jwt.secret}") private String secretKey;
    // TODO: @Value("${app.jwt.expiration-ms}") private long jwtExpirationMs;

    public String generateToken(UserDetails userDetails) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    public String extractUsername(String token) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    private boolean isTokenExpired(String token) {
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
