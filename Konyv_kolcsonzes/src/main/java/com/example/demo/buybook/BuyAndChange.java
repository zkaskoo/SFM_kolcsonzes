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
    private int customerAccept;
    private int sellerAccept;
    private Long price;
}
