package com.cloudsentinel.controller;

import com.cloudsentinel.dto.ApiResponse;
import com.cloudsentinel.dto.AuditLogDto;
import com.cloudsentinel.dto.UserDto;
import com.cloudsentinel.exception.ResourceNotFoundException;
import com.cloudsentinel.model.User;
import com.cloudsentinel.repository.UserRepository;
import com.cloudsentinel.service.AuditService;
import com.cloudsentinel.service.S3Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Administration operations")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserRepository userRepository;
    private final AuditService auditService;
    private final S3Service s3Service;

    @GetMapping("/users")
    @Operation(summary = "List all users")
    public ResponseEntity<ApiResponse<List<UserDto>>> listUsers() {
        List<UserDto> users = userRepository.findAll().stream()
            .map(this::toUserDto)
            .toList();
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved", users));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user details")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable String userId) {
        User user = userRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return ResponseEntity.ok(ApiResponse.ok("User found", toUserDto(user)));
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Change user role")
    public ResponseEntity<ApiResponse<UserDto>> changeRole(@PathVariable String userId,
                                                           @RequestBody Map<String, String> body) {
        User user = userRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        String newRole = body.get("role");
        user.setRole(newRole.toUpperCase());
        userRepository.save(user);
        auditService.log(null, "admin", "ADMIN_ACTION", userId,
            "Changed role to " + newRole, null);
        return ResponseEntity.ok(ApiResponse.ok("Role updated", toUserDto(user)));
    }

    @PutMapping("/users/{userId}/toggle-status")
    @Operation(summary = "Enable/disable user")
    public ResponseEntity<ApiResponse<UserDto>> toggleStatus(@PathVariable String userId) {
        User user = userRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        auditService.log(null, "admin", "ADMIN_ACTION", userId,
            "Toggled status to " + (user.isEnabled() ? "enabled" : "disabled"), null);
        return ResponseEntity.ok(ApiResponse.ok("Status toggled", toUserDto(user)));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs")
    public ResponseEntity<ApiResponse<List<AuditLogDto>>> getAuditLogs(
        @RequestParam(defaultValue = "100") int limit) {
        List<AuditLogDto> logs = auditService.getRecentLogs(limit);
        return ResponseEntity.ok(ApiResponse.ok("Audit logs retrieved", logs));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Admin dashboard stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("userCount", userRepository.findAll().size());
        stats.put("fileCount", s3Service.listFiles().size());
        long totalSize = s3Service.listFiles().stream()
            .mapToLong(f -> f.getFileSize()).sum();
        stats.put("storageUsedBytes", totalSize);
        stats.put("recentActivity", auditService.getRecentLogs(10));
        return ResponseEntity.ok(ApiResponse.ok("Dashboard stats", stats));
    }

    @GetMapping("/sensitive")
    @Operation(summary = "Sensitive system information")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sensitive() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("javaVersion", System.getProperty("java.version"));
        info.put("osName", System.getProperty("os.name"));
        info.put("osArch", System.getProperty("os.arch"));

        Map<String, String> envMasked = new LinkedHashMap<>();
        System.getenv().forEach((k, v) -> {
            if (k.toLowerCase().contains("key") || k.toLowerCase().contains("secret")
                || k.toLowerCase().contains("password") || k.toLowerCase().contains("token")) {
                envMasked.put(k, "****");
            } else {
                envMasked.put(k, v.length() > 50 ? v.substring(0, 50) + "..." : v);
            }
        });
        info.put("environmentVariables", envMasked);
        info.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        info.put("maxMemoryMB", Runtime.getRuntime().maxMemory() / 1024 / 1024);

        return ResponseEntity.ok(ApiResponse.ok("System info", info));
    }

    private UserDto toUserDto(User user) {
        return UserDto.builder()
            .userId(user.getUserId())
            .username(user.getUsername())
            .email(user.getEmail())
            .role(user.getRole())
            .enabled(user.isEnabled())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
