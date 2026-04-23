package com.example.backend.repository;

import com.example.backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
    @Query("SELECT c FROM Customer c WHERE LOWER(c.firstName) LIKE LOWER(CONCAT('%',:q,'%')) " +
            "OR LOWER(c.lastName) LIKE LOWER(CONCAT('%',:q,'%')) " +
            "OR LOWER(c.email) LIKE LOWER(CONCAT('%',:q,'%')) " +
            "OR c.phone LIKE CONCAT('%',:q,'%')")
    List<Customer> searchCustomers(@Param("q") String q);

}