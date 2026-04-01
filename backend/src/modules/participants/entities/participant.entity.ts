import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36, name: 'user_id', unique: true })
  userId: string;

  @Column({ type: 'char', length: 36, name: 'screening_id', nullable: true })
  screeningId: string | null;

  @Column({
    type: 'enum',
    enum: ['screening', 'onboarding', 'active', 'completed', 'withdrawn'],
    default: 'screening',
  })
  status: string;

  @Column({ type: 'datetime', name: 'study_start_date', nullable: true })
  studyStartDate: Date | null;

  @Column({ type: 'int', name: 'study_day', nullable: true })
  studyDay: number | null;

  @Column({ type: 'int', name: 'onboarding_step', default: 1 })
  onboardingStep: number;

  @Column({ type: 'boolean', name: 'onboarding_completed', default: false })
  onboardingCompleted: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'compliance_rate', nullable: true })
  complianceRate: number | null;

  @Column({ type: 'text', name: 'researcher_notes', nullable: true })
  researcherNotes: string | null;

  @Column({ type: 'datetime', name: 'enrolled_at', nullable: true })
  enrolledAt: Date | null;

  @Column({ type: 'datetime', name: 'completed_at', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'datetime', name: 'withdrawn_at', nullable: true })
  withdrawnAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
