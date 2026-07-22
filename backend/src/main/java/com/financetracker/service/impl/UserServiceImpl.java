package com.financetracker.service.impl;

import com.financetracker.dto.request.UpdateProfileRequest;
import com.financetracker.dto.response.UserResponse;
import com.financetracker.entity.User;
import com.financetracker.repository.UserRepository;
import com.financetracker.service.FileStorageService;
import com.financetracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static com.financetracker.util.SecurityUtils.getCurrentUser;


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
    private final FileStorageService fileStorageService;

    private UserResponse mapToUserResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .currency(user.getCurrency())
                .monthlyBudget(user.getMonthlyBudget())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .profilePictureUrl(user.getProfilePictureUrl())
                .theme(user.getTheme() != null ? user.getTheme() : "Dark")
                .language(user.getLanguage() != null ? user.getLanguage() : "English")
                .dateFormat(user.getDateFormat() != null ? user.getDateFormat() : "DD/MM/YYYY")
                .financialYearStart(user.getFinancialYearStart() != null ? user.getFinancialYearStart() : "April")
                .budgetAlerts(user.getBudgetAlerts() != null ? user.getBudgetAlerts() : true)
                .txnReminders(user.getTxnReminders() != null ? user.getTxnReminders() : true)
                .monthlySummary(user.getMonthlySummary() != null ? user.getMonthlySummary() : true)
                .largeTxnAlert(user.getLargeTxnAlert() != null ? user.getLargeTxnAlert() : true)
                .weeklyReport(user.getWeeklyReport() != null ? user.getWeeklyReport() : false)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile() {
        User user = getCurrentUser();
        return mapToUserResponse(user);
    }

    @Override
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

        user.setName(request.getName());
        user.setCurrency(request.getCurrency());
        user.setMonthlyBudget(request.getMonthlyBudget());

        if (request.getTheme() != null) user.setTheme(request.getTheme());
        if (request.getLanguage() != null) user.setLanguage(request.getLanguage());
        if (request.getDateFormat() != null) user.setDateFormat(request.getDateFormat());
        if (request.getFinancialYearStart() != null) user.setFinancialYearStart(request.getFinancialYearStart());
        if (request.getBudgetAlerts() != null) user.setBudgetAlerts(request.getBudgetAlerts());
        if (request.getTxnReminders() != null) user.setTxnReminders(request.getTxnReminders());
        if (request.getMonthlySummary() != null) user.setMonthlySummary(request.getMonthlySummary());
        if (request.getLargeTxnAlert() != null) user.setLargeTxnAlert(request.getLargeTxnAlert());
        if (request.getWeeklyReport() != null) user.setWeeklyReport(request.getWeeklyReport());

        userRepository.save(user);

        return mapToUserResponse(user);
    }

    @Override
    public void changePassword(String oldPassword, String newPassword) {
        User user = getCurrentUser();

        Boolean passwordMatched = passwordEncoder.matches(oldPassword, user.getPassword());

        if(!passwordMatched){
            throw new BadCredentialsException("Old password is wrong.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

    }

    @Override
    public void deleteAccount() {
        User user = getCurrentUser();

        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserResponse uploadProfilePicture(MultipartFile file) throws IOException {
        User user = getCurrentUser();
        String newProfilePictureUrl = fileStorageService.saveProfilePicture(
                file,
                user.getId()
        );

        // Delete old picture file before replacing
        fileStorageService.deleteFile(user.getProfilePictureUrl());

        // Persist the new URL on the user entity
        user.setProfilePictureUrl(newProfilePictureUrl);
        userRepository.save(user);

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse deleteProfilePicture() {
        User user = getCurrentUser();
        fileStorageService.deleteFile(
                user.getProfilePictureUrl()
        );
        user.setProfilePictureUrl(null);
        userRepository.save(user);

        return mapToUserResponse(user);
    }

}
