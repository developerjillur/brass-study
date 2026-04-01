import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('consent_responses')
export class ConsentResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36, name: 'participant_id' })
  participantId: string;

  @Column({ type: 'char', length: 36, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 100, name: 'consent_type' })
  consentType: string;

  @Column({ type: 'boolean', default: false })
  consented: boolean;

  @Column({ type: 'varchar', length: 50, name: 'consent_version', nullable: true })
  consentVersion: string | null;

  @Column({ type: 'varchar', length: 45, name: 'ip_address', nullable: true })
  ipAddress: string | null;

  @Column({ type: 'datetime', name: 'signed_at', nullable: true })
  signedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
