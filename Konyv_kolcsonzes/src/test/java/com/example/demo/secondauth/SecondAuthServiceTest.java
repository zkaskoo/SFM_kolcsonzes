package com.example.demo.secondauth;

import com.example.demo.appuser.AppUser;
import com.example.demo.appuser.AppUserRepository;
import com.example.demo.appuser.LoginResponse;
import com.example.demo.security.config.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SecondAuthServiceTest {

    private SecondAuthRepository secondAuthRepository;
    private JwtService jwtService;
    private AppUserRepository appUserRepository;
    private SecondAuthService secondAuthService;

    @BeforeEach
    void setUp() {
        secondAuthRepository = mock(SecondAuthRepository.class);
        jwtService = mock(JwtService.class);
        appUserRepository = mock(AppUserRepository.class);

        secondAuthService = new SecondAuthService(
                secondAuthRepository,
                jwtService,
                appUserRepository
        );
    }

    // --------------------------------------------------------------
    // generateAuthNumber TEST
    // --------------------------------------------------------------
    @Test
    void generateAuthNumber_success() {

        when(secondAuthRepository.existsByAuthToken(anyString())).thenReturn(false);

        String result = secondAuthService.generateAuthNumber("user@test.com");

        assertNotNull(result);
        assertEquals(6, result.length());

        ArgumentCaptor<SecondAuth> saved = ArgumentCaptor.forClass(SecondAuth.class);
        verify(secondAuthRepository).save(saved.capture());

        assertEquals("user@test.com", saved.getValue().getUserEmail());
        assertNotNull(saved.getValue().getAuthToken());
        assertNotNull(saved.getValue().getAuthTokenExpiry());
    }

    // --------------------------------------------------------------
    // authentication() TEST – success
    // --------------------------------------------------------------
    @Test
    void authentication_success() {

        SecondAuth secondAuth = SecondAuth.builder()
                .authToken("123456")
                .authTokenExpiry(LocalDateTime.now().plusMinutes(3))
                .userEmail("user@test.com")
                .build();

        AppUser user = new AppUser();
        user.setId(1L);
        user.setName("Bandi");
        user.setEmail("user@test.com");
        user.setMoney(200);
        user.setUsername("username123");

        when(secondAuthRepository.findByUserEmail("user@test.com"))
                .thenReturn(Optional.of(secondAuth));

        when(appUserRepository.findByEmail("user@test.com"))
                .thenReturn(Optional.of(user));

        when(jwtService.generateToken(user)).thenReturn("jwt.token.here");

        LoginResponse response = secondAuthService.authentication("123456", "user@test.com");

        assertEquals(1L, response.getId());
        assertEquals("jwt.token.here", response.getToken());
        assertEquals("username123", response.getUsername());
        assertEquals("user@test.com", response.getEmail());
    }

    // --------------------------------------------------------------
    // authentication() TEST – no email
    // --------------------------------------------------------------
    @Test
    void authentication_emailNotRegistered() {

        when(secondAuthRepository.findByUserEmail("user@test.com"))
                .thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> secondAuthService.authentication("000000", "user@test.com")
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Nincs az email regisztrálva", ex.getReason());
    }

    // --------------------------------------------------------------
    // authentication() TEST – invalid token
    // --------------------------------------------------------------
    @Test
    void authentication_invalidToken() {

        SecondAuth secondAuth = SecondAuth.builder()
                .authToken("123456")
                .authTokenExpiry(LocalDateTime.now().plusMinutes(5))
                .userEmail("user@test.com")
                .build();

        when(secondAuthRepository.findByUserEmail("user@test.com"))
                .thenReturn(Optional.of(secondAuth));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> secondAuthService.authentication("999999", "user@test.com")
        );

        assertEquals("Hibás token!", ex.getReason());
    }

    // --------------------------------------------------------------
    // authentication() TEST – expired token
    // --------------------------------------------------------------
    @Test
    void authentication_expiredToken() {

        SecondAuth secondAuth = SecondAuth.builder()
                .authToken("123456")
                .authTokenExpiry(LocalDateTime.now().minusMinutes(1))
                .userEmail("user@test.com")
                .build();

        when(secondAuthRepository.findByUserEmail("user@test.com"))
                .thenReturn(Optional.of(secondAuth));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> secondAuthService.authentication("123456", "user@test.com")
        );

        assertEquals("A token lejárt. Jelentkezzen be újra", ex.getReason());
    }
}
