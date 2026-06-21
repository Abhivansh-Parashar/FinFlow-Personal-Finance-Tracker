package com.financetracker.controller;

import com.financetracker.dto.response.CategoryBreakdownResponse;
import com.financetracker.dto.response.MonthlySummaryResponse;
import com.financetracker.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for reports and analytics (read-only).
 *
 * Base URL: /api/v1/reports
 *
 * GET /monthly-summary?months=6
 * GET /category-breakdown?month=2025-06
 * GET /yearly-summary?year=2025
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/monthly-summary")
    public ResponseEntity<List<MonthlySummaryResponse>> getMonthlySummary(@RequestParam int months) {
        return ResponseEntity.ok(reportService.getMonthlySummary(months));
    }

    @GetMapping("/category-breakdown")
    public ResponseEntity<List<CategoryBreakdownResponse>> getCategoryBreakdown(@RequestParam String month) {
        return ResponseEntity.ok(reportService.getCategoryBreakdown(month));
    }

    @GetMapping("/yearly-summary")
    public ResponseEntity<List<MonthlySummaryResponse>> getYearlySummary(@RequestParam int year) {
        return ResponseEntity.ok(reportService.getYearlySummary(year));
    }
}