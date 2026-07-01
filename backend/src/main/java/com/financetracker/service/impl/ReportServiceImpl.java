package com.financetracker.service.impl;

import com.financetracker.dto.response.CategoryBreakdownResponse;
import com.financetracker.dto.response.MonthlySummaryResponse;
import com.financetracker.entity.Category;
import com.financetracker.entity.Transaction;
import com.financetracker.entity.User;
import com.financetracker.enums.TransactionType;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.Year;
import java.time.YearMonth;
import java.util.*;

/**
 * Implementation of {@link ReportService}.
 *
 * TODO (Milestone 6):
 *  - getMonthlySummary():
 *    1. Compute startDate = today minus lastNMonths
 *    2. Use a @Query in TransactionRepository to GROUP BY year/month and sum amounts
 *    3. Separate income and expense rows → combine into MonthlySummaryResponse
 *    4. Add netSavings = income - expense, savingsRate = netSavings / income * 100
 *
 *  - getCategoryBreakdown():
 *    1. Query all EXPENSE transactions for the given month
 *    2. Group by category, sum amounts
 *    3. Compute percentage of each category vs total
 *    4. Sort by amount descending
 *
 *  These are great places to practice JPQL @Query annotations!
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private User getCurrentUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MonthlySummaryResponse> getMonthlySummary(int lastNMonths) {

        User user = getCurrentUser();

        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusMonths(lastNMonths);

        List<Transaction> transactions =
                transactionRepository
                        .findAllByUserIdAndDateBetween(
                                user.getId(),
                                startDate,
                                endDate,
                                Pageable.unpaged()
                        )
                        .getContent();

        Map<YearMonth, BigDecimal> incomeMap = new HashMap<>();
        Map<YearMonth, BigDecimal> expenseMap = new HashMap<>();

        for (Transaction transaction : transactions) {

            YearMonth month = YearMonth.from(transaction.getDate());

            if (transaction.getTransactionType() == TransactionType.INCOME) {

                incomeMap.put(
                        month,
                        incomeMap.getOrDefault(month, BigDecimal.ZERO)
                                .add(transaction.getAmount())
                );

            } else {

                expenseMap.put(
                        month,
                        expenseMap.getOrDefault(month, BigDecimal.ZERO)
                                .add(transaction.getAmount())
                );
            }
        }

        List<MonthlySummaryResponse> responses = new ArrayList<>();

        Set<YearMonth> months = new HashSet<>();
        months.addAll(incomeMap.keySet());
        months.addAll(expenseMap.keySet());

        for (YearMonth month : months) {

            BigDecimal income =
                    incomeMap.getOrDefault(month, BigDecimal.ZERO);

            BigDecimal expense =
                    expenseMap.getOrDefault(month, BigDecimal.ZERO);

            BigDecimal netSavings =
                    income.subtract(expense);

            BigDecimal savingsRate = BigDecimal.ZERO;

            if (income.compareTo(BigDecimal.ZERO) > 0) {
                savingsRate = netSavings
                        .divide(
                                income,
                                2,
                                RoundingMode.HALF_UP
                        )
                        .multiply(BigDecimal.valueOf(100));
            }

            responses.add(
                    MonthlySummaryResponse.builder()
                            .month(month.toString())
                            .totalIncome(income)
                            .totalExpense(expense)
                            .netSavings(netSavings)
                            .savingsRate(savingsRate)
                            .build()
            );
        }

        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryBreakdownResponse> getCategoryBreakdown(String month) {

        User user = getCurrentUser();

        YearMonth yearMonth = YearMonth.parse(month);

        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();

        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        Page<Transaction> transactions = transactionRepository.findAllByUserIdAndDateBetween(
                                user.getId(),
                                startDate,
                                endDate,
                                Pageable.unpaged()
                        );

        Map<Category, BigDecimal> categoryTotals = new HashMap<>();

        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Transaction transaction : transactions) {
            if (transaction.getTransactionType() == TransactionType.EXPENSE) {
                Category category = transaction.getCategory();

                categoryTotals.put(
                        category,
                        categoryTotals.getOrDefault(
                                category,
                                BigDecimal.ZERO
                        ).add(transaction.getAmount())
                );

                totalExpense = totalExpense.add(transaction.getAmount());
            }
        }

        List<CategoryBreakdownResponse> responses = new ArrayList<>();

        for (Map.Entry<Category, BigDecimal> entry : categoryTotals.entrySet()) {

            Category category = entry.getKey();
            BigDecimal amount = entry.getValue();

            BigDecimal percentage = BigDecimal.ZERO;

            if (totalExpense.compareTo(BigDecimal.ZERO) > 0) {

                percentage = amount.divide(
                                totalExpense,
                                2,
                                RoundingMode.HALF_UP
                        )
                        .multiply(BigDecimal.valueOf(100));
            }

            responses.add(CategoryBreakdownResponse.builder()
                            .categoryId(category.getId())
                            .categoryName(category.getName())
                            .categoryIcon(category.getIcon())
                            .totalAmount(amount)
                            .percentage(percentage)
                            .build()
            );
        }

        responses.sort(Comparator.comparing(CategoryBreakdownResponse::getTotalAmount).reversed());

        return responses;
    }
    @Override
    @Transactional(readOnly = true)
    public List<MonthlySummaryResponse> getYearlySummary(int year) {

        User user = getCurrentUser();

        LocalDateTime startDate = LocalDateTime.of(year, 1, 1, 0, 0);

        LocalDateTime endDate = LocalDateTime.of(year, 12, 31, 23, 59, 59);

        Page <Transaction> transactions = transactionRepository
                        .findAllByUserIdAndDateBetween(
                                user.getId(),
                                startDate,
                                endDate,
                                Pageable.unpaged()
                        );

        Map<Integer, BigDecimal> incomeMap = new HashMap<>();
        Map<Integer, BigDecimal> expenseMap = new HashMap<>();

        for (Transaction transaction : transactions) {

            int month = transaction.getDate().getMonthValue();

            if (transaction.getTransactionType() == TransactionType.INCOME) {
                incomeMap.put(
                        month,
                        incomeMap.getOrDefault(
                                month,
                                BigDecimal.ZERO
                        ).add(transaction.getAmount())
                );
            } else {
                expenseMap.put(
                        month,
                        expenseMap.getOrDefault(
                                month,
                                BigDecimal.ZERO
                        ).add(transaction.getAmount())
                );
            }
        }

        List<MonthlySummaryResponse> responses = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            BigDecimal income = incomeMap.getOrDefault(
                            month,
                            BigDecimal.ZERO
                    );

            BigDecimal expense = expenseMap.getOrDefault(
                            month,
                            BigDecimal.ZERO
                    );

            BigDecimal netSavings = income.subtract(expense);
            BigDecimal savingsRate = BigDecimal.ZERO;

            if (income.compareTo(BigDecimal.ZERO) > 0) {
                savingsRate = netSavings
                        .divide(
                                income,
                                2,
                                RoundingMode.HALF_UP
                        )
                        .multiply(BigDecimal.valueOf(100));
            }

            responses.add(
                    MonthlySummaryResponse.builder()
                            .month(Month.of(month).toString())
                            .totalIncome(income)
                            .totalExpense(expense)
                            .netSavings(netSavings)
                            .savingsRate(savingsRate)
                            .build()
            );
        }

        return responses;
    }
}
