import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialLink } from './entities/social-link.entity';
import { SocialLinksService } from './social-links.service';
import { SocialLinksController } from './social-links.controller';

@Module({
    imports: [TypeOrmModule.forFeature([SocialLink])],
    controllers: [SocialLinksController],
    providers: [SocialLinksService],
    exports: [SocialLinksService],
})
export class SocialLinksModule { }
