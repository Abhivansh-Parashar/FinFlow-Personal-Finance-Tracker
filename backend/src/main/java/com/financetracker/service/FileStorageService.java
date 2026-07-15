package com.financetracker.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Service for handling file storage operations.
 *
 * Used for profile picture upload and deletion.
 */
public interface FileStorageService {

    /**
     * Saves a profile picture and returns its accessible URL.
     *
     * TODO:
     *  1. Validate file is not empty
     *  2. Validate content type is one of: image/jpeg, image/png, image/webp
     *  3. Validate file size does not exceed app.file.max-size-mb
     *  4. Generate unique filename → "user_" + userId + "_" + UUID + extension
     *  5. Save file to: {app.file.upload-dir}/avatars/filename
     *  6. Return URL: "http://localhost:8080/uploads/avatars/" + filename
     */
    String saveProfilePicture(MultipartFile file, Long userId) throws IOException;

    /**
     * Deletes a previously saved file by its URL.
     *
     * TODO:
     *  1. Return early if fileUrl is null or blank
     *  2. Extract filename from the URL (after last '/')
     *  3. Build full path: {app.file.upload-dir}/avatars/filename
     *  4. Delete the file if it exists
     *  5. Log a warning if deletion fails — do NOT throw exception
     *     (file deletion failure should never break the main request)
     */
    void deleteFile(String fileUrl);
}