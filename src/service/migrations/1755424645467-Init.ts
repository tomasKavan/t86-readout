import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1755424645467 implements MigrationInterface {
    name = 'Init1755424645467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`readout\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('rout', 'err') NOT NULL, \`source\` enum ('mbus', 'man') NOT NULL, \`value\` decimal(16,3) NOT NULL DEFAULT '0.000', \`errCode\` enum ('E_MBUS_CONNECTION', 'E_MBUS_SLAVE_READ', 'E_MBUS_SERIAL_MISMATCH') NULL, \`errDetail\` varchar(255) NULL, \`meterUTCTimestamp\` datetime(0) NULL, \`createdUTCTime\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`deletedUTCTime\` datetime(0) NULL, \`metricId\` int NOT NULL, INDEX \`idx_readout_metric_ts_desc_value\` (\`metricId\`, \`meterUTCTimestamp\`, \`value\`), INDEX \`idx_readout_metric_ts_desc\` (\`metricId\`, \`deletedUTCTime\`, \`meterUTCTimestamp\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`metric\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('cons', 'tel') NOT NULL, \`func\` enum ('inst', 'sum') NOT NULL, \`hasPhysicalDisplay\` tinyint NOT NULL DEFAULT 0, \`mbusValueRecordId\` int NULL, \`mbusDecimalShift\` int NULL, \`createdUTCTime\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`updatedUTCTime\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0), \`deletedUTCTime\` datetime(0) NULL, \`measPointId\` varchar(16) NOT NULL, UNIQUE INDEX \`IDX_dfc02144b4875a0b1b4653c281\` (\`measPointId\`, \`mbusValueRecordId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`meas_point\` (\`id\` varchar(16) NOT NULL, \`name\` varchar(255) NOT NULL, \`roomNo\` varchar(8) NOT NULL, \`instDetails\` varchar(255) NOT NULL DEFAULT '', \`notes\` varchar(255) NOT NULL DEFAULT '', \`subject\` enum ('ele', 'gas', 'wat', 'hth', 'env', 'cln') NOT NULL, \`subjectSpec\` enum ('cold', 'hot') NULL, \`mbusAddr\` smallint NULL, \`mbusSerial\` varchar(255) NULL, \`meterManufacturer\` varchar(255) NULL, \`meterType\` varchar(255) NULL, \`autoReadoutEnabled\` tinyint NOT NULL DEFAULT 0, \`createdUTCTime\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`updatedUTCTime\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0), \`deletedUTCTime\` datetime(0) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`service_event\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('metrep') NOT NULL, \`occuredUTCTime\` datetime(0) NOT NULL, \`oldMbusAddr\` int NULL, \`oldMbusSerial\` varchar(255) NULL, \`oldMeterManufacturer\` varchar(255) NULL, \`oldMeterType\` varchar(255) NULL, \`comments\` text NULL, \`createdUTCTime\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`deletedUTCTime\` datetime(0) NULL, \`measPointId\` varchar(16) NOT NULL, INDEX \`idx_service_event_occured\` (\`occuredUTCTime\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`correction\` (\`id\` int NOT NULL AUTO_INCREMENT, \`value\` decimal(16,3) NOT NULL DEFAULT '0.000', \`oldMeterEndValue\` decimal(16,3) NULL, \`newMeterStartValue\` decimal(16,3) NULL, \`oldMeterHasPhysicalDisplay\` tinyint NULL, \`oldMeterMbusValueRecordId\` int NULL, \`oldMeterMbusDecimalShift\` int NULL, \`createdUTCTime\` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`deletedUTCTime\` datetime(0) NULL, \`serviceEventId\` int NOT NULL, \`metricId\` int NOT NULL, INDEX \`idx_correction_event_metric_deleted\` (\`serviceEventId\`, \`metricId\`, \`deletedUTCTime\`), INDEX \`idx_correction_event_metric\` (\`serviceEventId\`, \`metricId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`readout\` ADD CONSTRAINT \`FK_821ef8bb9a691fb73e3295665c9\` FOREIGN KEY (\`metricId\`) REFERENCES \`metric\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`metric\` ADD CONSTRAINT \`FK_3710c3f35d4038c39c1d55c7838\` FOREIGN KEY (\`measPointId\`) REFERENCES \`meas_point\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`service_event\` ADD CONSTRAINT \`FK_5691ce0d064407e4e5cfd462551\` FOREIGN KEY (\`measPointId\`) REFERENCES \`meas_point\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`correction\` ADD CONSTRAINT \`FK_b102c6c0b2a9ae85d3a72491254\` FOREIGN KEY (\`serviceEventId\`) REFERENCES \`service_event\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`correction\` ADD CONSTRAINT \`FK_6ba667647e82b0d7a7d1a74be4d\` FOREIGN KEY (\`metricId\`) REFERENCES \`metric\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`correction\` DROP FOREIGN KEY \`FK_6ba667647e82b0d7a7d1a74be4d\``);
        await queryRunner.query(`ALTER TABLE \`correction\` DROP FOREIGN KEY \`FK_b102c6c0b2a9ae85d3a72491254\``);
        await queryRunner.query(`ALTER TABLE \`service_event\` DROP FOREIGN KEY \`FK_5691ce0d064407e4e5cfd462551\``);
        await queryRunner.query(`ALTER TABLE \`metric\` DROP FOREIGN KEY \`FK_3710c3f35d4038c39c1d55c7838\``);
        await queryRunner.query(`ALTER TABLE \`readout\` DROP FOREIGN KEY \`FK_821ef8bb9a691fb73e3295665c9\``);
        await queryRunner.query(`DROP INDEX \`idx_correction_event_metric\` ON \`correction\``);
        await queryRunner.query(`DROP INDEX \`idx_correction_event_metric_deleted\` ON \`correction\``);
        await queryRunner.query(`DROP TABLE \`correction\``);
        await queryRunner.query(`DROP INDEX \`idx_service_event_occured\` ON \`service_event\``);
        await queryRunner.query(`DROP TABLE \`service_event\``);
        await queryRunner.query(`DROP TABLE \`meas_point\``);
        await queryRunner.query(`DROP INDEX \`IDX_dfc02144b4875a0b1b4653c281\` ON \`metric\``);
        await queryRunner.query(`DROP TABLE \`metric\``);
        await queryRunner.query(`DROP INDEX \`idx_readout_metric_ts_desc\` ON \`readout\``);
        await queryRunner.query(`DROP INDEX \`idx_readout_metric_ts_desc_value\` ON \`readout\``);
        await queryRunner.query(`DROP TABLE \`readout\``);
    }

}
