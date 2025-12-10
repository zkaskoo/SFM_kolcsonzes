package com.example.demo.password;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ValidPasswordCheckTest {

    private final ValidPasswordCheck validPasswordCheck = new ValidPasswordCheck();

    @Test
    void testNullPassword() {
        assertFalse(validPasswordCheck.StrongPassword(null));
    }

    @Test
    void testTooShortPassword() {
        assertFalse(validPasswordCheck.StrongPassword("Ab3"));
    }

    @Test
    void testNoUppercase() {
        assertFalse(validPasswordCheck.StrongPassword("password123"));
    }

    @Test
    void testNoLowercase() {
        assertFalse(validPasswordCheck.StrongPassword("PASSWORD123"));
    }

    @Test
    void testNoDigit() {
        assertFalse(validPasswordCheck.StrongPassword("Password"));
    }

    @Test
    void testValidPassword() {
        assertTrue(validPasswordCheck.StrongPassword("Password123"));
    }

    @Test
    void testSpecialCharacters() {
        assertTrue(validPasswordCheck.StrongPassword("Aa1!@#aa"));
    }
}