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
 * TODO (Milestone 6):
 *  GET /monthly-summary?months=6     → getMonthlySummary()      → 200
 *  GET /category-breakdown?month=    → getCategoryBreakdown()   → 200
 *  GET /yearly-summary?year=2025     → getYearlySummary()       → 200
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // TODO: Implement endpoints

}
