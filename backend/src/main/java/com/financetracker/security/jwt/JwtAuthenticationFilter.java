package com.financetracker.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

/**
 * JWT filter — runs once per request, before UsernamePasswordAuthenticationFilter.
 *
 * TODO (Milestone 1):
 * 1. Extract "Authorization" header from request
 * 2. Check it starts with "Bearer " → extract token substring
 * 3. Extract username from token via jwtService.extractUsername()
 * 4. If username is not null and SecurityContext has no auth:
 *    a. Load UserDetails via userDetailsService.loadUserByUsername()
 *    b. Validate token via jwtService.isTokenValid()
 *    c. Create UsernamePasswordAuthenticationToken with authorities
 *    d. Set details: new WebAuthenticationDetailsSource().buildDetails(request)
 *    e. Set auth in SecurityContext: SecurityContextHolder.getContext().setAuthentication(auth)
 * 5. Call filterChain.doFilter(request, response)
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // TODO: Implement JWT filter logic
        filterChain.doFilter(request, response);
    }
}
