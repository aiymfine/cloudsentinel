package com.cloudsentinel.service;

import com.cloudsentinel.dto.AuthResponse;
import com.cloudsentinel.dto.LoginRequest;
import com.cloudsentinel.dto.RegisterRequest;
import com.cloudsentinel.exception.ResourceNotFoundException;
import com.cloudsentinel.model.Role;
import com.cloudsentinel.model.User;
import com.cloudsentinel.repository.UserRepository;
import com.cloudsentinel.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists: " + request.getUsername());
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());
        User user = User.builder()
            .userId(UUID.randomUUID().toString())
            .username(request.getUsername())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .role(role.name())
            .enabled(true)
            .createdAt(Instant.now())
            .build();

        userRepository.save(user);
        String token = tokenProvider.generateToken(user.getUserId(), user.getUsername(), user.getRole());

        log.info("User registered: {}", user.getUsername());
        return AuthResponse.builder()
            .token(token)
            .username(user.getUsername())
            .role(user.getRole())
            .userId(user.getUserId())
            .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUsername()));

        if (!user.isEnabled()) {
            throw new IllegalArgumentException("User account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        user.setLastLogin(Instant.now());
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getUserId(), user.getUsername(), user.getRole());
        auditService.log(user.getUserId(), user.getUsername(), "LOGIN", "auth", "User logged in", null);

        log.info("User logged in: {}", user.getUsername());
        return AuthResponse.builder()
            .token(token)
            .username(user.getUsername())
            .role(user.getRole())
            .userId(user.getUserId())
            .build();
    }

    @Override
    public void run(String... args) {
        seedDefaultUsers();
    }

    private void seedDefaultUsers() {
        if (userRepository.count() > 0) {
            log.info("Users already exist, skipping seed");
            return;
        }

        log.info("Seeding default users...");
        createUser("admin", "admin@cloudsentinel.com", "admin123", Role.ADMIN);
        createUser("editor", "editor@cloudsentinel.com", "editor123", Role.EDITOR);
        createUser("viewer", "viewer@cloudsentinel.com", "viewer123", Role.VIEWER);
    }

    private void createUser(String username, String email, String password, Role role) {
        User user = User.builder()
            .userId(UUID.randomUUID().toString())
            .username(username)
            .email(email)
            .passwordHash(passwordEncoder.encode(password))
            .role(role.name())
            .enabled(true)
            .createdAt(Instant.now())
            .build();
        userRepository.save(user);
        log.info("Created default user: {} with role {}", username, role);
    }
}
