import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private emailService: EmailService,
  ) {}

  private async notifyRecipientByEmail(senderId: string, recipientId: string, body: string) {
    try {
      const [sender, recipient] = await Promise.all([
        this.userRepo.findOne({ where: { id: senderId } }),
        this.userRepo.findOne({ where: { id: recipientId } }),
      ]);
      if (!recipient?.email || !sender) return;
      await this.emailService.sendNewMessageNotification(
        recipient.email,
        recipient.fullName || '',
        sender.fullName || 'the BRASS team',
        body || '',
      );
    } catch (err: any) {
      this.logger.warn(`Failed to send new-message email: ${err?.message || err}`);
    }
  }

  async send(
    senderId: string,
    data: Partial<Message>,
  ): Promise<Message> {
    const message = this.messageRepo.create({
      ...data,
      senderId,
    });
    const saved = await this.messageRepo.save(message);
    if (saved.recipientId && saved.recipientId !== senderId) {
      void this.notifyRecipientByEmail(senderId, saved.recipientId, saved.body || '');
    }
    return saved;
  }

  async broadcast(
    senderId: string,
    recipientIds: string[],
    subject: string | undefined,
    body: string | undefined,
    participantId?: string,
  ): Promise<Message[]> {
    const messages = recipientIds.map((recipientId) =>
      this.messageRepo.create({
        senderId,
        recipientId,
        subject,
        body,
        participantId: participantId || null,
      }),
    );
    const saved = await this.messageRepo.save(messages);
    for (const m of saved) {
      if (m.recipientId && m.recipientId !== senderId) {
        void this.notifyRecipientByEmail(senderId, m.recipientId, m.body || '');
      }
    }
    return saved;
  }

  async findByUserId(userId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: [{ senderId: userId }, { recipientId: userId }],
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.recipientId !== userId) {
      throw new ForbiddenException('Only the recipient can mark a message as read');
    }
    message.isRead = true;
    return this.messageRepo.save(message);
  }
}
