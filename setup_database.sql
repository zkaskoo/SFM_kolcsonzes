-- Create database
CREATE DATABASE IF NOT EXISTS kolcsonzes;

-- Create new user for the application
CREATE USER IF NOT EXISTS 'sfm_user'@'localhost' IDENTIFIED BY 'sfm_password123';

-- Grant privileges
GRANT ALL PRIVILEGES ON kolcsonzes.* TO 'sfm_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Show databases to confirm
SHOW DATABASES;
