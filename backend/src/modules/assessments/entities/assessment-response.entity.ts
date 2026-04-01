import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('assessment_responses')
export class AssessmentResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36, name: 'participant_id' })
  participantId: string;

  @Column({ type: 'char', length: 36, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 50, name: 'assessment_type' })
  assessmentType: string;

  @Column({ type: 'json', nullable: true })
  responses: Record<string, any> | null;

  @Column({ type: 'int', name: 'total_score', nullable: true })
  totalScore: number | null;

  @Column({ type: 'json', name: 'subscale_scores', nullable: true })
  subscaleScores: Record<string, any> | null;

  @Column({ type: 'varchar', length: 50, name: 'time_point', nullable: true })
  timePoint: string | null;

  @Column({ type: 'int', name: 'study_day', nullable: true })
  studyDay: number | null;

  @Column({ type: 'datetime', name: 'completed_at', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
