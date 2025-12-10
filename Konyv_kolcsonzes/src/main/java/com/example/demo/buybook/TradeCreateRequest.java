package com.example.demo.buybook;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TradeCreateRequest {
    private Long userId;
    private Long bookId;
}
