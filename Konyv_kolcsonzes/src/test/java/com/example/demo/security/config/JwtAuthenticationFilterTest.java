package com.example.demo.security.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.IOException;
import java.util.Collections;

import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private FilterChain filterChain;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        filter = new JwtAuthenticationFilter(jwtService, userDetailsService);
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldBypassForLoginEndpoint() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/v1/login");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        verifyNoInteractions(jwtService);
    }

    @Test
    void shouldSkipIfNoAuthorizationHeader() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/v1/other");
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtService);
    }

    @Test
    void shouldSkipIfHeaderNotBearer() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/v1/other");
        when(request.getHeader("Authorization")).thenReturn("Token abc");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtService);
    }

    @Test
    void shouldAuthenticateWhenJwtIsValid() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/v1/secure");
        when(request.getHeader("Authorization")).thenReturn("Bearer valid.jwt");

        when(jwtService.extractUsername("valid.jwt")).thenReturn("testuser");

        UserDetails userDetails = new User("testuser", "pass", Collections.emptyList());
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);

        when(jwtService.isTokenValid("valid.jwt", userDetails)).thenReturn(true);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(jwtService).extractUsername("valid.jwt");
        verify(userDetailsService).loadUserByUsername("testuser");

        assert SecurityContextHolder.getContext().getAuthentication() instanceof UsernamePasswordAuthenticationToken;
    }

    @Test
    void shouldNotAuthenticateWhenTokenInvalid() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/v1/secure");
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid.jwt");

        when(jwtService.extractUsername("invalid.jwt")).thenReturn("testuser");

        UserDetails userDetails = new User("testuser", "pass", Collections.emptyList());
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);

        when(jwtService.isTokenValid("invalid.jwt", userDetails)).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);

        assert SecurityContextHolder.getContext().getAuthentication() == null;
    }
}
