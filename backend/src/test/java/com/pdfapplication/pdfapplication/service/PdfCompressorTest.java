package com.pdfapplication.pdfapplication.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class PdfCompressorTest {

    @Autowired
    private PdfCompressor pdfCompressor;

    @Test
    public void testCompressWithNullInput() {
        assertThrows(IllegalArgumentException.class, () -> {
            pdfCompressor.compress(null);
        });
    }

    @Test
    public void testCompressWithInvalidCompressionLevel() {
        byte[] pdfBytes = createMinimalPdf();
        InputStream input = new ByteArrayInputStream(pdfBytes);
        
        assertThrows(IllegalArgumentException.class, () -> {
            pdfCompressor.compress(input, -0.1f);
        });
        
        assertThrows(IllegalArgumentException.class, () -> {
            pdfCompressor.compress(input, 1.1f);
        });
    }

    @Test
    public void testCompressWithValidInput() throws IOException {
        byte[] pdfBytes = createMinimalPdf();
        InputStream input = new ByteArrayInputStream(pdfBytes);
        
        byte[] compressed = pdfCompressor.compress(input, 0.7f);
        
        assertNotNull(compressed);
        assertTrue(compressed.length > 0);
    }

    @Test
    public void testCompressWithDefaultLevel() throws IOException {
        byte[] pdfBytes = createMinimalPdf();
        InputStream input = new ByteArrayInputStream(pdfBytes);
        
        byte[] compressed = pdfCompressor.compress(input);
        
        assertNotNull(compressed);
        assertTrue(compressed.length > 0);
    }

    @Test
    public void testCompressWithDifferentLevels() throws IOException {
        byte[] pdfBytes = createMinimalPdf();
        
        byte[] lowCompression = pdfCompressor.compress(new ByteArrayInputStream(pdfBytes), 0.2f);
        byte[] mediumCompression = pdfCompressor.compress(new ByteArrayInputStream(pdfBytes), 0.7f);
        byte[] highCompression = pdfCompressor.compress(new ByteArrayInputStream(pdfBytes), 1.0f);
        
        assertNotNull(lowCompression);
        assertNotNull(mediumCompression);
        assertNotNull(highCompression);
        assertTrue(lowCompression.length > 0);
        assertTrue(mediumCompression.length > 0);
        assertTrue(highCompression.length > 0);
    }

    /**
     * Creates a minimal valid PDF for testing.
     * This is a simple PDF with one page containing "Hello World".
     */
    private byte[] createMinimalPdf() {
        // Minimal PDF structure
        String pdfContent = "%PDF-1.4\n" +
                "1 0 obj\n" +
                "<< /Type /Catalog /Pages 2 0 R >>\n" +
                "endobj\n" +
                "2 0 obj\n" +
                "<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n" +
                "endobj\n" +
                "3 0 obj\n" +
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\n" +
                "endobj\n" +
                "4 0 obj\n" +
                "<< /Length 44 >>\n" +
                "stream\n" +
                "BT\n" +
                "/F1 12 Tf\n" +
                "100 700 Td\n" +
                "(Hello World) Tj\n" +
                "ET\n" +
                "endstream\n" +
                "endobj\n" +
                "5 0 obj\n" +
                "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n" +
                "endobj\n" +
                "xref\n" +
                "0 6\n" +
                "0000000000 65535 f \n" +
                "0000000009 00000 n \n" +
                "0000000058 00000 n \n" +
                "0000000115 00000 n \n" +
                "0000000306 00000 n \n" +
                "0000000419 00000 n \n" +
                "trailer\n" +
                "<< /Size 6 /Root 1 0 R >>\n" +
                "startxref\n" +
                "500\n" +
                "%%EOF";
        
        return pdfContent.getBytes();
    }
}

