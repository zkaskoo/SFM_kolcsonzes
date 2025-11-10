package com.example.demo.appuser;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
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
    private LocalDateTime releaseDate;

    @Lob
    private byte[] picture;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private AppUser user;
}
