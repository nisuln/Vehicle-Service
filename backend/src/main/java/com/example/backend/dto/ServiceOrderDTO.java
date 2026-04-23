package com.example.backend.dto;

import com.example.backend.entity.ServiceOrder;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ServiceOrderDTO {
    private Long id;
    private String orderNumber;
    @NotNull private Long vehicleId;
    private String vehicleInfo;
    private Long customerId;
    private String customerName;
    private Long assignedMechanicId;
    private String mechanicName;
    private ServiceOrder.Status status;
    @NotNull private ServiceOrder.Priority priority;
    private String serviceType;
    private String customerComplaint;
    private String technicianNotes;
    @NotNull private LocalDate dateIn;
    private LocalDate estimatedDateOut;
    private LocalDate dateOut;
    private Integer mileageIn;
    private Integer mileageOut;
    private BigDecimal laborCost;
    private BigDecimal partsCost;
    private BigDecimal totalCost;
    private BigDecimal discount;
    private BigDecimal taxRate;
    private List<ServiceItemDTO> serviceItems;
    private List<ServicePartDTO> serviceParts;
}