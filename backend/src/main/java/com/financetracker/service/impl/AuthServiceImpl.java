package com.financetracker.service.impl;

import com.financetracker.dto.request.LoginRequest;
import com.financetracker.dto.request.RegisterRequest;
import com.financetracker.dto.response.AuthResponse;
import com.financetracker.repository.UserRepository;
import com.financetracker.security.jwt.JwtService;
import com.financetracker.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of {@link AuthService}.
 *
 * TODO (Milestone 1 — User Auth):
 * Step 1 — register():
 *   1. Check if email already exists via userRepository.existsByEmail() → throw exception if yes
 *   2. Build a new User object from the request
 *   3. Encode the password: passwordEncoder.encode(request.getPassword())
 *   4. Set role to ROLE_USER
 *   5. Save the user: userRepository.save(user)
 *   6. Generate JWT: jwtService.generateToken(user)
 *   7. Return new AuthResponse(token, userDetails)
 *
 * Step 2 — login():
 *   1. Call authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(...))
 *      This throws BadCredentialsException automatically if wrong password
 *   2. Load user: userRepository.findByEmail(request.getEmail())
 *   3. Generate JWT: jwtService.generateToken(user)
 *   4. Return AuthResponse
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        // TODO: Implement registration logic
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // TODO: Implement login logic
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
