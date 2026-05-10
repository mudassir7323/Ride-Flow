CREATE USER IF NOT EXISTS 'rf_admin'@'localhost' IDENTIFIED BY 'Admin@RF2026!';
CREATE USER IF NOT EXISTS 'rf_rider'@'localhost' IDENTIFIED BY 'Rider@RF2026!';
CREATE USER IF NOT EXISTS 'rf_driver'@'localhost' IDENTIFIED BY 'Driver@RF2026!';
CREATE USER IF NOT EXISTS 'rf_app'@'localhost' IDENTIFIED BY 'App@RF2026!';

GRANT ALL PRIVILEGES ON rideflow_db.* TO 'rf_admin'@'localhost';

GRANT SELECT, INSERT, UPDATE, DELETE ON rideflow_db.* TO 'rf_app'@'localhost';
GRANT EXECUTE ON rideflow_db.* TO 'rf_app'@'localhost';

GRANT SELECT ON rideflow_db.users TO 'rf_rider'@'localhost';
GRANT SELECT, INSERT ON rideflow_db.rides TO 'rf_rider'@'localhost';
GRANT SELECT ON rideflow_db.payments TO 'rf_rider'@'localhost';
GRANT SELECT, INSERT ON rideflow_db.ratings TO 'rf_rider'@'localhost';
GRANT SELECT, INSERT ON rideflow_db.complaints TO 'rf_rider'@'localhost';
GRANT SELECT ON rideflow_db.promo_codes TO 'rf_rider'@'localhost';
GRANT SELECT, INSERT ON rideflow_db.locations TO 'rf_rider'@'localhost';

GRANT SELECT, UPDATE ON rideflow_db.rides TO 'rf_driver'@'localhost';
GRANT SELECT, UPDATE ON rideflow_db.drivers TO 'rf_driver'@'localhost';
GRANT SELECT, INSERT, UPDATE ON rideflow_db.vehicles TO 'rf_driver'@'localhost';
GRANT SELECT ON rideflow_db.driver_earnings TO 'rf_driver'@'localhost';
GRANT SELECT, INSERT ON rideflow_db.ratings TO 'rf_driver'@'localhost';
GRANT SELECT, INSERT ON rideflow_db.complaints TO 'rf_driver'@'localhost';
GRANT SELECT ON rideflow_db.vw_driver_leaderboard TO 'rf_driver'@'localhost';

REVOKE DELETE ON rideflow_db.rides FROM 'rf_rider'@'localhost';
REVOKE DELETE ON rideflow_db.rides FROM 'rf_driver'@'localhost';

FLUSH PRIVILEGES;
