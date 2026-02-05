import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVoiceRoomTable1770275623797 implements MigrationInterface {
    name = 'CreateVoiceRoomTable1770275623797'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "voice_rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" character varying(255), "language" character varying(32) DEFAULT 'en', "owner_id" uuid, CONSTRAINT "UQ_1cf6ab44973e47344f73af22915" UNIQUE ("name"), CONSTRAINT "PK_19cda109980dafdea5b8e60df7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "voice_rooms" ADD CONSTRAINT "FK_cefd7aa0b6abc1165e71017e4c4" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "voice_rooms" DROP CONSTRAINT "FK_cefd7aa0b6abc1165e71017e4c4"`);
        await queryRunner.query(`DROP TABLE "voice_rooms"`);
    }

}
