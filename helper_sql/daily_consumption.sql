SELECT 
  `cp`.`mbusPrimary` AS `id`, 
  `cp`.`name` AS `name`, 
  `cp`.`mediumId` AS `medium ID`,
  `m`.`name` AS `medium`, 
  DATE(DATE_SUB(`cd`.`time`, INTERVAL 1 DAY)) AS `day`,
  `cd`.`value` AS `value`,
  `m`.`unitAbbr` AS `unit`
  FROM `consumption_daily` AS `cd` 
  LEFT JOIN `consumption_place` AS `cp` 
    ON `cp`.`mbusPrimary` = `cd`.`consumptionPlaceMbusPrimary`
  LEFT JOIN `medium` AS `m`
    ON `m`.`id` = `cp`.`mediumId`;