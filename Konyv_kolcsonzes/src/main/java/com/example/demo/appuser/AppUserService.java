package com.example.demo.appuser;

import com.example.demo.email.EmailService;
import com.example.demo.email.FileReaderTemplate;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.ArrayList;

@Service
@AllArgsConstructor
public class AppUserService implements UserDetailsService {

    private final static String USER_NOT_FOUND_MSG = "user with email %s not found";
    private final AppUserRepository appUserRepository;
    private final FileReaderTemplate fileReader;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                String.format(USER_NOT_FOUND_MSG,email)));
    }

    public void register(RegisterRequest request){
        if (request.getName().equals("") || request.getUsername().equals("") || request.getEmail().equals("") || request.getPassword().equals("") ||
                request.getConfirmPassword().equals("")){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mindegyik mezőt ki kell tölteni!");
        }

        if (appUserRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ezzel az email címmel már regisztráltak!");
        }


        if (appUserRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ezzel a felhasználónévvel már regisztráltak!");
        }


        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A jelszavak nem egyeznek!");
        }

        var user = AppUser.builder()
                .name(request.getName())
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .money(0.0)
                .build();
                appUserRepository.save(user);

        try {
            emailService.send(user.getEmail(), buildConfirmationEmail(user.getName(), user.getUsername()));
        } catch (Exception e) {
            e.printStackTrace();
        }


    }

    private String buildConfirmationEmail(String email, String username) {
        String fileContent = "";
        try {
            fileContent = fileReader.readFile();
            return String.format(fileContent,email,username);
        } catch (IOException e) {
            e.printStackTrace();
            return "Error reading email template.";
        }
    }

    public String signUpUser(AppUser appUser){
        boolean userExists = appUserRepository.findByEmail(appUser.getEmail())
                .isPresent();

        if (userExists){
            throw  new IllegalStateException("email already taken");
        }

        appUserRepository.save(appUser);
        //TODO: Send confirmation token
        return "it works";
    }
}
