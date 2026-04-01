import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('therapy_sessions')
@Unique(['participantId', 'sessionDate'])
export class TherapySession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36, name: 'participant_id' })
  participantId: string;

  @Column({ type: 'char', length: 36, name: 'user_id' })
  userId: string;

  @Column({ type: 'date', name: 'session_date' })
  sessionDate: Date;

  @Column({ type: 'int', name: 'study_day', nullable: true })
  studyDay: number | null;

  @Column({ type: 'int', name: 'duration_minutes', nullable: true })
  durationMinutes: number | null;

  @Column({ type: 'varchar', length: 100, name: 'device_used', nullable: true })
  deviceUsed: string | null;

  @Column({ type: 'varchar', length: 100, name: 'body_area', nullable: true })
  bodyArea: string | null;

  @Column({ type: 'tinyint', name: 'pain_level_before', nullable: true })
  painLevelBefore: number | null;

  @Column({ type: 'tinyint', name: 'pain_level_after', nullable: true })
  painLevelAfter: number | null;

  @Column({ type: 'tinyint', name: 'fatigue_level', nullable: true })
  fatigueLevel: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', name: 'side_effects', nullable: true })
  sideEffects: string | null;

  @Column({ type: 'boolean', default: false })
  skipped: boolean;

  @Column({ type: 'text', name: 'skip_reason', nullable: true })
  skipReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
