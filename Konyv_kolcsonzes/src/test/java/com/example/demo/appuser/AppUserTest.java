package com.example.demo.appuser;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class AppUserTest {

    @Test
    void testGetRealUsername() {
        AppUser user = AppUser.builder()
                .username("realUser")
                .build();

        assertEquals("realUser", user.getRealUsername());
    }

    @Test
    void testGetUsernameReturnsEmail() {
        AppUser user = AppUser.builder()
                .email("example@test.com")
                .build();

        assertEquals("example@test.com", user.getUsername());
    }

    @Test
    void testGetAuthoritiesReturnsEmptyList() {
        AppUser user = new AppUser();

        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();

        assertNotNull(authorities);
        assertEquals(Collections.emptyList(), authorities);
    }

    @Test
    void testIsAccountNonExpired() {
        AppUser user = new AppUser();
        assertTrue(user.isAccountNonExpired());
    }

    @Test
    void testIsAccountNonLocked() {
        AppUser user = new AppUser();
        assertTrue(user.isAccountNonLocked());
    }

    @Test
    void testIsCredentialsNonExpired() {
        AppUser user = new AppUser();
        assertTrue(user.isCredentialsNonExpired());
    }

    @Test
    void testIsEnabled() {
        AppUser user = new AppUser();
        assertTrue(user.isEnabled());
    }

    @Test
    void testGettersAndSetters() {
        AppUser user = new AppUser();

        user.setId(10L);
        user.setName("Teszt Elek");
        user.setUsername("tesztuser");
        user.setEmail("teszt@example.com");
        user.setPassword("pwd123");
        user.setMoney(500.0);

        assertEquals(10L, user.getId());
        assertEquals("Teszt Elek", user.getName());
        assertEquals("tesztuser", user.getRealUsername());
        assertEquals("teszt@example.com", user.getEmail());
        assertEquals("pwd123", user.getPassword());
        assertEquals(500.0, user.getMoney());
    }
}
