package com.example.demo.books;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookFilterRequest {
    private Long id;
    private String title;
    private String author;
    private Long maximumPrice;
}
