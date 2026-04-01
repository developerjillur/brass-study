import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('participant_intake')
export class ParticipantIntake {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36, name: 'participant_id', unique: true })
  participantId: string;

  @Column({ type: 'char', length: 36, name: 'user_id' })
  userId: string;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sex: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ethnicity: string | null;

  @Column({ type: 'int', name: 'ckd_diagnosis_year', nullable: true })
  ckdDiagnosisYear: number | null;

  @Column({ type: 'text', name: 'current_medications', nullable: true })
  currentMedications: string | null;

  @Column({ type: 'json', nullable: true })
  comorbidities: string[] | null;

  @Column({ type: 'text', nullable: true })
  allergies: string | null;

  @Column({ type: 'varchar', length: 255, name: 'primary_doctor_name', nullable: true })
  primaryDoctorName: string | null;

  @Column({ type: 'varchar', length: 50, name: 'primary_doctor_phone', nullable: true })
  primaryDoctorPhone: string | null;

  @Column({ type: 'varchar', length: 255, name: 'emergency_contact_name', nullable: true })
  emergencyContactName: string | null;

  @Column({ type: 'varchar', length: 50, name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone: string | null;

  @Column({ type: 'varchar', length: 100, name: 'emergency_contact_relationship', nullable: true })
  emergencyContactRelationship: string | null;

  @Column({ type: 'text', name: 'signature_text', nullable: true })
  signatureText: string | null;

  @Column({ type: 'datetime', name: 'signed_at', nullable: true })
  signedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
