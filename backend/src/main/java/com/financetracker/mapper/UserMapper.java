package com.financetracker.mapper;

import com.financetracker.dto.response.UserResponse;
import com.financetracker.entity.User;
import org.mapstruct.*;

/**
 * MapStruct mapper for User entity <-> DTOs.
 *
 * TODO (Milestone 1):
 *  - toResponse(User): map user entity to UserResponse DTO
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    UserResponse toResponse(User user);
}
