import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'lab-reports');

@Controller('api/uploads')
export class FileUploadController {
  @Post('lab-reports')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const userId = (req as any).user?.sub || 'unknown';
          const dir = join(UPLOAD_DIR, userId);
          const fs = require('fs');
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  uploadLabReport(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') userId: string,
  ) {
    return {
      filename: file.filename,
      path: `/api/uploads/lab-reports/${userId}/${file.filename}`,
      size: file.size,
    };
  }

  @Get('lab-reports/:userId/:filename')
  getLabReport(
    @Param('userId') fileUserId: string,
    @Param('filename') filename: string,
    @CurrentUser('sub') currentUserId: string,
    @CurrentUser('role') role: string,
    @Res() res: Response,
  ) {
    if (role !== 'researcher' && currentUserId !== fileUserId) {
      throw new ForbiddenException('Access denied');
    }

    const filePath = join(UPLOAD_DIR, fileUserId, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return res.sendFile(filePath);
  }

  @Delete('lab-reports/:userId/:filename')
  deleteLabReport(
    @Param('userId') fileUserId: string,
    @Param('filename') filename: string,
    @CurrentUser('sub') currentUserId: string,
  ) {
    if (currentUserId !== fileUserId) {
      throw new ForbiddenException('Access denied');
    }

    const filePath = join(UPLOAD_DIR, fileUserId, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    unlinkSync(filePath);
    return { message: 'File deleted' };
  }
}
