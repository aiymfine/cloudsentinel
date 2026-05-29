package com.cloudsentinel.model;

import lombok.*;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamoDbBean
public class User {

    private String userId;
    private String username;
    private String email;
    private String passwordHash;
    private String role;
    private boolean enabled;
    private Instant createdAt;
    private Instant lastLogin;

    @DynamoDbPartitionKey
    public String getUserId() {
        return userId;
    }
}
