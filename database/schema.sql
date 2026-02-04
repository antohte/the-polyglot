-- Database Schema for The Polyglot
-- Based on Firestore Rules and Application Requirements

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table
-- We use VARCHAR(128) for ID to accommodate Firebase UIDs
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(128) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    full_name VARCHAR(255),
    photo_url VARCHAR(512),
    role ENUM('user', 'organizer', 'admin') DEFAULT 'user',
    license_year VARCHAR(50) DEFAULT NULL,
    department VARCHAR(100) DEFAULT NULL,
    password_hash VARCHAR(255) DEFAULT NULL,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    bio TEXT,
    social_links JSON -- Storing social links as JSON { "linkedin": "...", "twitter": "..." }
);

-- 2. Categories Table
-- To replace the hardcoded constants and allow dynamic categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 3. Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(128) PRIMARY KEY, -- UUID or Firebase ID
    author_id VARCHAR(128) NOT NULL,
    category_slug VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT, -- Markdown or HTML content
    image_url VARCHAR(512),
    subcategory VARCHAR(100) DEFAULT NULL,
    files JSON DEFAULT NULL,
    language VARCHAR(10) DEFAULT 'fr',
    post_type VARCHAR(50) DEFAULT 'article',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_slug) REFERENCES categories(slug) ON UPDATE CASCADE
);

-- 4. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(128) PRIMARY KEY,
    post_id VARCHAR(128) NOT NULL,
    author_id VARCHAR(128) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Likes Table
CREATE TABLE IF NOT EXISTS likes (
    post_id VARCHAR(128) NOT NULL,
    user_id VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Events Table
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(128) PRIMARY KEY,
    author_id VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location VARCHAR(255),
    image_url VARCHAR(512),
    link VARCHAR(512) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Polls Table
CREATE TABLE IF NOT EXISTS polls (
    id VARCHAR(128) PRIMARY KEY,
    created_by VARCHAR(128) NOT NULL,
    question VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Poll Options Table
CREATE TABLE IF NOT EXISTS poll_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id VARCHAR(128) NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

-- 9. Poll Votes Table
CREATE TABLE IF NOT EXISTS poll_votes (
    poll_id VARCHAR(128) NOT NULL,
    option_id INT NOT NULL,
    user_id VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (poll_id, user_id), -- One vote per user per poll
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reported_by_id VARCHAR(128) NOT NULL,
    target_type ENUM('post', 'comment', 'user') NOT NULL,
    target_id VARCHAR(128) NOT NULL,
    reason TEXT,
    status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Moderation History / Logs
CREATE TABLE IF NOT EXISTS moderation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(128) NOT NULL,
    action VARCHAR(50) NOT NULL, -- e.g., 'ban_user', 'delete_post'
    target_id VARCHAR(128),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Settings Table (Global App Settings)
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 13. Category Requests
CREATE TABLE IF NOT EXISTS category_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requested_by VARCHAR(128) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 14. Friends Table
CREATE TABLE IF NOT EXISTS friends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id VARCHAR(128) NOT NULL,
    addressee_id VARCHAR(128) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (requester_id, addressee_id)
);

SET FOREIGN_KEY_CHECKS = 1;
