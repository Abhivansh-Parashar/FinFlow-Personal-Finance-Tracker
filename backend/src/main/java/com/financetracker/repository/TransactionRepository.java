package com.financetracker.repository;

import com.financetracker.entity.Transaction;
import com.financetracker.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for {@link Transaction}.
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

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND (:type IS NULL OR t.transactionType = :type) " +
           "AND (:startDate IS NULL OR t.date >= :startDate) " +
           "AND (:endDate IS NULL OR t.date <= :endDate) " +
           "AND (:categoryId IS NULL OR t.category.id = :categoryId)")
    Page<Transaction> findAllFiltered(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("categoryId") Long categoryId,
            Pageable pageable
    );

    long countByCategoryId(Long categoryId);
}