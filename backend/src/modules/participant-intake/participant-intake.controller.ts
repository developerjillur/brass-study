import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ParticipantIntakeService } from './participant-intake.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/participant-intake')
export class ParticipantIntakeController {
  constructor(private readonly intakeService: ParticipantIntakeService) {}

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() body: Record<string, any>,
  ) {
    return this.intakeService.create(userId, {
      participantId: body.participant_id,
      age: body.age,
      sex: body.sex,
      ethnicity: body.ethnicity,
      ckdDiagnosisYear: body.ckd_diagnosis_year,
      currentMedications: body.current_medications,
      comorbidities: body.comorbidities,
      allergies: body.allergies,
      primaryDoctorName: body.primary_doctor_name,
      primaryDoctorPhone: body.primary_doctor_phone,
      emergencyContactName: body.emergency_contact_name,
      emergencyContactPhone: body.emergency_contact_phone,
      emergencyContactRelationship: body.emergency_contact_relationship,
      signatureText: body.signature_text,
      signedAt: body.signed_at ? new Date(body.signed_at) : undefined,
    });
  }

  @Get('mine')
  getMine(@CurrentUser('sub') userId: string) {
    return this.intakeService.findByUserId(userId);
  }

  @Put('mine')
  updateMine(
    @CurrentUser('sub') userId: string,
    @Body() body: Record<string, any>,
  ) {
    const data: Partial<any> = {};
    if (body.age !== undefined) data.age = body.age;
    if (body.sex !== undefined) data.sex = body.sex;
    if (body.ethnicity !== undefined) data.ethnicity = body.ethnicity;
    if (body.ckd_diagnosis_year !== undefined) data.ckdDiagnosisYear = body.ckd_diagnosis_year;
    if (body.current_medications !== undefined) data.currentMedications = body.current_medications;
    if (body.comorbidities !== undefined) data.comorbidities = body.comorbidities;
    if (body.allergies !== undefined) data.allergies = body.allergies;
    if (body.primary_doctor_name !== undefined) data.primaryDoctorName = body.primary_doctor_name;
    if (body.primary_doctor_phone !== undefined) data.primaryDoctorPhone = body.primary_doctor_phone;
    if (body.emergency_contact_name !== undefined) data.emergencyContactName = body.emergency_contact_name;
    if (body.emergency_contact_phone !== undefined) data.emergencyContactPhone = body.emergency_contact_phone;
    if (body.emergency_contact_relationship !== undefined) data.emergencyContactRelationship = body.emergency_contact_relationship;
    if (body.signature_text !== undefined) data.signatureText = body.signature_text;
    if (body.signed_at !== undefined) data.signedAt = new Date(body.signed_at);
    return this.intakeService.updateByUserId(userId, data);
  }

  @Get(':participantId')
  @UseGuards(RolesGuard)
  @Roles('researcher')
  findByParticipant(@Param('participantId') participantId: string) {
    return this.intakeService.findByParticipantId(participantId);
  }
}
