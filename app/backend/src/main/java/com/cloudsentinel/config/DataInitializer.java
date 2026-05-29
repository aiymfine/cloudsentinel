package com.cloudsentinel.config;

import com.cloudsentinel.repository.AuditLogRepository;
import com.cloudsentinel.repository.UserRepository;
import com.cloudsentinel.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    @Value("${app.init.enabled:true}")
    private boolean initEnabled;

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final S3Service s3Service;

    @Override
    public void run(ApplicationArguments args) {
        if (!initEnabled) {
            log.info("Data initialization disabled (app.init.enabled=false)");
            return;
        }

        log.info("Initializing CloudSentinel infrastructure...");

        userRepository.createTableIfNotExists();
        auditLogRepository.createTableIfNotExists();
        s3Service.createBucketIfNotExists();

        log.info("CloudSentinel infrastructure initialization complete");
    }
}
