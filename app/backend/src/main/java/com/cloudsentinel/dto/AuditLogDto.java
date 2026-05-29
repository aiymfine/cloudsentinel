package com.cloudsentinel.dto;

import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDto {
    private String logId;
    private String userId;
    private String username;
    private String action;
    private String resource;
    private String details;
    private String ipAddress;
    private Instant timestamp;
}
