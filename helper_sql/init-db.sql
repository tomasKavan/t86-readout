CREATE DATABASE readout2
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

CREATE USER 'readout'@'localhost' IDENTIFIED BY 'oh.G.read.4';

GRANT ALL PRIVILEGES ON readout2.* TO 'readout'@'localhost';

FLUSH PRIVILEGES;
