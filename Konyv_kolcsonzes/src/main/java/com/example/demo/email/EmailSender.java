package com.example.demo.email;

public interface EmailSender {
    void send(String to,String email);
    void sendAuthNumberEmail(String to, String email);
    void sendForgottenEmail(String email, String to);
}
