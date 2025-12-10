package com.example.demo.buybook;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class TradeOfferDTO {
    private Long id;                // <-- ez lesz az offerId
    private String from;
    private String bookRequested;
    private String bookOffered;
    private String status;
    private String date;
    private boolean sellerShipped;
    private boolean buyerShipped;
    private boolean sellerConfirmed;
    private boolean buyerConfirmed;
    private Long bookId;            // <-- kell a csere-UI-hoz
    private boolean pay;
    private boolean sellerAccept;
    private boolean customerAccept;

}
