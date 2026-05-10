USE rideflow_db;

-- Drop and recreate sp_complete_ride to handle NULL vehicle_id
DROP PROCEDURE IF EXISTS sp_complete_ride;

DELIMITER //
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

  -- Get driver and surge from ride
  SELECT r.driver_id, r.surge_multiplier
  INTO v_driver_id, v_surge
  FROM rides r
  WHERE r.ride_id = p_ride_id;

  -- Try to get vehicle_type from the ride's vehicle_id first
  SELECT v.vehicle_type INTO v_vtype
  FROM rides r
  JOIN vehicles v ON r.vehicle_id = v.vehicle_id
  WHERE r.ride_id = p_ride_id
  LIMIT 1;

  -- If no vehicle on ride, fall back to driver's active vehicle
  IF v_vtype IS NULL THEN
    SELECT v.vehicle_type INTO v_vtype
    FROM vehicles v
    WHERE v.driver_id = v_driver_id
      AND v.is_active = TRUE
    ORDER BY v.vehicle_id DESC
    LIMIT 1;
  END IF;

  -- Final fallback to 'economy' if still null
  IF v_vtype IS NULL THEN
    SET v_vtype = 'economy';
  END IF;

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

  -- Insert earnings only if not already recorded
  INSERT IGNORE INTO driver_earnings
    (driver_id, ride_id, gross_amount, commission_rate, commission_amount, net_earning)
  VALUES (v_driver_id, p_ride_id, v_fare, 15.00, v_fare * 0.15, v_fare * 0.85);

  UPDATE drivers
  SET wallet_balance = wallet_balance + v_fare * 0.85,
      total_trips_completed = total_trips_completed + 1,
      availability_status = 'online'
  WHERE driver_id = v_driver_id;

  -- Archive to ride_history
  INSERT IGNORE INTO ride_history (ride_id, rider_id, driver_id, fare_amount, ride_status)
  SELECT ride_id, rider_id, driver_id, fare_amount, ride_status
  FROM rides
  WHERE ride_id = p_ride_id;
END //
DELIMITER ;

-- Also fix the leaderboard view to include total_earnings
CREATE OR REPLACE VIEW vw_driver_leaderboard AS
SELECT
  d.driver_id,
  u.full_name,
  l.city,
  d.average_rating,
  d.total_trips_completed AS total_trips,
  d.availability_status,
  COALESCE(SUM(de.net_earning), 0) AS total_earnings,
  RANK() OVER (PARTITION BY l.city ORDER BY d.average_rating DESC) AS city_rank
FROM drivers d
JOIN users u ON d.user_id = u.user_id
JOIN rides r ON r.driver_id = d.driver_id
JOIN locations l ON r.pickup_location_id = l.location_id
LEFT JOIN driver_earnings de ON de.driver_id = d.driver_id
WHERE d.verification_status = 'verified'
GROUP BY d.driver_id, u.full_name, l.city, d.average_rating, d.total_trips_completed, d.availability_status;
