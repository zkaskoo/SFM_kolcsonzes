package com.example.demo.secondauth;

import com.example.demo.appuser.LoginResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class SecondAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SecondAuthService secondAuthService;

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void verifyCode_success() throws Exception {
        Map<String, String> request = Map.of(
                "email", "user@test.com",
                "code", "123456"
        );

        LoginResponse mockResp = LoginResponse.builder()
                .id(1L)
                .token("jwt.token.here")
                .username("user123")
                .name("Teszt Elek")
                .money(1000.0)
                .email("user@test.com")
                .build();

        when(secondAuthService.authentication("123456", "user@test.com"))
                .thenReturn(mockResp);

        mockMvc.perform(
                        post("/api/v1/auth/verify")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(mapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.token").value("jwt.token.here"))
                .andExpect(jsonPath("$.username").value("user123"))
                .andExpect(jsonPath("$.email").value("user@test.com"));
    }

    @Test
    void verifyCode_invalidToken() throws Exception {
        Map<String, String> request = Map.of(
                "email", "user@test.com",
                "code", "999999"
        );

        when(secondAuthService.authentication("999999", "user@test.com"))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hibás token!"));

        mockMvc.perform(
                        post("/api/v1/auth/verify")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(mapper.writeValueAsString(request))
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Hibás token!"));
    }
}
