package com.financetracker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Serves uploaded files as accessible static resources.
 *
 * Without this, Spring has no idea how to serve files from
 * the ./uploads/ folder — it only serves from classpath:/static/
 *
 * After this config:
 *   GET http://localhost:8080/uploads/avatars/user_5_abc.jpg
 *   → Spring serves the file from ./uploads/avatars/user_5_abc.jpg on disk
 *
 * TODO:
 *  1. Add @Value("${app.file.upload-dir:./uploads}") String uploadDir
 *  2. Override addResourceHandlers()
 *  3. registry.addResourceHandler("/uploads/**")
 *            .addResourceLocations("file:" + uploadDir + "/")
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.file.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}