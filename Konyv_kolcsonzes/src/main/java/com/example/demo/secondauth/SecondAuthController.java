package com.example.demo.secondauth;

import com.example.demo.appuser.AppUserService;
import com.example.demo.appuser.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class SecondAuthController {

    private final SecondAuthService secondAuthService;

    @PostMapping("/verify")
    public ResponseEntity<LoginResponse> verifyAuthCode(@RequestBody VerifyRequest request) {
        LoginResponse response = secondAuthService.authentication(request.getAuthNumber(), request.getEmail());
        return ResponseEntity.ok(response);
    }
}
