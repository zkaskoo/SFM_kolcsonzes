package com.example.demo.forgrottenpassword;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TokenRequestTest {

    @Test
    void gettersAndSetters_workCorrectly() {
        TokenRequest req = new TokenRequest();

        req.setToken("mytesttoken");

        assertEquals("mytesttoken", req.getToken());
    }
}
