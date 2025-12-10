package com.example.demo.password;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AutomaticPasswordGenerationTest {

    @Test
    void generatedPassword_shouldMeetAllRequirements() {
        AutomaticPasswordGeneration gen = new AutomaticPasswordGeneration();

        String pwd = gen.generatePassword();

        // length: 8–16
        assertTrue(pwd.length() >= 8 && pwd.length() <= 16,
                "Password length must be between 8 and 16");

        // contains uppercase
        assertTrue(pwd.chars().anyMatch(Character::isUpperCase),
                "Password must contain at least one uppercase letter");

        // contains lowercase
        assertTrue(pwd.chars().anyMatch(Character::isLowerCase),
                "Password must contain at least one lowercase letter");

        // contains digit
        assertTrue(pwd.chars().anyMatch(Character::isDigit),
                "Password must contain at least one digit");

        // only valid characters
        String allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        assertTrue(pwd.chars().allMatch(c -> allowed.indexOf(c) >= 0),
                "Password contains invalid characters");
    }
}
