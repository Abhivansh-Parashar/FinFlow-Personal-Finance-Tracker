package com.financetracker.service.impl;

import com.financetracker.dto.request.LoginRequest;
import com.financetracker.dto.request.RegisterRequest;
import com.financetracker.dto.response.AuthResponse;
import com.financetracker.entity.User;
import com.financetracker.enums.Role;
import com.financetracker.exception.DuplicateResourceException;
import com.financetracker.repository.UserRepository;
import com.financetracker.security.jwt.JwtService;
import com.financetracker.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

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
        String email = request.getEmail();
        Optional<User> user = userRepository.findByEmail(email);

        if(user.isPresent()){
            throw new DuplicateResourceException("User already exists");
        }

        User newUser = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_USER)
                .build();

        userRepository.save(newUser);

        String token = jwtService.generateToken(newUser);

        return AuthResponse.builder()
                .email(newUser.getEmail())
                .name(newUser.getName())
                .token(token)
                .userId(newUser.getId())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());

        authenticationManager.authenticate(authentication);

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(request.getEmail())
                .userId(user.getId())
                .name(user.getName())
                .build();
    }
}
