package com.example.demo.password;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class PasswordResponseTest {

    @Test
    void testConstructorAndGetters() {
        PasswordResponse response =
                new PasswordResponse("abc123", 6, "Strong password");

        assertThat(response.getPassword()).isEqualTo("abc123");
        assertThat(response.getLength()).isEqualTo(6);
        assertThat(response.getMessage()).isEqualTo("Strong password");
    }

    @Test
    void testSetters() {
        PasswordResponse response =
                new PasswordResponse(null, 0, null);

        response.setPassword("newpass");
        response.setLength(8);
        response.setMessage("Updated");

        assertThat(response.getPassword()).isEqualTo("newpass");
        assertThat(response.getLength()).isEqualTo(8);
        assertThat(response.getMessage()).isEqualTo("Updated");
    }
}
