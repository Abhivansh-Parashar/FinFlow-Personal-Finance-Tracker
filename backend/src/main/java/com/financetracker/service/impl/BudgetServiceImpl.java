package com.financetracker.service.impl;

import com.financetracker.dto.request.BudgetRequest;
import com.financetracker.dto.response.BudgetResponse;
import com.financetracker.entity.Budget;
import com.financetracker.entity.Category;
import com.financetracker.entity.Transaction;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Implementation of {@link BudgetService}.
 *
 * TODO (Milestone 5):
 *  - setBudget(): check if budget already exists for (user, category, month)
 *    → if yes, update budgetAmount; if no, create new
 *    (This is an "upsert" pattern — good practice!)
 *
 *  - getBudgetsByMonth(): for each budget, compute spentAmount dynamically
 *    by querying TransactionRepository for expenses in that category and month
 *    → This is the "calculated field" pattern
 *
 *  - Tip: you can also cache spentAmount in the Budget entity and update it
 *    every time a transaction is created/updated/deleted
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    private User getCurrentUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return user;
    }
    @Override
    public BudgetResponse setBudget(BudgetRequest request) {
        User user = getCurrentUser();

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        // UPSERT: check if budget already exists for this user/category/month
        Optional<Budget> existing = budgetRepository.findByUserIdAndCategoryIdAndMonth(
                user.getId(), category.getId(), request.getMonth());

        Budget budget;
        if (existing.isPresent()) {
            // Update existing
            budget = existing.get();
            budget.setBudgetAmount(request.getBudgetAmount());
        } else {
            // Create new
            budget = Budget.builder()
                    .budgetAmount(request.getBudgetAmount())
                    .spentAmount(BigDecimal.ZERO)
                    .month(request.getMonth())
                    .user(user)
                    .category(category)
                    .build();
        }

        budget = budgetRepository.save(budget);
        return buildResponse(budget, budget.getSpentAmount());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgetsByMonth(String month) {

        User user = getCurrentUser();

        YearMonth yearMonth = YearMonth.parse(month);

        LocalDateTime startDate = yearMonth
                .atDay(1)
                .atStartOfDay();

        LocalDateTime endDate = yearMonth
                .atEndOfMonth()
                .atTime(23, 59, 59);

        List<Budget> budgets = budgetRepository
                .findAllByUserIdAndMonth(
                        user.getId(),
                        month
                );

        List<BudgetResponse> budgetResponses = new ArrayList<>();

        for (Budget budget : budgets) {

            List<Transaction> transactions =
                    transactionRepository
                            .findAllByUserIdAndCategoryIdAndDateBetween(
                                    user.getId(),
                                    budget.getCategory().getId(),
                                    startDate,
                                    endDate
                            );

            BigDecimal spentAmount = BigDecimal.ZERO;

            for (Transaction transaction : transactions) {
                spentAmount = spentAmount.add(
                        transaction.getAmount()
                );
            }

            BigDecimal percentageUsed = BigDecimal.ZERO;

            if (budget.getBudgetAmount().compareTo(BigDecimal.ZERO) > 0) {
                percentageUsed = spentAmount
                        .divide(
                                budget.getBudgetAmount(),
                                2,
                                RoundingMode.HALF_UP
                        )
                        .multiply(BigDecimal.valueOf(100));
            }

            BudgetResponse response = BudgetResponse.builder()
                    .categoryId(budget.getCategory().getId())
                    .categoryName(budget.getCategory().getName())
                    .categoryIcon(budget.getCategory().getIcon())
                    .budgetAmount(budget.getBudgetAmount())
                    .spentAmount(spentAmount)
                    .remainingAmount(
                            budget.getBudgetAmount()
                                    .subtract(spentAmount)
                    )
                    .percentageUsed(percentageUsed)
                    .month(budget.getMonth())
                    .build();

            budgetResponses.add(response);
        }

        return budgetResponses;
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetResponse getBudgetById(Long id) {
        User user = getCurrentUser();
        Budget budget = budgetRepository.findById(id).orElseThrow();

        if(!budget.getUser().equals(user)){
            throw new RuntimeException("Access denied: Budget doesn't belong to this user.");
        }
        BigDecimal percentageUsed = BigDecimal.ZERO;

        if(budget.getBudgetAmount().compareTo(BigDecimal.ZERO) > 0){
            percentageUsed = budget.getSpentAmount()
                    .divide(budget.getBudgetAmount(),
                    2,
                    RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        return BudgetResponse.builder()
                .categoryId(budget.getCategory().getId())
                .categoryName(budget.getCategory().getName())
                .categoryIcon(budget.getCategory().getIcon())
                .budgetAmount(budget.getBudgetAmount())
                .spentAmount(budget.getSpentAmount())
                .remainingAmount(budget.getBudgetAmount().subtract(budget.getSpentAmount()))
                .percentageUsed(percentageUsed)
                .month(budget.getMonth())
                .build();
    }

    @Override
    public void deleteBudget(Long id) {
        User user = getCurrentUser();
        Budget budget = budgetRepository.findById(id).orElseThrow();

        if(!budget.getUser().getId().equals(user.getId())){
            throw new RuntimeException("Access denied: Budget doesn't belong to this user.");
        }

        budgetRepository.deleteById(id);
    }

    private BudgetResponse buildResponse(Budget budget, BigDecimal spentAmount) {
        BigDecimal budgetAmount = budget.getBudgetAmount();
        BigDecimal remaining    = budgetAmount.subtract(spentAmount);
        BigDecimal percentageUsed = BigDecimal.ZERO;

        if (budgetAmount.compareTo(BigDecimal.ZERO) > 0) {
            percentageUsed = spentAmount
                    .divide(budgetAmount, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategory().getId())
                .categoryName(budget.getCategory().getName())
                .categoryIcon(budget.getCategory().getIcon())
                .budgetAmount(budgetAmount)
                .spentAmount(spentAmount)
                .remainingAmount(remaining)
                .percentageUsed(percentageUsed)
                .month(budget.getMonth())
                .build();
    }
}
