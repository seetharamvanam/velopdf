package com.pdfapplication.pdfapplication.controller;

import com.pdfapplication.pdfapplication.service.PdfCompressor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api")
public class CompressController {

    private final PdfCompressor pdfCompressor;

    @Autowired
    public CompressController(PdfCompressor pdfCompressor) {
        this.pdfCompressor = pdfCompressor;
    }

    @PostMapping(path = "/compress", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> compress(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "level", required = false, defaultValue = "0.7") Float compressionLevel) {
        
        // Validate input
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("No file provided".getBytes(StandardCharsets.UTF_8));
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("File must be a PDF document. Found: " + contentType).getBytes(StandardCharsets.UTF_8));
        }

        // Validate compression level
        if (compressionLevel < 0.0f || compressionLevel > 1.0f) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Compression level must be between 0.0 and 1.0".getBytes(StandardCharsets.UTF_8));
        }

        try {
            // Compress PDF
            byte[] compressed = pdfCompressor.compress(file.getInputStream(), compressionLevel);

            // Validate compressed result
            if (compressed == null || compressed.length == 0) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.TEXT_PLAIN)
                        .body("Compression operation produced an empty result".getBytes(StandardCharsets.UTF_8));
            }

            // Generate output filename
            String originalFilename = file.getOriginalFilename();
            String outputFilename = originalFilename != null 
                    ? originalFilename.replaceAll("\\.pdf$", "") + "-compressed.pdf"
                    : "compressed.pdf";

            // Set response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", outputFilename);
            headers.setContentLength(compressed.length);
            
            // Add compression info header
            long originalSize = file.getSize();
            long compressedSize = compressed.length;
            double compressionRatio = originalSize > 0 
                    ? (1.0 - (double) compressedSize / originalSize) * 100.0 
                    : 0.0;
            headers.add("X-Original-Size", String.valueOf(originalSize));
            headers.add("X-Compressed-Size", String.valueOf(compressedSize));
            headers.add("X-Compression-Ratio", String.format("%.2f", compressionRatio));

            return ResponseEntity.ok().headers(headers).body(compressed);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("Invalid request: " + e.getMessage()).getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("Failed to compress PDF: " + e.getMessage()).getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("Unexpected error: " + e.getMessage()).getBytes(StandardCharsets.UTF_8));
        }
    }
}

