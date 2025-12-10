package com.example.demo.forgrottenpassword;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ForgottenPasswordController.class)
@AutoConfigureMockMvc(addFilters = false)
class ForgottenPasswordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper mapper = new ObjectMapper();

    // A controller által használt service mockolása
    @MockBean
    private ForgottenPasswordService forgottenPasswordService;

    // A security miatt kell mockolni ezeket is,
    // különben a Spring NEM hagy békén.
    @MockBean
    private com.example.demo.security.config.JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.example.demo.security.config.JwtService jwtService;

    @Test
    void forgottenPassword_shouldReturnTrue() throws Exception {
        ForgottenPasswordRequest req = new ForgottenPasswordRequest();
        req.setEmail("test@example.com");

        when(forgottenPasswordService.generateResetToken("test@example.com"))
                .thenReturn(true);

        mockMvc.perform(
                        post("/api/v1/auth/forgotten-password/generate")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(mapper.writeValueAsString(req))
                ).andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    void validateResetToken_shouldReturnString() throws Exception {
        TokenRequest req = new TokenRequest();
        req.setToken("xyz123");

        when(forgottenPasswordService.validResetToken("xyz123"))
                .thenReturn("VALID");

        mockMvc.perform(
                        post("/api/v1/auth/forgotten-password/validate")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(mapper.writeValueAsString(req))
                ).andExpect(status().isOk())
                .andExpect(content().string("VALID"));
    }

    @Test
    void changePassword_success() throws Exception {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setEmail("user@test.com");
        req.setPassword("newpass");
        req.setConfirmPassword("newpass");

        when(forgottenPasswordService.isChangePassword("user@test.com", "newpass", "newpass"))
                .thenReturn(true);

        mockMvc.perform(
                        post("/api/v1/auth/forgotten-password/change")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(mapper.writeValueAsString(req))
                ).andExpect(status().isOk())
                .andExpect(content().string("A jelszó sikeresen megváltozott."));
    }

    @Test
    void changePassword_failure() throws Exception {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setEmail("user@test.com");
        req.setPassword("newpass");
        req.setConfirmPassword("newpass");

        when(forgottenPasswordService.isChangePassword("user@test.com", "newpass", "newpass"))
                .thenReturn(false);

        mockMvc.perform(
                        post("/api/v1/auth/forgotten-password/change")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(mapper.writeValueAsString(req))
                ).andExpect(status().isBadRequest())
                .andExpect(content().string("Hiba történt a jelszó módosítása során."));
    }
}
