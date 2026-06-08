package com.financetracker.config;

import com.financetracker.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration.
 *
 * TODO (Milestone 1):
 * 1. Disable CSRF (stateless JWT API doesn't need it)
 * 2. Set session policy to STATELESS
 * 3. Define public endpoints: /api/v1/auth/** (no JWT needed)
 * 4. Require authentication for everything else: anyRequest().authenticated()
 * 5. Add JwtAuthenticationFilter before UsernamePasswordAuthenticationFilter
 * 6. Configure CORS using the CorsConfig bean
 * 7. Expose AuthenticationManager as a @Bean
 * 8. Expose PasswordEncoder (BCryptPasswordEncoder) as a @Bean
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    // TODO: Implement SecurityFilterChain bean

    // TODO: Implement AuthenticationManager bean

    // TODO: Implement PasswordEncoder bean (BCrypt)

}
