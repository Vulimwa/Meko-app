USE mekoDB;

-- Start fresh
DROP TABLE IF EXISTS story_likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS threads;
DROP TABLE IF EXISTS stories;

-- Use the database
USE mekoDB;

-- 1. Stories table (independent)
CREATE TABLE stories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    location VARCHAR(255),
    fuel_type ENUM('charcoal', 'LPG', 'electric', 'improved_biomass'),
    author_name VARCHAR(255) NOT NULL,
    likes_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Threads table (independent)
CREATE TABLE threads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    replies_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Comments table (depends on threads)
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    thread_id INT NOT NULL,
    content TEXT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads (id) ON DELETE CASCADE
);

-- 4. Story Likes table (depends on stories)
CREATE TABLE story_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    story_id INT NOT NULL,
    user_identifier VARCHAR(100) NOT NULL, -- IP, session ID, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES stories (id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (story_id, user_identifier)
);

-- Indexes
CREATE INDEX idx_stories_created_at ON stories(created_at);
CREATE INDEX idx_stories_fuel_type ON stories(fuel_type);
CREATE INDEX idx_threads_created_at ON threads(created_at);
CREATE INDEX idx_comments_thread_id ON comments(thread_id);
CREATE INDEX idx_story_likes_story_id ON story_likes(story_id);

-- ===========================
-- Seed Data (in safe order)
-- ===========================

-- Stories
INSERT INTO stories (id, title, content, location, fuel_type, author_name, likes_count) VALUES
(1, 'My Journey to LPG Cooking', 'Switching from charcoal to LPG has transformed my kitchen experience. No more smoke, faster cooking, and my monthly fuel costs dropped by 40%!', 'Nairobi, Kenya', 'LPG', 'Grace Wanjiku', 15),
(2, 'Electric Stove Success Story', 'After installing solar panels, cooking with electricity became affordable. My family loves the clean, consistent heat for our daily ugali.', 'Kampala, Uganda', 'electric', 'James Mukasa', 23),
(3, 'Improved Biomass Changed Everything', 'The new efficient stove uses 60% less wood than my old one. Less time collecting firewood means more time for my business!', 'Mwanza, Tanzania', 'improved_biomass', 'Fatuma Hassan', 18),
(4, 'Clean Cooking for Health', 'Since switching to LPG, my children no longer cough from smoke. The investment in clean cooking was worth every shilling for our health.', 'Kigali, Rwanda', 'LPG', 'Marie Uwimana', 31),
(5, 'Solar Electric Cooking Journey', 'Combining solar power with electric cooking has made us energy independent. Our monthly cooking costs are now almost zero!', 'Dar es Salaam, Tanzania', 'electric', 'Peter Mwalimu', 27),
(6, 'From Charcoal to Clean Energy', 'My transition from charcoal to LPG took planning, but the time savings and cleaner kitchen make it worthwhile. Highly recommend!', 'Mombasa, Kenya', 'LPG', 'Amina Mohamed', 19),
(7, 'Efficient Wood Stove Benefits', 'The improved biomass stove cooks faster and produces less smoke. Perfect for rural areas where wood is still the main fuel source.', 'Masaka, Uganda', 'improved_biomass', 'Robert Ssali', 14),
(8, 'Electric Cooking Made Simple', 'With reliable electricity in our area, electric cooking has become our preferred method. Clean, fast, and economical.', 'Arusha, Tanzania', 'electric', 'Neema Kimaro', 22),
(9, 'LPG: A Game Changer', 'Cooking with LPG has given me more time with my family. No more waiting for charcoal to heat up or dealing with ash cleanup.', 'Kisumu, Kenya', 'LPG', 'David Ochieng', 25),
(10, 'Clean Cooking Community Impact', 'Our village cooperative bought improved stoves in bulk. Now 50 families enjoy cleaner cooking and reduced fuel costs together.', 'Bukoba, Tanzania', 'improved_biomass', 'Sarah Mwakasege', 33)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Threads
INSERT INTO threads (id, title, content, author_name, replies_count) VALUES
(1, 'Best LPG suppliers in Nairobi?', 'Looking for reliable LPG suppliers with good prices and delivery service in Nairobi. Any recommendations?', 'John Kamau', 5),
(2, 'How to maintain electric stoves?', 'Just got my first electric stove. What are the best practices for maintenance and cleaning?', 'Lucy Akinyi', 3),
(3, 'Improved biomass stove efficiency tips', 'Share your tips for getting the most efficiency out of improved biomass stoves. What works best?', 'Moses Wekesa', 7),
(4, 'Solar cooking experiences?', 'Has anyone tried solar cooking? How practical is it for daily meal preparation?', 'Ruth Nyong', 2),
(5, 'Transitioning from charcoal - advice needed', 'Planning to switch from charcoal to clean cooking. What should I consider first?', 'Samuel Mwangi', 8)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Comments (now valid because thread IDs exist)
INSERT INTO comments (thread_id, content, author_name) VALUES
(1, 'I recommend Hashi Energy - they have great customer service and competitive prices.', 'Grace Wanjiku'),
(1, 'Total Gas has been reliable for our family. They deliver on time and have good quality cylinders.', 'Peter Mwalimu'),
(1, 'Check out Lake Gas as well. They often have promotions for new customers.', 'Amina Mohamed'),
(2, 'Clean the surface after each use with a damp cloth. Avoid abrasive cleaners that can scratch.', 'James Mukasa'),
(2, 'Make sure to check the electrical connections regularly for safety.', 'Neema Kimaro'),
(3, 'Use dry, well-seasoned wood for best efficiency. Wet wood creates more smoke and less heat.', 'Fatuma Hassan'),
(3, 'Keep the air vents clean and unobstructed for proper airflow.', 'Robert Ssali'),
(3, 'Regular maintenance of the combustion chamber improves performance significantly.', 'Sarah Mwakasege');


