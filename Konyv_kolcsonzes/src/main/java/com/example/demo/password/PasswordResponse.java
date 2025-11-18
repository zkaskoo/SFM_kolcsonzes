package com.example.demo.password;

public class PasswordResponse {

    private String password;
    private int length;
    private String message;

    public PasswordResponse(String password, int length, String message) {
        this.password = password;
        this.length = length;
        this.message = message;
    }

    public String getPassword() {
        return password;
    }

    public int getLength() {
        return length;
    }

    public String getMessage() {
        return message;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
