import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36, name: 'sender_id' })
  senderId: string;

  @Column({ type: 'char', length: 36, name: 'recipient_id' })
  recipientId: string;

  @Column({ type: 'char', length: 36, name: 'participant_id', nullable: true })
  participantId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string | null;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  @Column({ type: 'boolean', name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
