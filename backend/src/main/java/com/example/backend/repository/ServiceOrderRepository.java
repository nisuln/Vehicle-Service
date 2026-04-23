package com.example.backend.repository;

import com.example.backend.entity.ServiceOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;

public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Long> {
    Optional<ServiceOrder> findByOrderNumber(String orderNumber);
    List<ServiceOrder> findByVehicleId(Long vehicleId);
    List<ServiceOrder> findByAssignedMechanicId(Long mechanicId);
    List<ServiceOrder> findByStatus(ServiceOrder.Status status);
    List<ServiceOrder> findByDateInBetween(LocalDate from, LocalDate to);

    @Query("SELECT so FROM ServiceOrder so JOIN so.vehicle v JOIN v.customer c WHERE c.id = :customerId")
    List<ServiceOrder> findByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COUNT(so) FROM ServiceOrder so WHERE so.status = :status")
    Long countByStatus(@Param("status") ServiceOrder.Status status);

    /**
     * Count completed service orders for a customer (by their email, linked via vehicle).
     * Used for loyalty tracking: every 5 completed = 1 free service.
     */
    @Query("SELECT COUNT(so) FROM ServiceOrder so " +
            "JOIN so.vehicle v JOIN v.customer c " +
            "WHERE c.email = :email " +
            "AND so.status IN ('COMPLETED', 'DELIVERED')")
    long countCompletedByCustomerEmail(@Param("email") String email);
}