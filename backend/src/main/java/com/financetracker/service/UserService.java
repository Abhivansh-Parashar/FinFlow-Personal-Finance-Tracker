package com.financetracker.service;

import com.financetracker.dto.request.UpdateProfileRequest;
import com.financetracker.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

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

    /**
     * Upload or replace the authenticated user's profile picture.
     *
     * TODO:
     *  1. Get current user from SecurityContext
     *  2. If user.profilePictureUrl is not null → call fileStorageService.deleteFile()
     *  3. Call fileStorageService.saveProfilePicture(file, user.getId())
     *  4. Set user.setProfilePictureUrl(returnedUrl)
     *  5. Save user to DB
     *  6. Return mapped UserResponse
     */
    UserResponse uploadProfilePicture(MultipartFile file) throws IOException;

    /**
     * Remove the authenticated user's profile picture.
     *
     * TODO:
     *  1. Get current user from SecurityContext
     *  2. If profilePictureUrl is null → throw ResourceNotFoundException("No profile picture set")
     *  3. Call fileStorageService.deleteFile(user.getProfilePictureUrl())
     *  4. Set user.setProfilePictureUrl(null)
     *  5. Save user to DB
     *  6. Return mapped UserResponse
     */
    UserResponse deleteProfilePicture();
}
