package com.example.backend.controller;

import com.example.backend.dto.DashboardStatsDTO;
import com.example.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/dashboard") @RequiredArgsConstructor
public class DashboardController {
    private final DashboardService service;

    @GetMapping("/stats")
    public DashboardStatsDTO getStats() { return service.getStats(); }
}