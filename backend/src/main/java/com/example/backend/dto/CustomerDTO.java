package com.example.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CustomerDTO {
    private Long id;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @Email private String email;
    @NotBlank private String phone;
    private String altPhone;
    private String address;
    private String city;
    private String zipCode;
    private String notes;
    private int vehicleCount;
}