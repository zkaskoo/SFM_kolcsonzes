package com.example.demo.appuser;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class AppUserController {

    private final AppUserService appUserService;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        try {
            appUserService.register(request);
            return ResponseEntity.ok("Sikeres regisztráció! Kérlek ellenőrizd az emailedet.");
        } catch (ResponseStatusException e) {
            // Ha a service dob ResponseStatusException-t, azt itt visszaadjuk
            return ResponseEntity
                    .status(e.getStatusCode())
                    .body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Hiba történt a regisztráció során.");
        }
    }

/*
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Create new user
            AppUser user = new AppUser();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));

            appUserService.signUpUser(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("email", user.getEmail());

            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

 */

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        // Meghívjuk a service-t, ami ellenőrzi a jelszót és elküldi az auth kódot
        boolean success = appUserService.authenticate(request);

        if (success) {
            return ResponseEntity.ok("Authentication code sent to email. It is valid for 5 minutes.");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        }
    }

}