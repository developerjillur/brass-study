import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudySetting } from './entities/study-setting.entity';

@Injectable()
export class StudySettingsService {
  constructor(
    @InjectRepository(StudySetting)
    private settingRepo: Repository<StudySetting>,
  ) {}

  async findAll(): Promise<StudySetting[]> {
    return this.settingRepo.find({ order: { settingKey: 'ASC' } });
  }

  async findByKey(key: string): Promise<StudySetting> {
    const setting = await this.settingRepo.findOne({
      where: { settingKey: key },
    });
    if (!setting) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }
    return setting;
  }

  async updateByKey(
    key: string,
    value: string,
    updatedBy: string,
  ): Promise<StudySetting> {
    let setting = await this.settingRepo.findOne({
      where: { settingKey: key },
    });
    if (!setting) {
      setting = this.settingRepo.create({
        settingKey: key,
        settingValue: value,
        updatedBy,
      });
    } else {
      setting.settingValue = value;
      setting.updatedBy = updatedBy;
    }
    return this.settingRepo.save(setting);
  }
}
