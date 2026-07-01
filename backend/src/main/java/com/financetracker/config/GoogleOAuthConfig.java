package com.financetracker.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Holds all Google OAuth2 config values from application.properties.
 *
 * Add these to application.properties (do NOT commit real secrets):
 *   app.oauth.google.client-id=YOUR_GOOGLE_CLIENT_ID
 *   app.oauth.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
 *   app.oauth.google.redirect-uri=http://localhost:8080/api/v1/auth/google/callback
 *   app.oauth.google.frontend-redirect-uri=http://localhost:3000/login
 *
 * TODO (Milestone — OAuth):
 *  - Add the properties above to application.properties
 *  - Replace placeholder values with real credentials from Google Cloud Console
 *  - Add @Validated and @NotBlank on fields for fail-fast startup validation
 */
@Configuration
@ConfigurationProperties(prefix = "app.oauth.google")
@Getter
@Setter
public class GoogleOAuthConfig {

    // TODO: inject from application.properties via @ConfigurationProperties above
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String frontendRedirectUri;

    // Google's fixed OAuth endpoints — no need to change these
    public static final String AUTHORIZATION_URI = "https://accounts.google.com/o/oauth2/v2/auth";
    public static final String TOKEN_URI         = "https://oauth2.googleapis.com/token";
    public static final String USERINFO_URI      = "https://www.googleapis.com/oauth2/v3/userinfo";
}
