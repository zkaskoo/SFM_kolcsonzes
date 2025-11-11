package com.example.demo.email;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

@Component
public class FileReaderTemplate {

    public String readFile() throws IOException {
        StringBuilder content = new StringBuilder();

        // A fájl a classpath-ban van: src/main/resources/email/SuccesRegister.html
        ClassPathResource resource = new ClassPathResource("emailtemplate/SuccesRegister.html");

        try (InputStream inputStream = resource.getInputStream();
             BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {

            String line;
            while ((line = br.readLine()) != null) {
                content.append(line).append(System.lineSeparator());
            }
        }

        return content.toString();
    }

    public String readAuthFile() throws IOException {
        StringBuilder content = new StringBuilder();

        // A fájl a classpath-ban van: src/main/resources/email/SuccesRegister.html
        ClassPathResource resource = new ClassPathResource("emailtemplate/AuthNumber.html");

        try (InputStream inputStream = resource.getInputStream();
             BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {

            String line;
            while ((line = br.readLine()) != null) {
                content.append(line).append(System.lineSeparator());
            }
        }

        return content.toString();
    }
}
