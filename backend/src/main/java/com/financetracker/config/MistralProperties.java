package com.financetracker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mistral")
public record MistralProperties(
        String apiKey,
        String url,
        String model
) {
}