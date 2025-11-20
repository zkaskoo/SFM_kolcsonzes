package com.example.demo.forgrottenpassword;

import com.example.demo.appuser.AppUserRepository;
import com.example.demo.email.EmailService;
import com.example.demo.email.FileReaderTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ForgottenPasswordService {
    private final ForgottenPasswordRepository forgottenPasswordRepository;
    private final AppUserRepository appUserRepository;
    private final FileReaderTemplate fileReaderTemplate;
    private final EmailService emailService;

    public boolean generateResetToken(String email){
        System.out.println("A kapott email a függvényben: " + email);
        var userOpt = appUserRepository.findByEmail(email);


        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nem található a " + email + " email cím az adatbázisban");// Nincs ilyen email az adatbázisban
        }

        var user = userOpt.get();

        String token = UUID.randomUUID().toString();
        ForgottenPassword forgottenPassword = new ForgottenPassword();
        forgottenPassword.setUserEmail(user.getEmail());
        forgottenPassword.setResetToken(token);
        forgottenPassword.setResetTokenExpiryDate(LocalDateTime.now().plusMinutes(15));
        forgottenPasswordRepository.save(forgottenPassword);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        String forgottenHtml = buildConfirmationEmail3(user.getName(), resetLink);


        emailService.sendForgottenEmail(user.getEmail(),forgottenHtml);

        return true;
    }

    private String buildConfirmationEmail3(String name, String resetLink) {
        String fileContent = "";
        try {
            fileContent = fileReaderTemplate.readFileForgottenPassword();
            return MessageFormat.format(fileContent,name, resetLink,resetLink);
        } catch (IOException e) {
            e.printStackTrace();
            return "Error reading email template.";
        }

    }

    public boolean isValidResetToken(String token) {
        Optional<ForgottenPassword> optional = forgottenPasswordRepository.findByResetToken(token);

        if (optional.isEmpty()) {
            return false;
        }

        ForgottenPassword forgottenPassword = optional.get();

        if (forgottenPassword.getResetTokenExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }

        return true;
    }

    /*
    public boolean isChangePassword(){

    }*/
}
