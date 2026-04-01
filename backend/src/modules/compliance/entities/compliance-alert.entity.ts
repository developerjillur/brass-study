import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('compliance_alerts')
@Unique(['participantId', 'alertDate', 'alertType'])
export class ComplianceAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36, name: 'participant_id' })
  participantId: string;

  @Column({ type: 'char', length: 36, name: 'participant_user_id', nullable: true })
  participantUserId: string | null;

  @Column({
    type: 'enum',
    enum: ['missed_session', 'daily_reminder'],
    name: 'alert_type',
  })
  alertType: 'missed_session' | 'daily_reminder';

  @Column({ type: 'date', name: 'alert_date' })
  alertDate: Date;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'boolean', name: 'is_dismissed', default: false })
  isDismissed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
