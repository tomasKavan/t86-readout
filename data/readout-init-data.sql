INSERT INTO `medium` (`id`, `name`, `unitAbbr`, `unit`) VALUES 
('cwat','Cold Water','l','Liter'),
('elec','Electricity','Wh','Watthours'),
('gas','Gas','l','Liter'),
('heat','Heat Outlet','Wh','Watthours'),
('hwat','Hot Water','l','Liter');

INSERT INTO `meter_type` (`id`, `manufacturer`, `model`, `valueRecordId`, `rescaleOrder`, `mediumId`) VALUES 
('apambna1_cw','APA','APT-MBUS-NA-1 CW',2,0,'cwat'),
('apambna1_hw','APA','APT-MBUS-NA-1 HW',2,0,'hwat'),
('inmpro380','INM','Inepro Metering PRO380-Mb',0,1,'elec'),
('lugt230','LUG','Landis & Gyr Ultraheat T230',2,3,'heat');

INSERT INTO `consumption_place` (`mbusPrimary`, `name`, `installationRoomNumber`, `installationDetails`, `mediumId`) VALUES 
(0,'Elektřina Fakturační','ulice','v RE','elec'),
(1,'Elektřina Byt 1','0.0.3','v RSS','elec'),
(2,'Elektřina Byt 2','0.0.3','v RSS','elec'),
(3,'Elektřina Byt 3','0.0.3','v RSS','elec'),
(4,'Elektřina Byt 4','0.0.3','v RSS','elec'),
(5,'Elektřina Kotelna','0.0.3','v RSS','elec'),
(6,'Elektřina Nabíječka Venek','0.0.3','v RSS','elec'),
(7,'Elektřina Nabíječka Venek','0.0.3','v RSS','elec'),
(8,'Elektřina Dílna','0.0.3','v RSS','elec'),
(9,'Elektřina Společné prostory','0.0.3','v RSS','elec'),
(10,'Elektřina Zahradní domek','0.0.3','v RSS','elec'),
(11,'Elektřina Vířivka v zahradě','1.0.3','v RZ','elec'),
(12,'Elektřina Sauna v zahradě','1.0.3','v R5; zapojen za měřením domečku','elec'),
(15,'Voda Fakturační','0.0.2',' ','cwat'),
(16,'Studená Voda Dílna','0.0.6','vedle bojleru','cwat'),
(17,'Teplá Voda Dílna','0.0.6','vedle bojleru','hwat'),
(45,'Ohřev Teplé vody','0.0.6','','heat'),
(46,'Vytápění Společné prostory','0.0.6','','heat'),
(47,'Vytápění Byt 1','0.0.6','','heat'),
(48,'Vytápění Byt 2','0.0.6','','heat'),
(49,'Vytápění Byt 3','0.0.6','','heat'),
(50,'Vytápění Byt 4','0.0.6','','heat');

INSERT INTO `meter` (`id`, `serialNumber`, `mbusSecondary`, `notes`, `typeId`) VALUES 
(1,'523364',523364,' ','apambna1_hw'),
(2,'618175',618175,' ','apambna1_cw'),
(6,'21080516',21080516,' ','inmpro380'),
(7,'21080521',21080521,' ','inmpro380'),
(8,'21080141',21080141,'','inmpro380'),
(9,'21080518',21080518,'','inmpro380'),
(10,'71396329',71396329,'','lugt230'),
(11,'21080146',21080146,'','inmpro380'),
(12,'21080508',21080508,'','inmpro380'),
(13,'71396362',71396362,'','lugt230'),
(14,'71396425',71396425,'','lugt230'),
(15,'71396309',71396309,'','lugt230'),
(16,'71396494',71396494,'','lugt230'),
(17,'71396423',71396423,'','lugt230');

INSERT INTO `meter_installation` (`id`, `installation`, `removal`, `lockedReadoutBefore`, `notes`, `consumptionPlaceMbusPrimary`, `meterId`) VALUES 
(1,'2024-07-27 00:00:00',NULL,NULL,'',1,6),
(2,'2024-07-27 00:00:00',NULL,NULL,'',2,7),
(3,'2024-07-27 00:00:00',NULL,NULL,'',16,2),
(4,'2024-07-27 00:00:00',NULL,NULL,'',17,1),
(5,'2024-07-27 00:00:00',NULL,NULL,'',3,8),
(6,'2024-07-27 00:00:00',NULL,NULL,'',4,9),
(7,'2024-07-27 00:00:00',NULL,NULL,'',45,10),
(8,'2024-07-27 00:00:00',NULL,NULL,'',5,11),
(20,'2024-07-27 00:00:00',NULL,NULL,'',46,13),
(21,'2024-07-27 00:00:00',NULL,NULL,'',47,14),
(22,'2024-07-27 00:00:00',NULL,NULL,'',48,15),
(23,'2024-07-27 00:00:00',NULL,NULL,'',49,16),
(24,'2024-07-27 00:00:00',NULL,NULL,' ',50,17),
(25,'2024-07-27 23:40:00',NULL,NULL,' ',9,12);
