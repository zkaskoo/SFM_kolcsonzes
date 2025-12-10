package com.example.demo.buybook;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "buyandchange")
@Builder
public class BuyAndChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerUsername;
    private String sellerUsername;

    private boolean isPay;

    private Long customerUserId;
    private Long sellerUserId;

    private boolean customerAccept;
    private boolean sellerAccept;

    private Long price;

    // MELYIK KÖNYVET VESZI / CSERÉLI
    private Long bookId;

    // HA CSERE VAN, MILYEN KÖNYVET AJÁNL FEL A VEVŐ
    private Long customerTradeBookId;

    private String status;

    private boolean sellerShipped;
    private boolean buyerShipped;

    private boolean sellerConfirmed;
    private boolean buyerConfirmed;

}
