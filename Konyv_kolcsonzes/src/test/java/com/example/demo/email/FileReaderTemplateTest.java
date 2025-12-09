package com.example.demo.email;

import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class FileReaderTemplateTest {

    private final FileReaderTemplate reader = new FileReaderTemplate();

    @Test
    void readFile_shouldReturnContent() throws IOException {
        String content = reader.readFile();

        assertNotNull(content);
        assertFalse(content.isBlank());
        assertTrue(content.contains("<"));
    }

    @Test
    void readAuthFile_shouldReturnContent() throws IOException {
        String content = reader.readAuthFile();

        assertNotNull(content);
        assertFalse(content.isBlank());
        assertTrue(content.contains("<"));
    }

    @Test
    void readFileForgottenPassword_shouldReturnContent() throws IOException {
        String content = reader.readFileForgottenPassword();

        assertNotNull(content);
        assertFalse(content.isBlank());
        assertTrue(content.contains("<"));
    }
}
