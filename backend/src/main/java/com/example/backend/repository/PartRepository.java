package com.example.backend.repository;

import com.example.backend.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface PartRepository extends JpaRepository<Part, Long> {
    Optional<Part> findByPartNumber(String partNumber);
    List<Part> findByActiveTrueOrderByNameAsc();
    List<Part> findByCategory(String category);
    @Query("SELECT p FROM Part p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%')) " +
            "OR LOWER(p.partNumber) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Part> searchParts(@Param("q") String q);
    @Query("SELECT p FROM Part p WHERE p.stockQuantity <= p.minimumStock AND p.active = true")
    List<Part> findLowStockParts();
}