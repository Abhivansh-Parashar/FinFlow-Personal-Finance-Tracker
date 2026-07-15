package com.financetracker.service.impl;

import com.financetracker.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * Local disk implementation of FileStorageService.
 *
 * Stores files in {app.file.upload-dir}/avatars/ on the server disk.
 * Files are served as static resources via WebConfig.
 *
 * TODO — implement in this order:
 *
 * Step 1 — Add @Value fields:
 *   @Value("${app.file.upload-dir:./uploads}") String uploadDir
 *   @Value("${app.file.max-size-mb:5}") long maxSizeMb
 *   @Value("${server.port:8080}") String serverPort
 *
 * Step 2 — Add constants:
 *   List<String> ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
 *   List<String> ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]
 *
 * Step 3 — Implement @PostConstruct init():
 *   Create directory: Paths.get(uploadDir, "avatars")
 *   Use Files.createDirectories() — creates all parent dirs if missing
 *   Throw RuntimeException if creation fails
 *
 * Step 4 — Implement saveProfilePicture():
 *   a. Validate file not empty → throw IllegalArgumentException
 *   b. Validate content type → throw IllegalArgumentException
 *   c. Validate size: file.getSize() / (1024 * 1024) > maxSizeMb
 *      → throw IllegalArgumentException
 *   d. Extract extension from original filename (after last '.')
 *      → default to ".jpg" if extension not in ALLOWED_EXTENSIONS
 *   e. Generate filename: "user_" + userId + "_" + UUID.randomUUID() + extension
 *   f. Copy file to disk:
 *      Path target = Paths.get(uploadDir, "avatars", filename)
 *      Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING)
 *   g. Return: "http://localhost:" + serverPort + "/uploads/avatars/" + filename
 *
 * Step 5 — Implement deleteFile():
 *   a. Guard: if null or blank → return
 *   b. filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1)
 *   c. Path = Paths.get(uploadDir, "avatars", filename)
 *   d. if Files.exists(path) → Files.delete(path)
 *   e. Wrap in try-catch → log.warn on IOException, don't rethrow
 */
@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.file.upload-dir:./uploads}")
    private String uploadDir;
    @Value("${app.file.max-size-mb:5}")
    private long maxSizeMb;
    @Value("${server.port:8080}")
    private String serverPort;

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );
    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
    );

    @PostConstruct
    public void init(){
        Path uploadPath = Paths.get(uploadDir, "avatars");
        try {
            Files.createDirectories(uploadPath);
        } catch(IOException e){
            throw new RuntimeException("Failed to create upload directory.", e);
        }
    }

    @Override
    public String saveProfilePicture(MultipartFile file, Long userId) throws IOException {
        if(file.isEmpty()){
            throw new IllegalArgumentException("File cannot be empty.");
        }

        if(!ALLOWED_TYPES.contains(file.getContentType())){
            throw  new IllegalArgumentException("File type not supported.");
        }

        long uploadedSize = (file.getSize() / (1024 * 1024));
        if(uploadedSize > maxSizeMb){
            throw new IllegalArgumentException("File size too large.");
        }

        String originalFilename = file.getOriginalFilename();
        int idx = originalFilename.lastIndexOf('.');
        if(idx == -1) {
            throw new IllegalArgumentException("File has no extension.");
        }
        String extension = originalFilename.substring(idx);

        if(!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())){
            throw new IllegalArgumentException("Only .jpg, .jpeg, .png and .webp files are allowed.");
        }

        String fileName = "user_" + userId + "_" + UUID.randomUUID() + extension;

        Path path = Paths.get(
                uploadDir,
                "avatars",
                fileName
        );

        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        return "http://localhost:" + serverPort
                + "/uploads/avatars/"
                + fileName;
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }
        int idx = fileUrl.lastIndexOf('/');
        String fileName = fileUrl.substring(idx+1);

        Path path = Paths.get(
                uploadDir,
                "avatars",
                fileName
        );

        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Failed to delete file {}", fileUrl, e);
        }
    }
}