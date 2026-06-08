package com.financetracker.repository;

import com.financetracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Budget}.
 *
 * TODO (Milestone 5 — Budget):
 *  - findAllByUserId(Long userId)
 *  - findAllByUserIdAndMonth(Long userId, String month)
 *  - findByUserIdAndCategoryIdAndMonth(Long userId, Long categoryId, String month)
 *  - existsByUserIdAndCategoryIdAndMonth(Long userId, Long categoryId, String month)
 */
@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // TODO: Add query methods here

}
