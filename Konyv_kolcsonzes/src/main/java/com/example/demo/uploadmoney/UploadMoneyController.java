package com.example.demo.uploadmoney;

import com.example.demo.appuser.AppUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/user")
public class UploadMoneyController {

    private final UploadMoneyService uploadMoneyService;

    public UploadMoneyController(UploadMoneyService uploadMoneyService) {
        this.uploadMoneyService = uploadMoneyService;
    }

    @PostMapping("/top-up")
    public ResponseEntity<String> topUpBalance(@RequestBody BalanceRequest request) {
        try {
            uploadMoneyService.topUpBalance(
                    request.getEmail(),
                    request.getCardNumber(),
                    request.getExpirationDate(),
                    request.getCvcCode(),
                    request.getMoney()
            );
            return ResponseEntity.ok("Balance successfully topped up.");
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

}

