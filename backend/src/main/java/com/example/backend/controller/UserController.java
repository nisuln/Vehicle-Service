package com.example.backend.controller;

import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── ADMIN: list all users ─────────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAll() {
        return ResponseEntity.ok(
                userRepository.findAll().stream()
                        .map(this::toDTO)
                        .collect(Collectors.toList())
        );
    }

    // ── BOTH ROLES: get mechanics list (used in booking dropdowns) ────────────
    // NOTE: SecurityConfig also allows this via .requestMatchers GET /api/users/mechanics
    @GetMapping("/mechanics")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'USER')")
    public ResponseEntity<List<UserDTO>> getMechanics() {
        // Returns all ADMIN users as mechanics (add MECHANIC role later if needed)
        return ResponseEntity.ok(
                userRepository.findAll().stream()
                        .filter(u -> u.getRole() == User.Role.ADMIN)
                        .map(this::toDTO)
                        .collect(Collectors.toList())
        );
    }

    // ── ADMIN only: create a new ADMIN account ────────────────────────────────
    @PostMapping("/create-admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> createAdmin(@RequestBody RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already taken");
        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");

        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .email(req.getEmail())
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .role(User.Role.ADMIN)
                .active(true)
                .build();

        return ResponseEntity.ok(toDTO(userRepository.save(user)));
    }

    // ── ADMIN: update user ────────────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> update(@PathVariable Long id, @RequestBody UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPhone()    != null) user.setPhone(dto.getPhone());
        if (dto.getEmail()    != null) user.setEmail(dto.getEmail());
        return ResponseEntity.ok(toDTO(userRepository.save(user)));
    }

    // ── ADMIN: deactivate user ────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    private UserDTO toDTO(User u) {
        return UserDTO.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .phone(u.getPhone())
                .role(u.getRole())
                .active(u.isActive())
                .build();
    }
}