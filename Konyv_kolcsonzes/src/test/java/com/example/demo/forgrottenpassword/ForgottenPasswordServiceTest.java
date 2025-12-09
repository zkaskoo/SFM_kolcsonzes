package com.example.demo.forgrottenpassword;

import com.example.demo.appuser.AppUser;
import com.example.demo.appuser.AppUserRepository;
import com.example.demo.email.EmailService;
import com.example.demo.email.FileReaderTemplate;
import com.example.demo.password.ValidPasswordCheck;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ForgottenPasswordServiceTest {

    @Mock
    private ForgottenPasswordRepository forgottenPasswordRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private FileReaderTemplate fileReaderTemplate;

    @Mock
    private EmailService emailService;

    @Mock
    private ValidPasswordCheck validPasswordCheck;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ForgottenPasswordService forgottenPasswordService;

    // ---------------------------------------------------------------------
    // generateResetToken()
    // ---------------------------------------------------------------------
    @Test
    void generateResetToken_success() throws Exception {
        AppUser user = new AppUser();
        user.setEmail("test@example.com");
        user.setName("Teszt Elek");

        when(appUserRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(fileReaderTemplate.readFileForgottenPassword())
                .thenReturn("Hello {0}, link: {1} again {2}");

        boolean result = forgottenPasswordService.generateResetToken("test@example.com");

        assertTrue(result);
        verify(forgottenPasswordRepository).save(any(ForgottenPassword.class));
        verify(emailService).sendForgottenEmail(eq("test@example.com"), anyString());
    }

    @Test
    void generateResetToken_userNotFound() {
        when(appUserRepository.findByEmail("missing@example.com"))
                .thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                forgottenPasswordService.generateResetToken("missing@example.com")
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    // ---------------------------------------------------------------------
    // validResetToken()
    // ---------------------------------------------------------------------
    @Test
    void validResetToken_success() {
        ForgottenPassword fp = new ForgottenPassword();
        fp.setEmail("aaa@aaa.com");
        fp.setResetTokenExpiryDate(LocalDateTime.now().plusMinutes(5));

        when(forgottenPasswordRepository.findByResetToken("tok"))
                .thenReturn(Optional.of(fp));

        String email = forgottenPasswordService.validResetToken("tok");

        assertEquals("aaa@aaa.com", email);
    }

    @Test
    void validResetToken_notFound() {
        when(forgottenPasswordRepository.findByResetToken("tok"))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
                forgottenPasswordService.validResetToken("tok")
        );
    }

    @Test
    void validResetToken_expired() {
        ForgottenPassword fp = new ForgottenPassword();
        fp.setResetTokenExpiryDate(LocalDateTime.now().minusMinutes(1));

        when(forgottenPasswordRepository.findByResetToken("tok"))
                .thenReturn(Optional.of(fp));

        assertThrows(ResponseStatusException.class, () ->
                forgottenPasswordService.validResetToken("tok")
        );
    }

    // ---------------------------------------------------------------------
    // isChangePassword()
    // ---------------------------------------------------------------------
    @Test
    void changePassword_success() {
        AppUser user = new AppUser();
        user.setEmail("aaa@aaa.com");
        user.setPassword("oldHash");

        when(appUserRepository.findByEmail("aaa@aaa.com"))
                .thenReturn(Optional.of(user));

        when(validPasswordCheck.StrongPassword("newpass")).thenReturn(true);
        when(passwordEncoder.matches("newpass", "oldHash")).thenReturn(false);
        when(passwordEncoder.encode("newpass")).thenReturn("encoded");

        boolean result = forgottenPasswordService.isChangePassword(
                "aaa@aaa.com", "newpass", "newpass"
        );

        assertTrue(result);
        verify(forgottenPasswordRepository).deleteByEmail("aaa@aaa.com");
        verify(appUserRepository).save(any(AppUser.class));
    }

    @Test
    void changePassword_userNotFound() {
        when(appUserRepository.findByEmail("missing@x.com"))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
                forgottenPasswordService.isChangePassword("missing@x.com", "pass", "pass")
        );
    }

    @Test
    void changePassword_weakPassword() {
        AppUser user = new AppUser();
        user.setEmail("aaa@aaa.com");

        when(appUserRepository.findByEmail("aaa@aaa.com"))
                .thenReturn(Optional.of(user));

        when(validPasswordCheck.StrongPassword("weak")).thenReturn(false);

        assertThrows(ResponseStatusException.class, () ->
                forgottenPasswordService.isChangePassword("aaa@aaa.com", "weak", "weak")
        );
    }

    @Test
    void changePassword_notMatchingPasswords() {
        AppUser user = new AppUser();
        user.setEmail("aaa@aaa.com");

        when(appUserRepository.findByEmail("aaa@aaa.com"))
                .thenReturn(Optional.of(user));

        when(validPasswordCheck.StrongPassword("newpass")).thenReturn(true);

        assertThrows(ResponseStatusException.class, () ->
                forgottenPasswordService.isChangePassword("aaa@aaa.com", "newpass", "diff")
        );
    }

    @Test
    void changePassword_sameAsOldPassword() {
        AppUser user = new AppUser();
        user.setEmail("aaa@aaa.com");
        user.setPassword("oldHash");

        when(appUserRepository.findByEmail("aaa@aaa.com"))
                .thenReturn(Optional.of(user));

        when(validPasswordCheck.StrongPassword("newpass")).thenReturn(true);
        when(passwordEncoder.matches("newpass", "oldHash")).thenReturn(true); // új jelszó = régi

        assertThrows(ResponseStatusException.class, () ->
                forgottenPasswordService.isChangePassword("aaa@aaa.com", "newpass", "newpass")
        );
    }
}
