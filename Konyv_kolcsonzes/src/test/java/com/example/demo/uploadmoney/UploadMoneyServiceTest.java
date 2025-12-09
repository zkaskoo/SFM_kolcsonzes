package com.example.demo.uploadmoney;

import com.example.demo.appuser.AppUser;
import com.example.demo.appuser.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class UploadMoneyServiceTest {

    private UploadMoneyService uploadMoneyService;
    private AppUserRepository appUserRepository;

    @BeforeEach
    void setup() {
        appUserRepository = Mockito.mock(AppUserRepository.class);
        uploadMoneyService = new UploadMoneyService(appUserRepository);
    }

    @Test
    void topUpBalance_success() {
        AppUser user = new AppUser();
        user.setEmail("test@example.com");
        user.setMoney(50.0);

        when(appUserRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        uploadMoneyService.topUpBalance(
                "test@example.com",
                "1234567812345678",
                "12/30",
                "123",
                100.0
        );

        verify(appUserRepository, times(1)).save(user);
        assertThat(user.getMoney()).isEqualTo(150.0);
    }

    @Test
    void topUpBalance_invalidEmail() {
        when(appUserRepository.findByEmail("missing@test.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                uploadMoneyService.topUpBalance(
                        "missing@test.com",
                        "1234567812345678",
                        "12/30",
                        "123",
                        100.0
                )
        ).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Nincs az email regisztrálva");
    }

    @Test
    void topUpBalance_invalidCardNumber() {
        AppUser user = new AppUser();
        user.setMoney(20);

        when(appUserRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        assertThatThrownBy(() ->
                uploadMoneyService.topUpBalance(
                        "test@example.com",
                        "12345",
                        "12/30",
                        "123",
                        100.0
                )
        ).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Nem megfelelő a kártyaszám");
    }

    @Test
    void topUpBalance_invalidCVC() {
        AppUser user = new AppUser();

        when(appUserRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        assertThatThrownBy(() ->
                uploadMoneyService.topUpBalance(
                        "test@example.com",
                        "1234567812345678",
                        "12/30",
                        "1",
                        100.0
                )
        ).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Nem megfelelő a cvc kód");
    }

    @Test
    void topUpBalance_expiredCard() {
        AppUser user = new AppUser();

        when(appUserRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        // lejárt dátum → 01/20
        assertThatThrownBy(() ->
                uploadMoneyService.topUpBalance(
                        "test@example.com",
                        "1234567812345678",
                        "01/20",
                        "123",
                        100.0
                )
        ).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("A kártya már lejárt");
    }
}
