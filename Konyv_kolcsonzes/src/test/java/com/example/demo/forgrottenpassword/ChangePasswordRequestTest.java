package com.example.demo.forgrottenpassword;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ChangePasswordRequestTest {

    @Test
    void gettersAndSetters_shouldWork() {
        ChangePasswordRequest req = new ChangePasswordRequest();

        req.setEmail("test@example.com");
        req.setPassword("secret");
        req.setConfirmPassword("secret");

        assertEquals("test@example.com", req.getEmail());
        assertEquals("secret", req.getPassword());
        assertEquals("secret", req.getConfirmPassword());
    }
}
