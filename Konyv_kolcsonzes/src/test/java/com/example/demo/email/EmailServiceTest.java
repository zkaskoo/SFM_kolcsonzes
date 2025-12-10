package com.example.demo.email;

import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    JavaMailSender mailSender;

    @InjectMocks
    EmailService emailService;

    // SEGÉD: Valódi, üres MimeMessage létrehozása
    private MimeMessage realMimeMessage() {
        return new MimeMessage((Session) null);
    }

    @Test
    void send_success() throws Exception {
        when(mailSender.createMimeMessage()).thenReturn(realMimeMessage());

        emailService.send("test@example.com", "hello");

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void sendForgottenEmail_success() throws Exception {
        when(mailSender.createMimeMessage()).thenReturn(realMimeMessage());

        emailService.sendForgottenEmail("a@b.com", "email");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendAuthNumberEmail_success() throws Exception {
        when(mailSender.createMimeMessage()).thenReturn(realMimeMessage());

        emailService.sendAuthNumberEmail("a@b.com", "code");

        verify(mailSender).send(any(MimeMessage.class));
    }
}
