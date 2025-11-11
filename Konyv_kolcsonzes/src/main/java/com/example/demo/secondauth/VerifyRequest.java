package com.example.demo.secondauth;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyRequest {
    private String email;
    private String authNumber;
}

