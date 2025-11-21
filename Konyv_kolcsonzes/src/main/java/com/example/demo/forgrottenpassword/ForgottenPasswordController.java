package com.example.demo.forgrottenpassword;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/forgotten-password")
@RequiredArgsConstructor
public class ForgottenPasswordController {

    private final ForgottenPasswordService forgottenPasswordService;

    @PostMapping("/generate")
    public ResponseEntity<Boolean> forgottenPassword(@RequestBody ForgottenPasswordRequest request) {
        System.out.println(">>> CONTROLLER RECEIVED EMAIL = '" + request.getEmail() + "'");
        boolean exists = forgottenPasswordService.generateResetToken(request.getEmail());
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/validate")
    public String validateResetToken(@RequestBody TokenRequest request) {
        return forgottenPasswordService.validResetToken(request.getToken());
    }
}
