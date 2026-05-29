package com.cloudsentinel.dto;

import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileResponse {
    private String documentId;
    private String fileName;
    private String contentType;
    private long fileSize;
    private String uploadedBy;
    private Instant uploadedAt;
    private String s3Key;
}
