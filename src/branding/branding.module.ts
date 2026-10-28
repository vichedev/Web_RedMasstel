import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandingAsset } from './entities/branding-asset.entity';
import { BrandingService } from './branding.service';
import { BrandingController } from './branding.controller';

@Module({
    imports: [TypeOrmModule.forFeature([BrandingAsset])],
    controllers: [BrandingController],
    providers: [BrandingService],
    exports: [BrandingService],
})
export class BrandingModule { }
