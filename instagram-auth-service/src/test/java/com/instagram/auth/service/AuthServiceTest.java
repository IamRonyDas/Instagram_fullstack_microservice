package com.instagram.auth.service;

import com.instagram.auth.dto.LoginRequest;
import com.instagram.auth.dto.RegisterRequest;
import com.instagram.auth.entity.User;
import com.instagram.auth.repository.UserRepository;
import com.instagram.auth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private JwtUtil jwtUtil;

    // AuthService creates its own BCryptPasswordEncoder internally — we spy on the whole service
    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, jwtUtil);
    }

    // ─── registerUser ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("Register: success — new username and email")
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("alice");
        req.setEmail("alice@example.com");
        req.setPassword("secret");

        when(userRepository.findByUsername("alice")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = authService.registerUser(req);

        assertNotNull(result);
        assertEquals("alice", result.getUsername());
        // Password should be BCrypt-encoded (starts with $2a$)
        assertTrue(result.getPassword().startsWith("$2a$"));
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Register: fails when username already taken")
    void register_duplicateUsername_throws() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("alice");
        req.setEmail("alice@example.com");
        req.setPassword("secret");

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(new User()));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> authService.registerUser(req));
        assertTrue(ex.getMessage().contains("Username already exists"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Register: fails when email already taken")
    void register_duplicateEmail_throws() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("bob");
        req.setEmail("taken@example.com");
        req.setPassword("secret");

        when(userRepository.findByUsername("bob")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("taken@example.com")).thenReturn(Optional.of(new User()));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> authService.registerUser(req));
        assertTrue(ex.getMessage().contains("Email already exists"));
    }

    // ─── loginUser ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Login: success — correct credentials return JWT")
    void login_success() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashed = encoder.encode("secret");

        User user = new User("alice", hashed, "alice@example.com");
        LoginRequest req = new LoginRequest();
        req.setUsername("alice");
        req.setPassword("secret");

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("alice")).thenReturn("jwt.token.here");

        String token = authService.loginUser(req);
        assertEquals("jwt.token.here", token);
    }

    @Test
    @DisplayName("Login: fails — user not found")
    void login_userNotFound_throws() {
        LoginRequest req = new LoginRequest();
        req.setUsername("ghost");
        req.setPassword("pass");

        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.loginUser(req));
    }

    @Test
    @DisplayName("Login: fails — wrong password")
    void login_wrongPassword_throws() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashed = encoder.encode("correctPassword");

        User user = new User("alice", hashed, "alice@example.com");
        LoginRequest req = new LoginRequest();
        req.setUsername("alice");
        req.setPassword("wrongPassword");

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));

        assertThrows(RuntimeException.class, () -> authService.loginUser(req));
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    @DisplayName("Login fallback: returns message when circuit open")
    void login_fallback_circuitOpen() {
        LoginRequest req = new LoginRequest();
        req.setUsername("alice");
        req.setPassword("secret");

        io.github.resilience4j.circuitbreaker.CallNotPermittedException cbEx =
                io.github.resilience4j.circuitbreaker.CallNotPermittedException.createCallNotPermittedException(
                        io.github.resilience4j.circuitbreaker.CircuitBreaker.ofDefaults("test"));

        String result = authService.loginFallback(req, cbEx);
        assertTrue(result.contains("temporarily unavailable"));
    }
}
