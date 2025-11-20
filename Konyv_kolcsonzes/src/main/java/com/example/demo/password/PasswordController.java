package com.example.demo.password;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/password")
public class PasswordController {

    private final AutomaticPasswordGeneration passwordGenerator = new AutomaticPasswordGeneration();

    @GetMapping("/generate")
    public ResponseEntity<String> generatePassword() {
        String password = passwordGenerator.generatePassword();
        return ResponseEntity.ok(password);
    }
}