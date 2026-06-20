package com.financetracker.repository;

import com.financetracker.entity.Transaction;
import com.financetracker.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for {@link Transaction}.
 *
 * TODO (Milestone 3 — Transactions):
 *  - findAllByUserId(Long userId, Pageable pageable)
 *  - findAllByUserIdAndTransactionType(Long userId, TransactionType transactionType, Pageable pageable)
 *  - findAllByUserIdAndDateBetween(Long userId, LocalDateTime start, LocalDateTime end, Pageable pageable)
 *  - findAllByUserIdAndCategoryId(Long userId, Long categoryId, Pageable pageable)
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findAllByUserId(
            Long userId,
            Pageable pageable
    );

    Page<Transaction> findAllByUserIdAndTransactionType(
            Long userId,
            TransactionType transactionType,
            Pageable pageable
    );

    Page<Transaction> findAllByUserIdAndDateBetween(
            Long userId,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable
    );

    Page<Transaction> findAllByUserIdAndCategoryId(
            Long userId,
            Long categoryId,
            Pageable pageable
    );

    List<Transaction> findAllByUserIdAndCategoryIdAndDateBetween(
            Long userId,
            Long categoryId,
            LocalDateTime start,
            LocalDateTime end
    );
}