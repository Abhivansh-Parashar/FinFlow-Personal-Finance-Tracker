package com.financetracker.service.impl;

import com.financetracker.config.GoogleOAuthConfig;
import com.financetracker.dto.response.AuthResponse;
import com.financetracker.repository.UserRepository;
import com.financetracker.security.jwt.JwtService;
import com.financetracker.service.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of {@link GoogleOAuthService}.
 *
 * TODO — implement in this order:
 *
 * Step 1 — buildAuthorizationUrl()
 *   Use UriComponentsBuilder:
 *     return UriComponentsBuilder
 *         .fromHttpUrl(GoogleOAuthConfig.AUTHORIZATION_URI)
 *         .queryParam("response_type", "code")
 *         .queryParam("client_id", config.getClientId())
 *         .queryParam("redirect_uri", config.getRedirectUri())
 *         .queryParam("scope", "openid email profile")
 *         .queryParam("access_type", "offline")
 *         .build().toUriString();
 *
 * Step 2 — loginWithCode(String code)
 *   Use RestTemplate (inject it — declare a @Bean in ApplicationConfig):
 *
 *   2a. Exchange code for tokens:
 *     HttpHeaders headers = new HttpHeaders();
 *     headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
 *     MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
 *     params.add("code", code);
 *     params.add("client_id", config.getClientId());
 *     params.add("client_secret", config.getClientSecret());
 *     params.add("redirect_uri", config.getRedirectUri());
 *     params.add("grant_type", "authorization_code");
 *     ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(
 *         GoogleOAuthConfig.TOKEN_URI,
 *         new HttpEntity<>(params, headers),
 *         Map.class
 *     );
 *     String accessToken = (String) tokenResponse.getBody().get("access_token");
 *
 *   2b. Fetch user info:
 *     HttpHeaders authHeader = new HttpHeaders();
 *     authHeader.setBearerAuth(accessToken);
 *     ResponseEntity<Map> userInfoResponse = restTemplate.exchange(
 *         GoogleOAuthConfig.USERINFO_URI,
 *         HttpMethod.GET,
 *         new HttpEntity<>(authHeader),
 *         Map.class
 *     );
 *     String email = (String) userInfoResponse.getBody().get("email");
 *     String name  = (String) userInfoResponse.getBody().get("name");
 *
 *   2c. Create or load user:
 *     User user = userRepository.findByEmail(email).orElseGet(() -> {
 *         User newUser = User.builder()
 *             .email(email)
 *             .name(name)
 *             .password(passwordEncoder.encode(UUID.randomUUID().toString()))
 *             .role(Role.ROLE_USER)
 *             .provider("GOOGLE")
 *             .currency("₹")
 *             .build();
 *         return userRepository.save(newUser);
 *     });
 *
 *   2d. Generate JWT and return:
 *     String token = jwtService.generateToken(user);
 *     return AuthResponse.builder()
 *         .token(token)
 *         .name(user.getName())
 *         .email(user.getEmail())
 *         .build();
 *
 * Note: Add 'provider' field to User entity (String, nullable) before implementing step 2c.
 * Note: Add RestTemplate @Bean in ApplicationConfig.java before injecting it here.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class GoogleOAuthServiceImpl implements GoogleOAuthService {

    private final GoogleOAuthConfig config;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    // TODO: inject RestTemplate once you add the @Bean in ApplicationConfig

    @Override
    public String buildAuthorizationUrl() {
        // TODO: implement — see Javadoc above
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public AuthResponse loginWithCode(String code) {
        // TODO: implement — see Javadoc above
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
