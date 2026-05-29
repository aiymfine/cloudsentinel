package com.cloudsentinel.controller;

import com.cloudsentinel.dto.ApiResponse;
import com.cloudsentinel.service.HealthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

    private final HealthService healthService;

    @GetMapping
    @Operation(summary = "Public health check")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(ApiResponse.ok("Service is running", Map.of(
            "status", "UP",
            "service", "CloudSentinel"
        )));
    }

    @GetMapping("/detailed")
    @Operation(summary = "Detailed health status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> detailed() {
        return ResponseEntity.ok(ApiResponse.ok("Detailed health", healthService.getHealthStatus()));
    }
}
