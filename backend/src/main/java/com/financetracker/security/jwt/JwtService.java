package com.financetracker.security.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;


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

    @Value("${app.jwt.secret}")
    private String secretKey;
    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
                secretKey.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(UserDetails userDetails) {
        String token = Jwts
            .builder()
                .subject(userDetails.getUsername())
                    .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();

        return token;
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        if(username.equals(userDetails.getUsername()) && !isTokenExpired(token)){
            return true;
        }
        return false;
    }

    public String extractUsername(String token) {
        return Jwts
                .parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    private boolean isTokenExpired(String token) {
        Date expiry =  Jwts
                .parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();

        return expiry.before(new Date());
    }
}
