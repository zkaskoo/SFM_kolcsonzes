package com.example.demo.books;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BuyBookRequest {
    private Long id;
    private Long bookId;
    private Long price;
}