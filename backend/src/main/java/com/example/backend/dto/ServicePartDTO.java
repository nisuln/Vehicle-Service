package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ServicePartDTO {
    private Long id;
    private Long serviceOrderId;
    @NotNull private Long partId;
    private String partName;
    private String partNumber;
    @NotNull private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String notes;
}