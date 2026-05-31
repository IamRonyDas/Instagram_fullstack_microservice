package com.instagram.auth.service;

import com.instagram.auth.dto.LoginRequest;
import com.instagram.auth.dto.RegisterRequest;
import com.instagram.auth.entity.User;
import com.instagram.auth.repository.UserRepository;
import com.instagram.auth.util.JwtUtil;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService implements AuthServiceInterface {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User registerUser(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(request.getUsername(), encodedPassword, request.getEmail());
        return userRepository.save(user);
    }

    @CircuitBreaker(name = "loginCircuitBreaker", fallbackMethod = "loginFallback")
    public String loginUser(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return jwtUtil.generateToken(user.getUsername());
            }
        }
        
        // Throwing an exception counts as a failure for the Circuit Breaker
        throw new RuntimeException("Invalid username or password");
    }

    // Fallback method when Circuit Breaker is OPEN
    public String loginFallback(LoginRequest request, Throwable t) {
        if (t instanceof io.github.resilience4j.circuitbreaker.CallNotPermittedException) {
            return "Service temporarily unavailable due to too many failed login attempts. Please try again after 40 seconds.";
        }
        throw new RuntimeException(t.getMessage());
    }
}
