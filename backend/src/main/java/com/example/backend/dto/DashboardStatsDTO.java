package com.example.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DashboardStatsDTO {
    private long totalCustomers;
    private long totalVehicles;
    private long pendingOrders;
    private long inProgressOrders;
    private long completedOrders;
    private long totalOrders;
    private BigDecimal revenueThisMonth;
    private long lowStockParts;
    private long totalParts;
}