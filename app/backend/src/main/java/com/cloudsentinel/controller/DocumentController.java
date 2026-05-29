package com.cloudsentinel.controller;

import com.cloudsentinel.dto.ApiResponse;
import com.cloudsentinel.dto.FileResponse;
import com.cloudsentinel.model.DocumentMetadata;
import com.cloudsentinel.service.AuditService;
import com.cloudsentinel.service.S3Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Document management operations")
@SecurityRequirement(name = "bearerAuth")
public class DocumentController {

    private final S3Service s3Service;
    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasAnyRole('VIEWER','EDITOR','ADMIN')")
    @Operation(summary = "List all documents")
    public ResponseEntity<ApiResponse<List<FileResponse>>> listFiles() {
        List<FileResponse> files = s3Service.listFiles().stream()
            .map(this::toFileResponse)
            .toList();
        return ResponseEntity.ok(ApiResponse.ok("Files retrieved", files));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('EDITOR','ADMIN')")
    @Operation(summary = "Upload a document")
    public ResponseEntity<ApiResponse<FileResponse>> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        String username = getCurrentUsername();
        DocumentMetadata metadata = s3Service.uploadFile(file, username);
        auditService.log(null, username, "UPLOAD", metadata.getS3Key(),
            "Uploaded: " + metadata.getFileName(), null);
        return ResponseEntity.ok(ApiResponse.ok("File uploaded", toFileResponse(metadata)));
    }

    @GetMapping("/download")
    @PreAuthorize("hasAnyRole('EDITOR','ADMIN')")
    @Operation(summary = "Download a document")
    public ResponseEntity<byte[]> downloadFile(@RequestParam String key) {
        String username = getCurrentUsername();
        auditService.log(null, username, "DOWNLOAD", key, "Downloaded file", null);
        byte[] data = s3Service.downloadFile(key);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + key + "\"")
            .body(data);
    }

    @GetMapping("/preview")
    @PreAuthorize("hasAnyRole('EDITOR','ADMIN')")
    @Operation(summary = "Preview a document")
    public ResponseEntity<byte[]> previewFile(@RequestParam String key) {
        String username = getCurrentUsername();
        auditService.log(null, username, "VIEW", key, "Previewed file", null);
        byte[] data = s3Service.getFilePreview(key);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(data);
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a document")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@RequestParam String key) {
        String username = getCurrentUsername();
        s3Service.deleteFile(key, username);
        return ResponseEntity.ok(ApiResponse.ok("File deleted"));
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "anonymous";
    }

    private FileResponse toFileResponse(DocumentMetadata m) {
        return FileResponse.builder()
            .documentId(m.getDocumentId())
            .fileName(m.getFileName())
            .contentType(m.getContentType())
            .fileSize(m.getFileSize())
            .uploadedBy(m.getUploadedBy())
            .uploadedAt(m.getUploadedAt())
            .s3Key(m.getS3Key())
            .build();
    }
}
