package com.example.backend.service;

import com.example.backend.dto.DashboardStatsDTO;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;

@Service @RequiredArgsConstructor
public class DashboardService {
    private final CustomerRepository customerRepo;
    private final VehicleRepository vehicleRepo;
    private final ServiceOrderRepository orderRepo;
    private final PartRepository partRepo;
    private final InvoiceRepository invoiceRepo;

    public DashboardStatsDTO getStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalCustomers(customerRepo.count());
        stats.setTotalVehicles(vehicleRepo.count());
        stats.setTotalOrders(orderRepo.count());
        stats.setPendingOrders(orderRepo.countByStatus(ServiceOrder.Status.PENDING));
        stats.setInProgressOrders(orderRepo.countByStatus(ServiceOrder.Status.IN_PROGRESS));
        stats.setCompletedOrders(orderRepo.countByStatus(ServiceOrder.Status.COMPLETED));
        stats.setTotalParts(partRepo.findByActiveTrueOrderByNameAsc().size());
        stats.setLowStockParts(partRepo.findLowStockParts().size());
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        Double rev = invoiceRepo.sumTotalBetween(startOfMonth, LocalDate.now());
        stats.setRevenueThisMonth(rev != null ? BigDecimal.valueOf(rev) : BigDecimal.ZERO);
        return stats;
    }
}