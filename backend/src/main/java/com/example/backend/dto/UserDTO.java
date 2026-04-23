package com.example.backend.dto;

import com.example.backend.entity.User;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDTO {
    private Long id;
    @NotBlank private String username;
    private String password;
    @Email @NotBlank private String email;
    private String fullName;
    private String phone;
    private User.Role role;
    private boolean active;
}
