import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailConfig } from './entities/email-config.entity';
import { EmailConfigService } from './email-config.service';
import { EmailConfigController } from './email-config.controller';

@Module({
    imports: [TypeOrmModule.forFeature([EmailConfig])],
    controllers: [EmailConfigController],
    providers: [EmailConfigService],
    exports: [EmailConfigService],
})
export class EmailConfigModule { }
