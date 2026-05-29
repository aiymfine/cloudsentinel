package com.cloudsentinel.repository;

import com.cloudsentinel.model.AuditLog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Repository
@RequiredArgsConstructor
public class AuditLogRepository {

    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbClient dynamoDbClient;

    private DynamoDbTable<AuditLog> getTable() {
        return enhancedClient.table("cloud-sentinel-audit", TableSchema.fromBean(AuditLog.class));
    }

    public void save(AuditLog log) {
        getTable().putItem(log);
    }

    public List<AuditLog> findByUserId(String userId) {
        List<AuditLog> logs = new ArrayList<>();
        getTable().query(QueryEnhancedRequest.builder()
                .queryConditional(QueryConditional.keyEqualTo(Key.builder().partitionValue(userId).build()))
                .build())
            .stream()
            .flatMap(page -> page.items().stream())
            .forEach(logs::add);
        return logs;
    }

    public List<AuditLog> findAll() {
        List<AuditLog> logs = new ArrayList<>();
        getTable().scan(ScanEnhancedRequest.builder().build())
            .stream()
            .flatMap(page -> page.items().stream())
            .forEach(logs::add);
        return logs;
    }

    public List<AuditLog> findByTimestampBetween(Instant start, Instant end) {
        List<AuditLog> all = findAll();
        return all.stream()
            .filter(l -> l.getTimestamp() != null
                && !l.getTimestamp().isBefore(start)
                && !l.getTimestamp().isAfter(end))
            .toList();
    }

    public void createTableIfNotExists() {
        String tableName = "cloud-sentinel-audit";
        try {
            dynamoDbClient.describeTable(DescribeTableRequest.builder().tableName(tableName).build());
            log.info("Table {} already exists", tableName);
        } catch (ResourceNotFoundException e) {
            dynamoDbClient.createTable(CreateTableRequest.builder()
                .tableName(tableName)
                .keySchema(
                    KeySchemaElement.builder().attributeName("userId").keyType(KeyType.HASH).build(),
                    KeySchemaElement.builder().attributeName("timestamp").keyType(KeyType.RANGE).build()
                )
                .attributeDefinitions(
                    AttributeDefinition.builder().attributeName("userId").attributeType(ScalarAttributeType.S).build(),
                    AttributeDefinition.builder().attributeName("timestamp").attributeType(ScalarAttributeType.S).build()
                )
                .billingMode(BillingMode.PAY_PER_REQUEST)
                .build());
            log.info("Created table {}", tableName);
        }
    }
}
