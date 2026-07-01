package com.financetracker.config;

import com.financetracker.entity.Category;
import com.financetracker.enums.TransactionType;
import com.financetracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.findAllByIsDefaultTrue().isEmpty()) {
            List<Category> defaultCategories = List.of(
                    // INCOME
                    Category.builder().name("Salary").icon("💰").color("#4CAF50").type(TransactionType.INCOME).isDefault(true).user(null).build(),
                    Category.builder().name("Freelance").icon("💻").color("#2196F3").type(TransactionType.INCOME).isDefault(true).user(null).build(),
                    Category.builder().name("Investments").icon("📈").color("#9C27B0").type(TransactionType.INCOME).isDefault(true).user(null).build(),
                    Category.builder().name("Rental Income").icon("🏠").color("#FF9800").type(TransactionType.INCOME).isDefault(true).user(null).build(),
                    Category.builder().name("Business").icon("📊").color("#00BCD4").type(TransactionType.INCOME).isDefault(true).user(null).build(),
                    Category.builder().name("Other Income").icon("💵").color("#607D8B").type(TransactionType.INCOME).isDefault(true).user(null).build(),
                    // EXPENSE
                    Category.builder().name("Food & Dining").icon("🍕").color("#F44336").type(TransactionType.EXPENSE).isDefault(true).user(null).build(),
                    Category.builder().name("Transportation").icon("🚗").color("#3F51B5").type(TransactionType.EXPENSE).isDefault(true).user(null).build(),
                    Category.builder().name("Shopping").icon("🛍️").color("#E91E63").type(TransactionType.EXPENSE).isDefault(true).user(null).build(),
                    Category.builder().name("Entertainment").icon("🎮").color("#673AB7").type(TransactionType.EXPENSE).isDefault(true).user(null).build(),
                    Category.builder().name("Bills & Utilities").icon("💡").color("#FFC107").type(TransactionType.EXPENSE).isDefault(true).user(null).build(),
                    Category.builder().name("Healthcare").icon("🏥").color("#009688").type(TransactionType.EXPENSE).isDefault(true).user(null).build(),
                    Category.builder().name("Education").icon("📚").color("#795548").type(TransactionType.EXPENSE).isDefault(true).user(null).build(),
                    Category.builder().name("Travel").icon("✈️").color("#FF5722").type(TransactionType.EXPENSE).isDefault(true).user(null).build(),
                    Category.builder().name("Groceries").icon("🛒").color("#8BC34A").type(TransactionType.EXPENSE).isDefault(true).user(null).build(),
                    Category.builder().name("Other").icon("📦").color("#9E9E9E").type(TransactionType.EXPENSE).isDefault(true).user(null).build()
            );
            categoryRepository.saveAll(defaultCategories);
        }
    }
}
