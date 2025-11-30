package com.example.demo.databaseteszt;

import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TestDB implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Connected to: " + dataSource.getConnection().getMetaData().getURL());
        System.out.println("DB user: " + dataSource.getConnection().getMetaData().getUserName());
    }
}
