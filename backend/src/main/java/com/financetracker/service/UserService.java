package com.financetracker.service;

import com.financetracker.dto.request.UpdateProfileRequest;
import com.financetracker.dto.response.UserResponse;

/**
 * Service contract for user profile management.
 *
 * TODO (Milestone 7 — Profile):
 *  - getProfile(): load authenticated user from SecurityContextHolder, map to DTO
 *  - updateProfile(): allow updating name, currency, monthlyBudget
 *  - changePassword(): verify old password, encode new password, save
 *  - deleteAccount(): soft-delete or hard-delete user and all associated data
 */
public interface UserService {

    UserResponse getProfile();

    UserResponse updateProfile(UpdateProfileRequest request);

    void changePassword(String oldPassword, String newPassword);

    void deleteAccount();
}
