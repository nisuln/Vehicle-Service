package com.example.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PartDTO {
    private Long id;
    @NotBlank private String partNumber;
    @NotBlank private String name;
    private String description;
    private String brand;
    private String category;
    @NotNull private BigDecimal unitCost;
    @NotNull private BigDecimal sellingPrice;
    private Integer stockQuantity;
    private Integer minimumStock;
    private String unit;
    private String supplier;
    private boolean active;
    private boolean lowStock;

    // Base64-encoded image returned to frontend; null when no image
    private String imageBase64;
    private String imageType;
}