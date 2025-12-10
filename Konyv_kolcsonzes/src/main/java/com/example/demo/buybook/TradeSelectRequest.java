package com.example.demo.buybook;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TradeSelectRequest {
    private Long offerId;
    private Long customerTradeBookId;
    private Long userId;
}

