-- Database initialization script for Checked Out
-- Run this script to create the database and user

CREATE DATABASE IF NOT EXISTS checked_out
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS checked_out_test
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Optional: Create dedicated database user
-- Uncomment and update password as needed
-- CREATE USER IF NOT EXISTS 'checked_out_user'@'localhost' IDENTIFIED BY 'your_password_here';
-- GRANT ALL PRIVILEGES ON checked_out.* TO 'checked_out_user'@'localhost';
-- GRANT ALL PRIVILEGES ON checked_out_test.* TO 'checked_out_user'@'localhost';
-- FLUSH PRIVILEGES;
