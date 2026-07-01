package com.financetracker.controller;

import com.financetracker.config.GoogleOAuthConfig;
import com.financetracker.dto.response.AuthResponse;
import com.financetracker.service.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

/**
 * Handles Google OAuth2 authorization-code flow.
 *
 * Two endpoints:
 *
 * GET /api/v1/auth/google
 *   - Called when user clicks "Continue with Google" in the frontend
 *   - Redirects browser to Google consent screen
 *
 * GET /api/v1/auth/google/callback
 *   - Google redirects here after user consents with ?code=...
 *   - Exchanges code for tokens, creates/loads user, issues JWT
 *   - Redirects to frontend login page with token in URL params
 *     so the React useEffect in Login.jsx can read it and log the user in
 *
 * TODO (Milestone — OAuth):
 *  1. Implement initiateGoogleLogin() — calls googleOAuthService.buildAuthorizationUrl()
 *     and returns a RedirectView to that URL
 *  2. Implement handleGoogleCallback() — calls googleOAuthService.loginWithCode(code)
 *     then builds redirect URL:
 *       config.getFrontendRedirectUri() + "?token=" + authResponse.getToken()
 *           + "&name=" + encode(authResponse.getName())
 *           + "&email=" + encode(authResponse.getEmail())
 *     Return RedirectView to that URL
 *  3. Add error handling — on any exception redirect to:
 *       config.getFrontendRedirectUri() + "?error=oauth_failed"
 *  4. Make sure /api/v1/auth/** is still public in SecurityConfig
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class GoogleOAuthController {

    private final GoogleOAuthService googleOAuthService;
    private final GoogleOAuthConfig googleOAuthConfig;

    // TODO: GET /google  → redirect to Google consent screen
    @GetMapping("/google")
    public RedirectView initiateGoogleLogin() {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }

    // TODO: GET /google/callback  → handle Google redirect, issue JWT, redirect to frontend
    @GetMapping("/google/callback")
    public RedirectView handleGoogleCallback(@RequestParam String code) {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
