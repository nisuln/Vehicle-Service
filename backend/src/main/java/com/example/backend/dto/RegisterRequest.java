// src/main/java/com/example/backend/dto/RegisterRequest.java
package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String fullName;
    private String phone;

    /**
     * Role field is accepted from the request but ALWAYS overridden to USER
     * in AuthService. This prevents privilege escalation via the API.
     * ADMIN accounts can only be created directly in the database or by
     * an existing admin through a separate admin-only endpoint.
     */
    private String role;
}