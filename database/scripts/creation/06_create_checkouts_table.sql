-- Checkouts table: Transaction records for borrowed items
CREATE TABLE checkouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    copy_id INT NOT NULL,
    patron_id INT NOT NULL,
    checkout_date DATETIME NOT NULL,
    due_date DATETIME NOT NULL,
    return_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (copy_id) REFERENCES copies(id) ON DELETE RESTRICT,
    FOREIGN KEY (patron_id) REFERENCES patrons(id) ON DELETE RESTRICT,
    INDEX idx_copy_id (copy_id),
    INDEX idx_patron_id (patron_id),
    INDEX idx_checkout_date (checkout_date),
    INDEX idx_due_date (due_date),
    INDEX idx_return_date (return_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
