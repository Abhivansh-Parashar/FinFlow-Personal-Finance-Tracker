package com.financetracker.mapper;

import com.financetracker.dto.request.TransactionRequest;
import com.financetracker.dto.response.TransactionResponse;
import com.financetracker.entity.Transaction;
import org.mapstruct.*;

/**
 * MapStruct mapper for Transaction entity <-> DTOs.
 *
 * TODO (Milestone 3):
 *  - toResponse(Transaction): map entity to response DTO
 *    Note: map category.name → categoryName, category.icon → categoryIcon
 *    Use @Mapping(source = "category.name", target = "categoryName")
 *  - toEntity(TransactionRequest): map request DTO to entity (without user/category)
 *  - updateEntityFromRequest(TransactionRequest, @MappingTarget Transaction):
 *    update existing entity fields (for PUT operations)
 *
 * MapStruct generates the implementation at compile time — zero runtime reflection!
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TransactionMapper {

    TransactionResponse toResponse(Transaction transaction);

    Transaction toEntity(TransactionRequest request);

    void updateEntityFromRequest(TransactionRequest request, @MappingTarget Transaction transaction);
}
