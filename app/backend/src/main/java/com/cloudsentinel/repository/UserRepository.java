package com.cloudsentinel.repository;

import com.cloudsentinel.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Repository
@RequiredArgsConstructor
public class UserRepository {

    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbClient dynamoDbClient;

    private DynamoDbTable<User> getUserTable() {
        return enhancedClient.table("cloud-sentinel-users", TableSchema.fromBean(User.class));
    }

    public void save(User user) {
        getUserTable().putItem(user);
    }

    public Optional<User> findByUsername(String username) {
        List<User> users = new ArrayList<>();
        getUserTable().scan(ScanEnhancedRequest.builder().build())
            .stream()
            .flatMap(page -> page.items().stream())
            .filter(u -> username.equals(u.getUsername()))
            .forEach(users::add);
        return users.stream().findFirst();
    }

    public Optional<User> findByUserId(String userId) {
        Key key = Key.builder().partitionValue(userId).build();
        return Optional.ofNullable(getUserTable().getItem(key));
    }

    public List<User> findAll() {
        List<User> users = new ArrayList<>();
        getUserTable().scan(ScanEnhancedRequest.builder().build())
            .stream()
            .flatMap(page -> page.items().stream())
            .forEach(users::add);
        return users;
    }

    public void delete(User user) {
        Key key = Key.builder().partitionValue(user.getUserId()).build();
        getUserTable().deleteItem(key);
    }

    public long count() {
        return findAll().size();
    }

    public void createTableIfNotExists() {
        String tableName = "cloud-sentinel-users";
        try {
            dynamoDbClient.describeTable(DescribeTableRequest.builder().tableName(tableName).build());
            log.info("Table {} already exists", tableName);
        } catch (ResourceNotFoundException e) {
            dynamoDbClient.createTable(CreateTableRequest.builder()
                .tableName(tableName)
                .keySchema(KeySchemaElement.builder().attributeName("userId").keyType(KeyType.HASH).build())
                .attributeDefinitions(AttributeDefinition.builder().attributeName("userId").attributeType(ScalarAttributeType.S).build())
                .billingMode(BillingMode.PAY_PER_REQUEST)
                .build());
            log.info("Created table {}", tableName);
        }
    }
}
