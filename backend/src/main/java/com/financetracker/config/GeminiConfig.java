package com.financetracker.config;

import io.netty.handler.codec.http2.Http2Headers;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class GeminiConfig {

    @Bean
    public WebClient geminiWebClient(WebClient.Builder builder) {

        return builder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }
}
