import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './users.entity';

@Entity('voice_rooms')
export class VoiceRoomsEntity extends BaseEntity {
    @Column({ type: 'varchar', unique: true, length: 255, name: 'name' })
    name: string;

    @Column({ type: 'varchar', length: 255, name: 'description', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 32, name: 'language', default: 'en', nullable: true })
    language: string;

    @Column({ type: 'uuid', name: 'owner_id', nullable: true })
    owner_id: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'owner_id' })
    owner: UserEntity;
}