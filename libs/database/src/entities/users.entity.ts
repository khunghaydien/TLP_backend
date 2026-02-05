import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 255, unique: true, name: 'email' })
    email: string;

    @Column({ type: 'varchar', length: 255, name: 'password' })
    password: string;
}
