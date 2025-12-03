package com.example.demo.uploadmoney;

import com.example.demo.appuser.AppUser;
import com.example.demo.appuser.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UploadMoneyService {
    private final AppUserRepository appUserRepository;

    public void topUpBalance(String email, String cardNumber,String expirationDate, String cvcCode, double balance){
        Optional<AppUser> authOpt = appUserRepository.findByEmail(email);

        if (authOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nincs az email regisztrálva");
        }

        if (cardNumber.length() < 16){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nem megfelelő a kártyaszám");
        }

        if (cvcCode.length() < 3){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nem megfelelő a cvc kód");
        }

        String[] dateParts = expirationDate.split("/");
        String date = "20" + dateParts[1] + "." + dateParts[0];

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM");
        YearMonth ym = YearMonth.parse(date, formatter);

        YearMonth now = YearMonth.now();   // pl: 2025-11

        if (ym.isBefore(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A kártya már lejárt");
        }


        AppUser appUser = authOpt.get();

        appUser.setMoney(appUser.getMoney() + balance);
        appUserRepository.save(appUser);
    }
}
