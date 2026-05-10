USE rideflow_db;

INSERT INTO users (full_name,email,phone,password_hash,role) VALUES
  ('Super Admin','admin@rideflow.pk','+92-300-0000001','$2a$12$hashedpasswordhere','admin');

INSERT INTO users (full_name,email,phone,password_hash,role) VALUES
  ('Ali Hassan','ali@example.com','+92-300-1234567','$2a$12$hash1','rider'),
  ('Sara Khan','sara@example.com','+92-301-9876543','$2a$12$hash2','rider');

INSERT INTO users (full_name,email,phone,password_hash,role) VALUES
  ('Ahmed Driver','ahmed@driver.com','+92-333-1111111','$2a$12$hash3','driver');

UPDATE drivers
SET license_number='LHR-123456',
    cnic='35201-1234567-1',
    verification_status='verified',
    availability_status='online'
WHERE user_id = (SELECT user_id FROM users WHERE email='ahmed@driver.com');

INSERT INTO vehicles (driver_id,make,model,year,color,license_plate,vehicle_type,verification_status)
VALUES (1,'Toyota','Corolla',2022,'White','LEJ-4567','economy','verified');

INSERT INTO promo_codes (code,discount_type,discount_value,expiry_date,usage_limit) VALUES
  ('WELCOME20','percentage',20,'2026-12-31',1000),
  ('FLAT50','flat',50,'2026-06-30',500),
  ('NEWUSER','percentage',30,'2026-09-30',200);

INSERT INTO locations (address,city,latitude,longitude) VALUES
  ('F-10 Markaz, Islamabad','Islamabad',33.6938,73.0651),
  ('Blue Area, Islamabad','Islamabad',33.7215,73.0433),
  ('DHA Phase 5, Lahore','Lahore',31.4697,74.4086);
