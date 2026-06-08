package com.financetracker.repository;

import com.financetracker.entity.Transaction;
import com.financetracker.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Repository for {@link Transaction}.
 *
 * TODO (Milestone 3 — Transactions):
 *  - findAllByUserId(Long userId, Pageable pageable)
 *  - findAllByUserIdAndType(Long userId, TransactionType type, Pageable pageable)
 *  - findAllByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end, Pageable pageable)
 *  - findAllByUserIdAndCategoryId(Long userId, Long categoryId, Pageable pageable)
 *
 * TODO (Milestone 6 — Reports / Summary):
 *  - @Query to sum amounts by type and month
 *  - @Query to get category-wise breakdown for a given month
 *  - Use JPQL or native SQL for complex aggregations
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // TODO: Add query methods here

}
