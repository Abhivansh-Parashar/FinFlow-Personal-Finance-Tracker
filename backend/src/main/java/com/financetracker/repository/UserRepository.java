package com.financetracker.repository;

import com.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User}.
 *
 * TODO (Milestone 1 — User Auth):
 *  - Add: Optional<User> findByEmail(String email)
 *  - Add: boolean existsByEmail(String email)
 *
 * Spring Data automatically implements these — no code needed in the body!
 * Just declare the method signatures and Spring generates the queries.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // TODO: Add query methods here
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
