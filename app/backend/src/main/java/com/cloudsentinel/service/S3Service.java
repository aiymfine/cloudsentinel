package com.cloudsentinel.service;

import com.cloudsentinel.config.AwsConfig;
import com.cloudsentinel.exception.ResourceNotFoundException;
import com.cloudsentinel.model.DocumentMetadata;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;
    private final AwsConfig awsConfig;
    private final AuditService auditService;

    private String getBucketName() {
        return awsConfig.getS3().getBucketName();
    }

    public void createBucketIfNotExists() {
        String bucket = getBucketName();
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
            log.info("S3 bucket {} already exists", bucket);
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
            log.info("Created S3 bucket {}", bucket);
        }
    }

    public List<DocumentMetadata> listFiles() {
        List<DocumentMetadata> files = new ArrayList<>();
        ListObjectsV2Response response = s3Client.listObjectsV2(
            ListObjectsV2Request.builder().bucket(getBucketName()).build()
        );

        for (S3Object obj : response.contents()) {
            files.add(DocumentMetadata.builder()
                .documentId(UUID.nameUUIDFromBytes(obj.key().getBytes()).toString())
                .fileName(obj.key().contains("/") ? obj.key().substring(obj.key().lastIndexOf("/") + 1) : obj.key())
                .s3Key(obj.key())
                .fileSize(obj.size())
                .uploadedAt(obj.lastModified())
                .build());
        }
        return files;
    }

    public DocumentMetadata uploadFile(MultipartFile file, String username) throws IOException {
        String s3Key = username + "/" + UUID.randomUUID() + "/" + file.getOriginalFilename();

        PutObjectRequest putRequest = PutObjectRequest.builder()
            .bucket(getBucketName())
            .key(s3Key)
            .contentType(file.getContentType())
            .metadata(java.util.Map.of(
                "uploaded-by", username,
                "original-filename", file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown"
            ))
            .build();

        s3Client.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));

        DocumentMetadata metadata = DocumentMetadata.builder()
            .documentId(UUID.randomUUID().toString())
            .fileName(file.getOriginalFilename())
            .contentType(file.getContentType())
            .fileSize(file.getSize())
            .uploadedBy(username)
            .uploadedAt(Instant.now())
            .s3Key(s3Key)
            .build();

        auditService.log(null, username, "UPLOAD", s3Key,
            "Uploaded file: " + file.getOriginalFilename(), null);
        log.info("File uploaded: {} by {}", s3Key, username);
        return metadata;
    }

    public byte[] downloadFile(String s3Key) {
        try {
            ResponseBytes<GetObjectResponse> response = s3Client.getObjectAsBytes(
                GetObjectRequest.builder().bucket(getBucketName()).key(s3Key).build()
            );
            return response.asByteArray();
        } catch (NoSuchKeyException e) {
            throw new ResourceNotFoundException("File not found: " + s3Key);
        }
    }

    public void deleteFile(String s3Key, String username) {
        try {
            s3Client.headObject(HeadObjectRequest.builder().bucket(getBucketName()).key(s3Key).build());
        } catch (NoSuchKeyException e) {
            throw new ResourceNotFoundException("File not found: " + s3Key);
        }

        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(getBucketName()).key(s3Key).build());
        auditService.log(null, username, "DELETE", s3Key, "Deleted file: " + s3Key, null);
        log.info("File deleted: {} by {}", s3Key, username);
    }

    public byte[] getFilePreview(String s3Key) {
        return downloadFile(s3Key);
    }
}
