package com.financetracker.util;

import com.financetracker.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utility class for accessing the currently authenticated user.
 *
 * TODO (Milestone 1):
 *  - getCurrentUser(): cast principal from SecurityContextHolder to User entity
 *  - getCurrentUserId(): return the authenticated user's ID
 *
 * Usage in services:
 *   User currentUser = SecurityUtils.getCurrentUser();
 */
@Component
public class SecurityUtils {

    public static User getCurrentUser() {
        // TODO: Implement
        // return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        throw new UnsupportedOperationException("Not yet implemented");
    }

    public static Long getCurrentUserId() {
        // TODO: Implement
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
