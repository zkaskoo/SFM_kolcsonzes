package com.example.demo.secondauth;

import com.example.demo.appuser.AppUser;
import com.example.demo.appuser.AppUserRepository;
import com.example.demo.appuser.LoginResponse;
import com.example.demo.security.config.JwtService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@AllArgsConstructor
public class SecondAuthService {
    private final SecondAuthRepository secondAuthRepository;
    private final JwtService jwtService;
    private final AppUserRepository appUserRepository;

    @Transactional
    public String generateAuthNumber(String email) {
        secondAuthRepository.deleteAllByUserEmail(email);
        String numbers = "0123456789";
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder();

        while (true) {
            sb.setLength(0);
            for (int i = 0; i < 6; i++) {
                int number = rnd.nextInt(0, 10);
                sb.append(numbers.charAt(number));
            }

            if (!secondAuthRepository.existsByAuthToken(sb.toString())) {
                var authToken = SecondAuth.builder()
                        .authToken(sb.toString())
                        .authTokenExpiry(LocalDateTime.now().plusMinutes(5))
                        .userEmail(email)
                        .build();

                secondAuthRepository.save(authToken);
                break;
            }
        }
        return sb.toString();
    }

    public LoginResponse authentication(String authNumber, String email){
        Optional<SecondAuth> authOpt = secondAuthRepository.findByUserEmail(email);

        if (authOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nincs az email regisztrálva");
        }

        SecondAuth auth = authOpt.get();

        // Ellenőrizzük a token egyezését
        if (!auth.getAuthToken().equals(authNumber)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hibás token!");
        }

        // Ellenőrizzük a token lejárati idejét
        if (auth.getAuthTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A token lejárt. Jelentkezzen be újra");
        }



        var user = appUserRepository.findByEmail(email)
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return LoginResponse.builder()
                .token(jwtToken)
                .username(user.getRealUsername())
                .build();
    }
}
