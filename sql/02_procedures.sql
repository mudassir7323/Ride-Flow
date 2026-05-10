USE rideflow_db;

DELIMITER //
CREATE PROCEDURE sp_create_ride(
  IN p_rider_id INT,
  IN p_pickup_id INT,
  IN p_dropoff_id INT,
  IN p_vtype VARCHAR(20),
  OUT p_ride_id INT
)
BEGIN
  DECLARE v_surge DECIMAL(4,2) DEFAULT 1.00;
  DECLARE v_active_count INT;

  SELECT COUNT(*) INTO v_active_count
  FROM rides r
  JOIN locations l ON r.pickup_location_id = l.location_id
  WHERE r.ride_status IN ('requested','accepted','en_route','in_progress')
    AND l.city = (SELECT city FROM locations WHERE location_id = p_pickup_id);

  SELECT surge_multiplier INTO v_surge
  FROM fare_config
  WHERE vehicle_type = p_vtype
    AND v_active_count >= surge_threshold;

  IF v_surge IS NULL THEN
    SET v_surge = 1.00;
  END IF;

  INSERT INTO rides (rider_id, pickup_location_id, dropoff_location_id, ride_status, surge_multiplier)
  VALUES (p_rider_id, p_pickup_id, p_dropoff_id, 'requested', v_surge);

  SET p_ride_id = LAST_INSERT_ID();
END //

CREATE PROCEDURE sp_complete_ride(
  IN p_ride_id INT,
  IN p_distance_km DECIMAL(8,2),
  IN p_duration_min INT
)
BEGIN
  DECLARE v_fare DECIMAL(10,2);
  DECLARE v_vtype VARCHAR(20);
  DECLARE v_driver_id INT;
  DECLARE v_surge DECIMAL(4,2);
  DECLARE v_base DECIMAL(8,2);
  DECLARE v_pkm DECIMAL(8,2);
  DECLARE v_pmin DECIMAL(8,2);

  SELECT v.vehicle_type, r.driver_id, r.surge_multiplier
  INTO v_vtype, v_driver_id, v_surge
  FROM rides r
  JOIN vehicles v ON r.vehicle_id = v.vehicle_id
  WHERE r.ride_id = p_ride_id;

  SELECT base_rate, per_km_rate, per_minute_rate
  INTO v_base, v_pkm, v_pmin
  FROM fare_config
  WHERE vehicle_type = v_vtype;

  SET v_fare = (v_base + v_pkm * p_distance_km + v_pmin * p_duration_min) * v_surge;

  UPDATE rides
  SET ride_status = 'completed',
      end_time = NOW(),
      distance_km = p_distance_km,
      duration_minutes = p_duration_min,
      fare_amount = v_fare
  WHERE ride_id = p_ride_id;

  INSERT INTO driver_earnings
    (driver_id, ride_id, gross_amount, commission_rate, commission_amount, net_earning)
  VALUES (v_driver_id, p_ride_id, v_fare, 15.00, v_fare * 0.15, v_fare * 0.85);

  UPDATE drivers
  SET wallet_balance = wallet_balance + v_fare * 0.85,
      total_trips_completed = total_trips_completed + 1,
      availability_status = 'online'
  WHERE driver_id = v_driver_id;

  INSERT INTO ride_history (ride_id, rider_id, driver_id, fare_amount, ride_status)
  SELECT ride_id, rider_id, driver_id, fare_amount, ride_status
  FROM rides
  WHERE ride_id = p_ride_id;
END //

CREATE PROCEDURE sp_apply_promo(
  IN p_code VARCHAR(30),
  IN p_fare DECIMAL(10,2),
  OUT p_promo_id INT,
  OUT p_discount DECIMAL(10,2),
  OUT p_final DECIMAL(10,2)
)
BEGIN
  DECLARE v_dtype VARCHAR(20);
  DECLARE v_dval DECIMAL(8,2);

  SET p_promo_id = NULL;

  SELECT promo_id, discount_type, discount_value
  INTO p_promo_id, v_dtype, v_dval
  FROM promo_codes
  WHERE code = p_code
    AND is_active = TRUE
    AND expiry_date >= CURDATE()
    AND used_count < usage_limit
  LIMIT 1;

  IF p_promo_id IS NULL THEN
    SET p_discount = 0;
    SET p_final = p_fare;
  ELSEIF v_dtype = 'percentage' THEN
    SET p_discount = p_fare * (v_dval / 100);
    SET p_final = p_fare - p_discount;
    UPDATE promo_codes SET used_count = used_count + 1 WHERE promo_id = p_promo_id;
  ELSE
    SET p_discount = LEAST(v_dval, p_fare);
    SET p_final = p_fare - p_discount;
    UPDATE promo_codes SET used_count = used_count + 1 WHERE promo_id = p_promo_id;
  END IF;
END //
DELIMITER ;
