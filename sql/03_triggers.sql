USE rideflow_db;

DELIMITER //
CREATE TRIGGER tr_create_driver_profile
AFTER INSERT ON users FOR EACH ROW
BEGIN
  IF NEW.role = 'driver' THEN
    INSERT INTO drivers (user_id) VALUES (NEW.user_id);
  END IF;
END //

CREATE TRIGGER tr_update_driver_rating
AFTER INSERT ON ratings FOR EACH ROW
BEGIN
  DECLARE v_avg DECIMAL(3,2);
  DECLARE v_driver_id INT;

  SELECT d.driver_id INTO v_driver_id
  FROM rides r
  JOIN drivers d ON r.driver_id = d.driver_id
  WHERE r.ride_id = NEW.ride_id;

  IF v_driver_id IS NOT NULL THEN
    SELECT AVG(score) INTO v_avg
    FROM ratings r
    JOIN rides ri ON r.ride_id = ri.ride_id
    WHERE ri.driver_id = v_driver_id;

    UPDATE drivers SET average_rating = v_avg WHERE driver_id = v_driver_id;

    IF v_avg < 3.5 THEN
      UPDATE users u
      JOIN drivers d ON d.user_id = u.user_id
      SET u.account_status = 'suspended'
      WHERE d.driver_id = v_driver_id;
    END IF;
  END IF;
END //

CREATE TRIGGER tr_validate_vehicle
BEFORE UPDATE ON rides FOR EACH ROW
BEGIN
  DECLARE v_verified VARCHAR(20);
  IF NEW.vehicle_id IS NOT NULL THEN
    SELECT verification_status INTO v_verified
    FROM vehicles
    WHERE vehicle_id = NEW.vehicle_id;

    IF v_verified != 'verified' THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Vehicle is not verified for rides';
    END IF;
  END IF;
END //
DELIMITER ;
