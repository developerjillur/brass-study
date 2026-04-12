import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/change-password.dto';
import { jwtConfig } from '../../config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(UserRole)
    private userRoleRepo: Repository<UserRole>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName || '',
      emailConfirmed: true,
    });
    await this.userRepo.save(user);

    // Auto-create profile
    const profile = this.profileRepo.create({
      userId: user.id,
      fullName: dto.fullName || '',
      email: dto.email,
    });
    await this.profileRepo.save(profile);

    // Assign role
    if (dto.role) {
      const role = this.userRoleRepo.create({
        userId: user.id,
        role: dto.role,
      });
      await this.userRoleRepo.save(role);
    }

    const userRole = dto.role || 'participant';
    const token = this.generateToken(user.id, user.email, userRole);

    return {
      access_token: token,
      user: { id: user.id, email: user.email, role: userRole, full_name: user.fullName },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roleRecord = await this.userRoleRepo.findOne({
      where: { userId: user.id },
    });
    const role = (roleRecord?.role as 'researcher' | 'participant') || 'participant';

    const token = this.generateToken(user.id, user.email, role);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role,
        full_name: user.fullName,
        force_password_change: user.forcePasswordChange,
        user_metadata: user.userMetadata,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const roleRecord = await this.userRoleRepo.findOne({
      where: { userId: user.id },
    });
    const role = roleRecord?.role || null;

    const profile = await this.profileRepo.findOne({
      where: { userId: user.id },
    });

    return {
      id: user.id,
      email: user.email,
      role,
      full_name: user.fullName,
      force_password_change: user.forcePasswordChange,
      user_metadata: user.userMetadata,
      profile,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (dto.currentPassword) {
      const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!isValid) {
        throw new BadRequestException('Current password is incorrect');
      }
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    user.forcePasswordChange = false;
    await this.userRepo.save(user);

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    user.resetToken = resetToken;
    user.resetTokenExpires = expires;
    await this.userRepo.save(user);

    console.log(`[EMAIL] Password reset link for ${user.email}: token=${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepo.findOne({
      where: { resetToken: dto.token },
    });
    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    user.resetToken = null;
    user.resetTokenExpires = null;
    user.forcePasswordChange = false;
    await this.userRepo.save(user);

    return { message: 'Password reset successfully' };
  }

  async createUserWithTempPassword(
    email: string,
    fullName: string,
    role: 'researcher' | 'participant',
  ): Promise<{ user: User; tempPassword: string }> {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      return { user: existing, tempPassword: '' };
    }

    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = this.userRepo.create({
      email,
      passwordHash,
      fullName,
      forcePasswordChange: true,
      emailConfirmed: true,
    });
    await this.userRepo.save(user);

    // Auto-create profile
    const profile = this.profileRepo.create({
      userId: user.id,
      fullName,
      email,
    });
    await this.profileRepo.save(profile);

    // Assign role
    const userRole = this.userRoleRepo.create({ userId: user.id, role });
    await this.userRoleRepo.save(userRole);

    return { user, tempPassword };
  }

  private generateToken(userId: string, email: string, role: string): string {
    return this.jwtService.sign(
      { sub: userId, email, role },
      { secret: jwtConfig.secret, expiresIn: '30m' as any },
    );
  }

  async resetUserPassword(userId: string): Promise<{ user: User; tempPassword: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const tempPassword = this.generateTempPassword();
    user.passwordHash = await bcrypt.hash(tempPassword, 12);
    user.forcePasswordChange = true;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await this.userRepo.save(user);
    return { user, tempPassword };
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
