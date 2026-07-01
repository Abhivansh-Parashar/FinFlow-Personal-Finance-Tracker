package com.financetracker.config;

import com.financetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Application beans configuration.
 *
 * TODO (Milestone 1):
 *  - UserDetailsService bean: load user by email from UserRepository
 *  - AuthenticationProvider bean (DaoAuthenticationProvider):
 *    set userDetailsService + passwordEncoder on it
 *
 * Spring Security will use this provider in the AuthenticationManager.
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;
    // TODO: Implement @Bean UserDetailsService
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository
                .findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")
                );
    }

    // TODO: Implement @Bean AuthenticationProvider
    @Bean
    public AuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();

        provider.setUserDetailsService(userDetailsService());

        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }

}
