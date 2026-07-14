package com.financetracker.service;

import com.financetracker.dto.request.TransactionRequest;
import com.financetracker.dto.response.TransactionResponse;
import com.financetracker.entity.Category;
import com.financetracker.entity.Transaction;
import com.financetracker.entity.User;
import com.financetracker.enums.TransactionType;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import com.financetracker.service.impl.TransactionServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TransactionServiceImplTest {

    @Mock
    TransactionRepository transactionRepository;
    @Mock
    CategoryRepository categoryRepository;
    @Mock
    UserRepository userRepository;

    @InjectMocks
    TransactionServiceImpl transactionServiceImpl;

    private User testUser;
    private Category testCategory;

    @BeforeEach
    public void init(){
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        testCategory = new Category();
        testCategory.setId(10L);
        testCategory.setName("Food");
        testCategory.setIcon("🍽️");
        testCategory.setIsDefault(true);

        Authentication auth = mock(Authentication.class);
        SecurityContext ctx = mock(SecurityContext.class);
        when(auth.getName()).thenReturn("test@example.com");
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createTransaction_ShouldReturnResponse_WhenValidRequest() {

        TransactionRequest request = new TransactionRequest();
        request.setCategoryId(10L);
        request.setAmount(new BigDecimal("500.00"));
        request.setDescription("Lunch");
        request.setTransactionType(TransactionType.EXPENSE);
        request.setDate(LocalDateTime.now());
        Transaction savedTxn = Transaction.builder()
                .id(100L)
                .description("Lunch")
                .amount(new BigDecimal("500.00"))
                .transactionType(TransactionType.EXPENSE)
                .date(request.getDate())
                .user(testUser)
                .category(testCategory)
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(testCategory));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTxn);

        TransactionResponse response = transactionServiceImpl.createTransaction(request);

        assertThat(response).isNotNull();
        assertThat(response.getDescription()).isEqualTo("Lunch");
        assertThat(response.getAmount()).isEqualByComparingTo("500.00");
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void createTransaction_ShouldThrow_WhenCategoryNotFound() {
        TransactionRequest request = new TransactionRequest();
        request.setCategoryId(999L);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> transactionServiceImpl.createTransaction(request))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void getTransactionById_ShouldThrow_WhenTransactionBelongsToAnotherUser() {
        User anotherUser = new User();
        anotherUser.setId(99L);
        anotherUser.setEmail("other@example.com");
        Transaction txn = Transaction.builder()
                .id(1L)
                .user(anotherUser)
                .category(testCategory)
                .build();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(txn));
        assertThatThrownBy(() -> transactionServiceImpl.getTransactionById(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Access denied");
    }

    @Test
    void deleteTransaction_ShouldCallDeleteById_WhenOwnerDeletes() {
        Transaction txn = Transaction.builder()
                .id(1L)
                .user(testUser)
                .category(testCategory)
                .build();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(txn));
        doNothing().when(transactionRepository).deleteById(1L);
        transactionServiceImpl.deleteTransaction(1L);
        verify(transactionRepository, times(1)).deleteById(1L);
    }
}
