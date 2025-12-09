package com.example.demo.appuser;

import com.example.demo.email.EmailService;
import com.example.demo.email.FileReaderTemplate;
import com.example.demo.password.ValidPasswordCheck;
import com.example.demo.secondauth.SecondAuthService;
import com.example.demo.security.config.JwtService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AppUserServiceTest {

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private FileReaderTemplate fileReader;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private SecondAuthService secondAuthService;

    @Mock
    private ValidPasswordCheck validPasswordCheck;

    @InjectMocks
    private AppUserService appUserService;

    @BeforeEach
    void init() {
        MockitoAnnotations.openMocks(this);
    }

    // -----------------------------------------------------
    // loadUserByUsername
    // -----------------------------------------------------
    @Test
    void loadUserByUsername_found() {
        AppUser user = AppUser.builder().email("test@mail.com").build();
        when(appUserRepository.findByEmail("test@mail.com"))
                .thenReturn(Optional.of(user));

        UserDetails result = appUserService.loadUserByUsername("test@mail.com");

        assertEquals("test@mail.com", result.getUsername());
    }

    @Test
    void loadUserByUsername_notFound() {
        when(appUserRepository.findByEmail("none@mail.com"))
                .thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () ->
                appUserService.loadUserByUsername("none@mail.com"));
    }

    // -----------------------------------------------------
    // register
    // -----------------------------------------------------
    @Test
    void register_success() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test");
        req.setUsername("testuser");
        req.setEmail("test@mail.com");
        req.setPassword("StrongPass1");
        req.setConfirmPassword("StrongPass1");

        when(appUserRepository.findByEmail("test@mail.com")).thenReturn(Optional.empty());
        when(appUserRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(validPasswordCheck.StrongPassword("StrongPass1")).thenReturn(true);
        when(passwordEncoder.encode("StrongPass1")).thenReturn("ENCODED");
        when(fileReader.readFile()).thenReturn("Hello %s %s");

        appUserService.register(req);

        verify(appUserRepository, times(1)).save(any());
        verify(emailService, times(1))
                .send(eq("test@mail.com"), any());
    }

    @Test
    void register_existingEmail_throws() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test");
        req.setUsername("user");
        req.setEmail("already@mail.com");
        req.setPassword("aaa");
        req.setConfirmPassword("aaa");

        when(appUserRepository.findByEmail("already@mail.com"))
                .thenReturn(Optional.of(new AppUser()));

        assertThrows(ResponseStatusException.class,
                () -> appUserService.register(req));
    }

    @Test
    void register_passwordMismatch_throws() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test");
        req.setUsername("user");
        req.setEmail("email@mail.com");
        req.setPassword("aa");
        req.setConfirmPassword("bb");

        assertThrows(ResponseStatusException.class,
                () -> appUserService.register(req));
    }

    // -----------------------------------------------------
    // authenticate
    // -----------------------------------------------------
    @Test
    void authenticate_success() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@mail.com");
        req.setPassword("pw");

        when(secondAuthService.generateAuthNumber("test@mail.com"))
                .thenReturn("12345");
        when(fileReader.readAuthFile()).thenReturn("CODE: %s");

        // authenticationManager.authenticate() nem dob hibát → siker
        appUserService.authenticate(req);

        verify(emailService, times(1))
                .sendAuthNumberEmail(eq("test@mail.com"), anyString());
    }

    @Test
    void authenticate_invalidCredentials_throws() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@mail.com");
        req.setPassword("pw");

        doThrow(new BadCredentialsException("nope"))
                .when(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> appUserService.authenticate(req));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    // -----------------------------------------------------
    // signUpUser
    // -----------------------------------------------------
    @Test
    void signUpUser_success() {
        AppUser user = new AppUser();
        user.setEmail("test@mail.com");

        when(appUserRepository.findByEmail("test@mail.com"))
                .thenReturn(Optional.empty());

        String res = appUserService.signUpUser(user);

        verify(appUserRepository, times(1)).save(user);
        assertEquals("it works", res);
    }

    @Test
    void signUpUser_emailTaken_throws() {
        AppUser user = new AppUser();
        user.setEmail("exists@mail.com");

        when(appUserRepository.findByEmail("exists@mail.com"))
                .thenReturn(Optional.of(user));

        assertThrows(IllegalStateException.class,
                () -> appUserService.signUpUser(user));
    }
}
