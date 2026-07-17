package com.financetracker.repository;

import com.financetracker.entity.Category;
import com.financetracker.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Category}.
 *
 * TODO (Milestone 2 — Categories):
 *  - findAllByUserId(Long userId)
 *  - findAllByUserIdAndType(Long userId, TransactionType type)
 *  - findAllByIsDefaultTrue()  — returns system-wide default categories
 *  - existsByNameAndUserId(String name, Long userId)
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByUserId(Long userId);
    List<Category> findAllByUserIdAndType(Long userId, TransactionType type);
    List<Category> findAllByIsDefaultTrue();
    boolean existsByNameAndUserId(String name, Long userId);
    List<Category> findAllByIsDefaultTrueAndType(TransactionType type);
    @Query("""
    SELECT c
    FROM Category c
    WHERE c.type = :type
    AND (
            c.isDefault = true
            OR c.user.id = :userId
    )
    ORDER BY c.name
    """)
    List<Category> findAvailableCategories(
            @Param("userId") Long userId,
            @Param("type") TransactionType type
    );

}
