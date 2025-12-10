package com.example.demo.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleResponseStatusException_returnsCorrectResponse() {
        // Arrange
        ResponseStatusException ex =
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "Something went wrong");

        // Act
        ResponseEntity<Map<String, String>> response = handler.handleResponseStatusException(ex);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("400", response.getBody().get("status"));
        assertEquals("Something went wrong", response.getBody().get("message"));
    }
}
