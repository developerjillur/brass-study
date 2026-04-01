import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('screening_submissions')
export class ScreeningSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'boolean', name: 'consent_to_contact', default: false })
  consentToContact: boolean;

  @Column({
    type: 'enum',
    enum: ['pending', 'screener_sent', 'screener_completed', 'eligible', 'ineligible', 'invited', 'declined'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'char', length: 36, name: 'reviewed_by', nullable: true })
  reviewedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
