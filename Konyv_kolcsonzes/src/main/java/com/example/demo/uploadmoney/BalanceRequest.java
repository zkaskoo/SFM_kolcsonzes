package com.example.demo.uploadmoney;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BalanceRequest {
    private String email;
    private String cardNumber;
    private String expirationDate;
    private String cvcCode;
    private double money;
}
