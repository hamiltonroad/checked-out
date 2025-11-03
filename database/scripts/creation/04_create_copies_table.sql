-- Copies table: Physical and Kindle instances of books
CREATE TABLE copies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    format ENUM('physical', 'kindle') NOT NULL,
    copy_number INT,
    barcode VARCHAR(50) UNIQUE,
    kindle_asin VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_book_id (book_id),
    INDEX idx_barcode (barcode),
    INDEX idx_format (format)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
