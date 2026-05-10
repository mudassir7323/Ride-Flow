USE rideflow_db;

CREATE OR REPLACE VIEW vw_driver_leaderboard AS
SELECT
  d.driver_id,
  u.full_name,
  l.city,
  d.average_rating,
  d.total_trips_completed,
  d.availability_status,
  RANK() OVER (PARTITION BY l.city ORDER BY d.average_rating DESC) AS city_rank
FROM drivers d
JOIN users u ON d.user_id = u.user_id
JOIN rides r ON r.driver_id = d.driver_id
JOIN locations l ON r.pickup_location_id = l.location_id
WHERE d.verification_status = 'verified'
GROUP BY d.driver_id, u.full_name, l.city, d.average_rating, d.total_trips_completed, d.availability_status;

CREATE OR REPLACE VIEW vw_platform_revenue AS
SELECT
  DATE(r.end_time) AS ride_date,
  l.city,
  COUNT(r.ride_id) AS total_rides,
  SUM(r.fare_amount) AS gross_revenue,
  SUM(r.fare_amount * 0.15) AS platform_commission,
  SUM(r.fare_amount * 0.85) AS driver_payouts,
  SUM(p.discount_applied) AS promo_discounts
FROM rides r
JOIN payments p ON r.ride_id = p.ride_id
JOIN locations l ON r.pickup_location_id = l.location_id
WHERE r.ride_status = 'completed'
GROUP BY DATE(r.end_time), l.city;

CREATE OR REPLACE VIEW vw_active_rides AS
SELECT
  r.ride_id,
  r.ride_status,
  u_rider.full_name AS rider_name,
  u_driver.full_name AS driver_name,
  lp.address AS pickup,
  ld.address AS dropoff,
  r.request_time,
  r.surge_multiplier
FROM rides r
JOIN users u_rider ON r.rider_id = u_rider.user_id
LEFT JOIN drivers d ON r.driver_id = d.driver_id
LEFT JOIN users u_driver ON d.user_id = u_driver.user_id
JOIN locations lp ON r.pickup_location_id = lp.location_id
JOIN locations ld ON r.dropoff_location_id = ld.location_id
WHERE r.ride_status NOT IN ('completed', 'cancelled');
