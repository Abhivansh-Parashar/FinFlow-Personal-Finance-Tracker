package com.financetracker.controller;

import com.financetracker.dto.request.UpdateProfileRequest;
import com.financetracker.dto.response.ApiResponse;
import com.financetracker.dto.response.UserResponse;
import com.financetracker.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<String> changePassword(@RequestParam String oldPassword, @RequestParam String newPassword) {
        userService.changePassword(oldPassword, newPassword);

        return ResponseEntity.ok("Password changed successfully");
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount() {
        userService.deleteAccount();
        return ResponseEntity.noContent().build();
    }
    /**
     * POST /api/v1/users/me/profile-picture
     *
     * Accepts multipart/form-data with a "file" field.
     *
     * TODO:
     *  1. Add @PostMapping with consumes = MediaType.MULTIPART_FORM_DATA_VALUE
     *  2. Accept @RequestParam("file") MultipartFile file
     *  3. Call userService.uploadProfilePicture(file)
     *  4. Return 200 with ApiResponse.success("Profile picture updated", response)
     *
     * Test in Postman:
     *  POST http://localhost:8080/api/v1/users/me/profile-picture
     *  Body → form-data → key: "file", type: File, value: select image
     *  Headers → Authorization: Bearer <token>
     */
    @PostMapping(
            value = "/me/profile-picture",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<UserResponse>> uploadProfilePicture(
            @RequestParam("file") MultipartFile file) {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * DELETE /api/v1/users/me/profile-picture
     *
     * TODO:
     *  1. Add @DeleteMapping("/me/profile-picture")
     *  2. Call userService.deleteProfilePicture()
     *  3. Return 200 with ApiResponse.success("Profile picture removed", response)
     */
    @DeleteMapping("/me/profile-picture")
    public ResponseEntity<ApiResponse<UserResponse>> deleteProfilePicture() {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }
}