package com.example.demo.appuser;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AppUserController.class)
@AutoConfigureMockMvc(addFilters = false)
class AppUserControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    private AppUserService appUserService;

    @MockBean
    private AppUserRepository appUserRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private com.example.demo.security.config.JwtService jwtService; // EZ KELL!!!

    @MockBean
    private com.example.demo.security.config.JwtAuthenticationFilter jwtAuthenticationFilter; // EZ IS KELL!

    @Test
    void register_success() throws Exception {
        String json = """
                {
                    "name": "Bence",
                    "email": "test@example.com",
                    "password": "Password123"
                }
                """;

        mockMvc.perform(post("/api/v1/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Sikeres regisztráció! Kérlek ellenőrizd az emailedet."));
    }

    // REGISTER - ResponseStatusException
    @Test
    void register_badRequest() throws Exception {
        String json = """
                {
                    "name": "Bence",
                    "email": "test@example.com",
                    "password": "Password123"
                }
                """;

        doThrow(new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST,
                "Email már létezik"
        )).when(appUserService).register(org.mockito.ArgumentMatchers.any());

        mockMvc.perform(post("/api/v1/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email már létezik"));
    }

    // REGISTER - UNEXPECTED ERROR
    @Test
    void register_internalError() throws Exception {
        String json = """
                {
                    "name": "Bence",
                    "email": "test@example.com",
                    "password": "Password123"
                }
                """;

        doThrow(new RuntimeException("DB crash"))
                .when(appUserService).register(org.mockito.ArgumentMatchers.any());

        mockMvc.perform(post("/api/v1/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Hiba történt a regisztráció során."));
    }

    // LOGIN - SUCCESS
    @Test
    void login_success() throws Exception {
        String json = """
                {
                    "email": "test@example.com",
                    "password": "Password123"
                }
                """;

        when(appUserService.authenticate(org.mockito.ArgumentMatchers.any()))
                .thenReturn(true);

        mockMvc.perform(post("/api/v1/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Authentication code sent to email. It is valid for 5 minutes."));
    }

    // LOGIN - FAIL
    @Test
    void login_fail() throws Exception {
        String json = """
                {
                    "email": "test@example.com",
                    "password": "wrong"
                }
                """;

        when(appUserService.authenticate(org.mockito.ArgumentMatchers.any()))
                .thenReturn(false);

        mockMvc.perform(post("/api/v1/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }
}
