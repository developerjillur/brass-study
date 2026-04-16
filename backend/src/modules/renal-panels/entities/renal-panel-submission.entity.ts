import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('renal_panel_submissions')
export class RenalPanelSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36, name: 'screening_id', nullable: true })
  screeningId: string | null;

  @Column({ type: 'char', length: 36, name: 'participant_user_id', nullable: true })
  participantUserId: string | null;

  @Column({ type: 'varchar', length: 255, name: 'full_name', nullable: true })
  fullName: string | null;

  @Column({ type: 'varchar', length: 50, name: 'ckd_stage', nullable: true })
  ckdStage: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  bun: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  creatinine: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  egfr: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  calcium: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  phosphorus: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  albumin: number | null;

  @Column({ type: 'date', name: 'lab_date', nullable: true })
  labDate: Date | null;

  @Column({ type: 'varchar', length: 255, name: 'doctor_name', nullable: true })
  doctorName: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'boolean', name: 'is_eligible', nullable: true })
  isEligible: boolean | null;

  @Column({
    type: 'enum',
    enum: ['screening', 'baseline', 'followup', 'follow_up'],
    name: 'submission_type',
    default: 'screening',
  })
  submissionType: 'screening' | 'baseline' | 'followup' | 'follow_up';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
