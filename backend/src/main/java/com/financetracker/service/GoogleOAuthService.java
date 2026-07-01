package com.financetracker.service;

import com.financetracker.dto.response.AuthResponse;

/**
 * Service contract for the Google OAuth2 authorization-code flow.
 *
 * Flow overview:
 *   Browser → GET /api/v1/auth/google
 *           → backend builds Google consent URL → redirects browser to Google
 *   Google  → GET /api/v1/auth/google/callback?code=...
 *           → backend exchanges code for tokens → fetches user info
 *           → creates/loads User → issues app JWT
 *           → redirects browser to frontend with token in URL params
 */
public interface GoogleOAuthService {

    /**
     * Build the Google consent-screen URL to redirect the user to.
     *
     * TODO:
     *  1. Read clientId, redirectUri, scope from GoogleOAuthConfig
     *  2. Construct URL with query params:
     *       response_type=code
     *       client_id=...
     *       redirect_uri=...
     *       scope=openid email profile
     *       access_type=offline  (optional — needed for refresh tokens)
     *  3. URL-encode all params (use UriComponentsBuilder from Spring)
     *  4. Return the full URL string
     */
    String buildAuthorizationUrl();

    /**
     * Exchange the authorization code Google returned for a local app JWT.
     *
     * TODO:
     *  1. POST to Google token endpoint with:
     *       code, client_id, client_secret, redirect_uri, grant_type=authorization_code
     *  2. Parse the access_token from the response
     *  3. GET https://www.googleapis.com/oauth2/v3/userinfo with Bearer access_token
     *  4. Read email and name from userinfo response
     *  5. Check if user with that email already exists in UserRepository
     *       - If yes  → load user (link accounts if they registered with email/password)
     *       - If no   → create new User with a random BCrypt password,
     *                   set provider="GOOGLE", role=ROLE_USER, save to DB
     *  6. Generate app JWT via JwtService.generateToken(user)
     *  7. Return AuthResponse with token + user details
     *
     * @param code  the authorization code from Google callback
     */
    AuthResponse loginWithCode(String code);
}
