package com.financetracker.mapper;

import com.financetracker.dto.request.CategoryRequest;
import com.financetracker.dto.response.CategoryResponse;
import com.financetracker.entity.Category;
import org.mapstruct.*;

/**
 * MapStruct mapper for Category entity <-> DTOs.
 *
 * TODO (Milestone 2):
 *  - toResponse(Category): entity → response DTO
 *  - toEntity(CategoryRequest): request → entity
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper {

    CategoryResponse toResponse(Category category);

    Category toEntity(CategoryRequest request);
}
