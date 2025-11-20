package com.example.demo.password;

import java.security.SecureRandom;
import java.util.Random;

public class AutomaticPasswordGeneration {

    private static final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";

    private static final String ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS;

    private final Random random = new SecureRandom();

    /**
     * Generates a random password with random length between 8 and 16.
     */
    public String generatePassword() {

        // random length: 8–16
        int length = 8 + random.nextInt(16 - 8 + 1);

        StringBuilder password = new StringBuilder(length);

        // Ensure at least one of each character type
        password.append(randomChar(UPPERCASE));
        password.append(randomChar(LOWERCASE));
        password.append(randomChar(DIGITS));

        // Fill the rest with random characters
        for (int i = 3; i < length; i++) {
            password.append(randomChar(ALL_CHARS));
        }

        // Shuffle to avoid predictable patterns
        return shuffleString(password.toString());
    }

    private char randomChar(String source) {
        return source.charAt(random.nextInt(source.length()));
    }

    private String shuffleString(String input) {
        char[] chars = input.toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }
        return new String(chars);
    }
}
