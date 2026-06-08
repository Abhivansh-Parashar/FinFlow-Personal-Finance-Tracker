package com.financetracker.repository;

import com.financetracker.entity.Category;
import com.financetracker.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

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

    // TODO: Add query methods here

}
