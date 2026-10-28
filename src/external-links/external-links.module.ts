import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalLink } from './entities/external-link.entity';
import { ExternalLinksService } from './external-links.service';
import { ExternalLinksController } from './external-links.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ExternalLink])],
    controllers: [ExternalLinksController],
    providers: [ExternalLinksService],
    exports: [ExternalLinksService],
})
export class ExternalLinksModule { }
