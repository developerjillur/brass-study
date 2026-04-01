import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('blinding_records')
export class BlindingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36, name: 'participant_id', unique: true })
  participantId: string;

  @Column({ type: 'varchar', length: 1, name: 'group_code' })
  groupCode: string;

  @Column({ type: 'datetime', name: 'assigned_at', nullable: true })
  assignedAt: Date | null;

  @Column({ type: 'datetime', name: 'revealed_at', nullable: true })
  revealedAt: Date | null;

  @Column({ type: 'boolean', name: 'is_revealed', default: false })
  isRevealed: boolean;
}
