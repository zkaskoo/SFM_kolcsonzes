package com.example.demo.secondauth;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "secondauth")
public class SecondAuth {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String authToken;
    @Column(name = "reset_token_expiry", nullable = false)
    private LocalDateTime authTokenExpiry;
    @Column(name = "user_email", nullable = false)
    private String userEmail;
}
