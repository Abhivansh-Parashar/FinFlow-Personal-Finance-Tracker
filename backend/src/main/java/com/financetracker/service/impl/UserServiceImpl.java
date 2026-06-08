package com.financetracker.service.impl;

import com.financetracker.dto.request.UpdateProfileRequest;
import com.financetracker.dto.response.UserResponse;
import com.financetracker.repository.UserRepository;
import com.financetracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of {@link UserService}.
 *
 * TODO (Milestone 7):
 *  - getProfile(): get user from SecurityContext → map to UserResponse DTO
 *  - updateProfile(): validate and update allowed fields (name, currency, budget)
 *  - changePassword():
 *    1. Load current user
 *    2. Verify oldPassword: passwordEncoder.matches(oldPassword, user.getPassword())
 *    3. Encode and set new password
 *    4. Save user
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile() {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public UserResponse updateProfile(UpdateProfileRequest request) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public void changePassword(String oldPassword, String newPassword) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public void deleteAccount() {
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
