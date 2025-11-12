package com.example.demo.secondauth;

import com.example.demo.appuser.AppUserService;
import com.example.demo.appuser.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class SecondAuthController {

    private final SecondAuthService secondAuthService;

    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String,String> request) {
        String email = request.get("email");
        String code = request.get("code");

        try {
            var loginResponse = secondAuthService.authentication(code, email);
            return ResponseEntity.ok(loginResponse); // token és username van benne
        } catch (ResponseStatusException e) {
            return ResponseEntity
                    .status(e.getStatusCode())
                    .body(Map.of("message", e.getReason()));
        }
    }


}
