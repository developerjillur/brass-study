import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async send(
    senderId: string,
    data: Partial<Message>,
  ): Promise<Message> {
    const message = this.messageRepo.create({
      ...data,
      senderId,
    });
    return this.messageRepo.save(message);
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
    return this.messageRepo.save(messages);
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
