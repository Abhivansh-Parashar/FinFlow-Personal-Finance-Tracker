package com.financetracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;


@Configuration
public class MistralConfig {


    @Bean
    public WebClient mistralWebClient(WebClient.Builder builder) {

        return builder
                .baseUrl("https://api.mistral.ai")
                .build();
    }
}