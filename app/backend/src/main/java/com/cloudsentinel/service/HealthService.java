package com.cloudsentinel.service;

import com.cloudsentinel.config.AwsConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.s3.S3Client;

import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class HealthService {

    private final S3Client s3Client;
    private final DynamoDbClient dynamoDbClient;
    private final AwsConfig awsConfig;
    private final Instant startTime = Instant.now();

    public Map<String, Object> getHealthStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("application", "CloudSentinel");
        status.put("status", "UP");
        status.put("uptime", Duration.between(startTime, Instant.now()).toString());

        try {
            s3Client.listBuckets();
            status.put("s3", "UP");
        } catch (Exception e) {
            status.put("s3", "DOWN: " + e.getMessage());
        }

        try {
            dynamoDbClient.listTables();
            status.put("dynamodb", "UP");
        } catch (Exception e) {
            status.put("dynamodb", "DOWN: " + e.getMessage());
        }

        Runtime runtime = Runtime.getRuntime();
        status.put("memory_used_mb", (runtime.totalMemory() - runtime.freeMemory()) / 1024 / 1024);
        status.put("memory_total_mb", runtime.totalMemory() / 1024 / 1024);

        return status;
    }
}
