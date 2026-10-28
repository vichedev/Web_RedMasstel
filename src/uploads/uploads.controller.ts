import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('uploads')
export class UploadsController {
    /**
     * Sube una imagen (jpg, png, webp, gif). Máx 5 MB.
     */
    @Post('image')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No se envió ningún archivo');
        }
        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('Solo se permiten imágenes en este endpoint');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new BadRequestException('La imagen supera los 5 MB');
        }
        return {
            filename: file.filename,
            url: `/static/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype,
        };
    }

    /**
     * Sube un documento PDF. Máx 25 MB.
     */
    @Post('document')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    uploadDocument(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No se envió ningún archivo');
        }
        if (file.mimetype !== 'application/pdf') {
            throw new BadRequestException(
                'Solo se permiten archivos PDF en este endpoint',
            );
        }
        return {
            filename: file.filename,
            url: `/static/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype,
            originalName: file.originalname,
        };
    }
}
