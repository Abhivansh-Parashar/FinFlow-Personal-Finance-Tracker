package com.financetracker.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
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

        String header = request.getHeader("Authorization");
        if(header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        String username = jwtService.extractUsername(token);

        if(username != null && SecurityContextHolder.getContext().getAuthentication() == null){
            UserDetails user = userDetailsService.loadUserByUsername(username);

            if(jwtService.isTokenValid(token, user)){
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        user.getAuthorities()
                );

                WebAuthenticationDetails details = new WebAuthenticationDetailsSource().buildDetails(request);
                auth.setDetails(details);
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }


        filterChain.doFilter(request, response);
    }
}
