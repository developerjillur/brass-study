import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('study_settings')
export class StudySetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, name: 'setting_key', unique: true })
  settingKey: string;

  @Column({ type: 'text', name: 'setting_value', nullable: true })
  settingValue: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'char', length: 36, name: 'updated_by', nullable: true })
  updatedBy: string | null;
}
