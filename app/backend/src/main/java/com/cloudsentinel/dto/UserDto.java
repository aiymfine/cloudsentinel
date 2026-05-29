package com.cloudsentinel.dto;

import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private String userId;
    private String username;
    private String email;
    private String role;
    private boolean enabled;
    private Instant createdAt;
}
