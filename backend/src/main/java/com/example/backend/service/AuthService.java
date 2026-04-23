package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final com.example.backend.security.JwtUtils jwtUtils;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(AuthRequest request) {
        // 1. Verify credentials (throws if wrong)
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // 2. Load the entity user directly from DB — NOT from UserDetailsService
        //    (UserDetailsService returns Spring's User wrapper, not your entity)
        User user = userRepo.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 3. Generate token from entity user (which has the Role enum)
        String token = jwtUtils.generateToken(user);

        return new AuthResponse(token, user.getId(), user.getUsername(),
                user.getEmail(), user.getFullName(), user.getRole());
    }

    public UserDTO register(UserDTO dto) {
        if (userRepo.existsByUsername(dto.getUsername()))
            throw new RuntimeException("Username already taken");
        if (userRepo.existsByEmail(dto.getEmail()))
            throw new RuntimeException("Email already registered");
        User user = User.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .email(dto.getEmail())
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .role(dto.getRole() != null ? dto.getRole() : User.Role.USER)
                .build();
        userRepo.save(user);
        dto.setPassword(null);
        dto.setId(user.getId());
        return dto;
    }
}