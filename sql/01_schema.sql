CREATE DATABASE IF NOT EXISTS rideflow_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rideflow_db;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','rider','driver') NOT NULL DEFAULT 'rider',
  account_status ENUM('active','suspended','banned') NOT NULL DEFAULT 'active',
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drivers (
  driver_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  license_number VARCHAR(50) UNIQUE,
  cnic VARCHAR(20) UNIQUE,
  profile_photo VARCHAR(500),
  verification_status ENUM('pending','verified','rejected') DEFAULT 'pending',
  availability_status ENUM('online','offline','on_trip') DEFAULT 'offline',
  total_trips_completed INT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE vehicles (
  vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year YEAR NOT NULL,
  color VARCHAR(30) NOT NULL,
  license_plate VARCHAR(20) NOT NULL UNIQUE,
  vehicle_type ENUM('economy','premium','bike') NOT NULL,
  verification_status ENUM('pending','verified','rejected') DEFAULT 'pending',
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
);

CREATE TABLE locations (
  location_id INT AUTO_INCREMENT PRIMARY KEY,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL
);

CREATE TABLE promo_codes (
  promo_id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  discount_type ENUM('percentage','flat') NOT NULL,
  discount_value DECIMAL(8,2) NOT NULL,
  expiry_date DATE NOT NULL,
  usage_limit INT NOT NULL DEFAULT 100,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE rides (
  ride_id INT AUTO_INCREMENT PRIMARY KEY,
  rider_id INT NOT NULL,
  driver_id INT,
  vehicle_id INT,
  pickup_location_id INT NOT NULL,
  dropoff_location_id INT NOT NULL,
  ride_status ENUM('requested','accepted','en_route','in_progress','completed','cancelled') DEFAULT 'requested',
  request_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  start_time DATETIME,
  end_time DATETIME,
  distance_km DECIMAL(8,2),
  duration_minutes INT,
  fare_amount DECIMAL(10,2),
  scheduled_time DATETIME,
  surge_multiplier DECIMAL(4,2) DEFAULT 1.00,
  FOREIGN KEY (rider_id) REFERENCES users(user_id),
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
  FOREIGN KEY (pickup_location_id) REFERENCES locations(location_id),
  FOREIGN KEY (dropoff_location_id) REFERENCES locations(location_id)
);

CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  ride_id INT NOT NULL,
  rider_id INT NOT NULL,
  promo_id INT,
  amount DECIMAL(10,2) NOT NULL,
  discount_applied DECIMAL(10,2) DEFAULT 0.00,
  payment_method ENUM('cash','wallet','card') NOT NULL,
  payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ride_id) REFERENCES rides(ride_id),
  FOREIGN KEY (rider_id) REFERENCES users(user_id),
  FOREIGN KEY (promo_id) REFERENCES promo_codes(promo_id)
);

CREATE TABLE ratings (
  rating_id INT AUTO_INCREMENT PRIMARY KEY,
  ride_id INT NOT NULL,
  rated_by_user_id INT NOT NULL,
  rated_user_id INT NOT NULL,
  score TINYINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ride_id) REFERENCES rides(ride_id),
  FOREIGN KEY (rated_by_user_id) REFERENCES users(user_id),
  FOREIGN KEY (rated_user_id) REFERENCES users(user_id),
  UNIQUE KEY unique_rating (ride_id, rated_by_user_id)
);

CREATE TABLE complaints (
  complaint_id INT AUTO_INCREMENT PRIMARY KEY,
  ride_id INT NOT NULL,
  complainant_user_id INT NOT NULL,
  against_user_id INT NOT NULL,
  complaint_text TEXT NOT NULL,
  complaint_status ENUM('open','under_review','resolved','dismissed') DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ride_id) REFERENCES rides(ride_id),
  FOREIGN KEY (complainant_user_id) REFERENCES users(user_id),
  FOREIGN KEY (against_user_id) REFERENCES users(user_id)
);

CREATE TABLE driver_earnings (
  earning_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  ride_id INT NOT NULL,
  gross_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 15.00,
  commission_amount DECIMAL(10,2) NOT NULL,
  net_earning DECIMAL(10,2) NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
  FOREIGN KEY (ride_id) REFERENCES rides(ride_id)
);

CREATE TABLE fare_config (
  config_id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_type ENUM('economy','premium','bike') NOT NULL UNIQUE,
  base_rate DECIMAL(8,2) NOT NULL,
  per_km_rate DECIMAL(8,2) NOT NULL,
  per_minute_rate DECIMAL(8,2) NOT NULL,
  surge_threshold INT NOT NULL DEFAULT 10,
  surge_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.50
);

INSERT INTO fare_config VALUES
  (1,'economy',50,25,3,10,1.5),
  (2,'premium',100,45,5,8,1.8),
  (3,'bike',30,15,2,12,1.3);

CREATE TABLE ride_history (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  ride_id INT NOT NULL,
  rider_id INT NOT NULL,
  driver_id INT,
  pickup_city VARCHAR(100),
  dropoff_city VARCHAR(100),
  fare_amount DECIMAL(10,2),
  ride_status VARCHAR(20),
  archived_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
