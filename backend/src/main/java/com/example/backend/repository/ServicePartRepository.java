package com.example.backend.repository;

import com.example.backend.entity.ServicePart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServicePartRepository extends JpaRepository<ServicePart, Long> {
    List<ServicePart> findByServiceOrderId(Long serviceOrderId);
    void deleteByServiceOrderId(Long serviceOrderId);
}