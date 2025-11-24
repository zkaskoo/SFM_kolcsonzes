package com.example.demo.appuser;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class LoginResponse {
    private String token;
    private String username;
    private String name;
    private double money;
    private String email;
}
