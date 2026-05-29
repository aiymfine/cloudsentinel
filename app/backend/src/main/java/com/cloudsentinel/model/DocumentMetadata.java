package com.cloudsentinel.model;

import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentMetadata {
    private String documentId;
    private String fileName;
    private String contentType;
    private long fileSize;
    private String uploadedBy;
    private Instant uploadedAt;
    private String s3Key;
}
