package com.example.demo.books;

import com.example.demo.appuser.AppUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String author;
    private String title;
    private String releaseDate;
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] pdfFile;


    @Lob
    private byte[] picture;

    private Long userId;
    private Long price;
}
