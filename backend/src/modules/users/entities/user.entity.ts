import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Profile } from './profile.entity';
import { UserRole } from './user-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, name: 'full_name', default: '' })
  fullName: string;

  @Column({ type: 'boolean', name: 'email_confirmed', default: false })
  emailConfirmed: boolean;

  @Column({ type: 'boolean', name: 'force_password_change', default: false })
  forcePasswordChange: boolean;

  @Column({ type: 'json', name: 'user_metadata', nullable: true })
  userMetadata: Record<string, any> | null;

  @Column({ type: 'varchar', length: 255, name: 'reset_token', nullable: true })
  resetToken: string | null;

  @Column({ type: 'datetime', name: 'reset_token_expires', nullable: true })
  resetTokenExpires: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => UserRole, (role) => role.user)
  roles: UserRole[];
}
