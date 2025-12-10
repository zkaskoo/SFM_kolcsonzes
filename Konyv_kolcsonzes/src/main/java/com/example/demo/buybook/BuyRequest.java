package com.example.demo.buybook;

import lombok.Data;

@Data
public class BuyRequest {
    private Long userId;
    private Long bookId;
    private Long price;
}
