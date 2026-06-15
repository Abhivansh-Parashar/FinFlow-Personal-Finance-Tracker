package com.financetracker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

/**
 * CORS configuration to allow the React frontend to call the API.
 *
 * TODO (Milestone 1):
 *  - Allow origins from ${app.cors.allowed-origins} (http://localhost:3000)
 *  - Allow methods: GET, POST, PUT, DELETE, OPTIONS
 *  - Allow all headers
 *  - Allow credentials: true
 *  - Apply to all paths: /**
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedMethods(List.of("GET", "PUT", "POST", "DELETE", "OPTIONS"));
        config.setAllowedOrigins(List.of(allowedOrigins));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
