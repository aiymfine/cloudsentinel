package com.cloudsentinel.service;

import com.cloudsentinel.dto.AuditLogDto;
import com.cloudsentinel.model.AuditLog;
import com.cloudsentinel.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String userId, String username, String action, String resource,
                    String details, String ipAddress) {
        AuditLog auditLog = AuditLog.builder()
            .logId(UUID.randomUUID().toString())
            .userId(userId != null ? userId : "anonymous")
            .username(username != null ? username : "anonymous")
            .action(action)
            .resource(resource)
            .details(details)
            .ipAddress(ipAddress != null ? ipAddress : "unknown")
            .timestamp(Instant.now())
            .build();
        auditLogRepository.save(auditLog);
    }

    public List<AuditLogDto> getRecentLogs(int limit) {
        return auditLogRepository.findAll().stream()
            .sorted(Comparator.comparing(AuditLog::getTimestamp).reversed())
            .limit(limit)
            .map(this::toDto)
            .toList();
    }

    public List<AuditLogDto> getLogsByUser(String userId) {
        return auditLogRepository.findByUserId(userId).stream()
            .sorted(Comparator.comparing(AuditLog::getTimestamp).reversed())
            .map(this::toDto)
            .toList();
    }

    private AuditLogDto toDto(AuditLog log) {
        return AuditLogDto.builder()
            .logId(log.getLogId())
            .userId(log.getUserId())
            .username(log.getUsername())
            .action(log.getAction())
            .resource(log.getResource())
            .details(log.getDetails())
            .ipAddress(log.getIpAddress())
            .timestamp(log.getTimestamp())
            .build();
    }
}
