package com.example.backend.repository;

import com.example.backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByCustomerId(Long customerId);
    Optional<Vehicle> findByVin(String vin);
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    @Query("SELECT v FROM Vehicle v WHERE LOWER(v.make) LIKE LOWER(CONCAT('%',:q,'%')) " +
            "OR LOWER(v.model) LIKE LOWER(CONCAT('%',:q,'%')) " +
            "OR LOWER(v.licensePlate) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Vehicle> searchVehicles(@Param("q") String q);
}