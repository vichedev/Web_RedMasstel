import {
    Injectable,
    Logger,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailConfig } from './entities/email-config.entity';
import { UpdateEmailConfigDto } from './dto/update-email-config.dto';

@Injectable()
export class EmailConfigService implements OnApplicationBootstrap {
    private readonly logger = new Logger(EmailConfigService.name);

    constructor(
        @InjectRepository(EmailConfig)
        private readonly configRepository: Repository<EmailConfig>,
    ) { }

    /** Crea la fila singleton si aún no existe. */
    async onApplicationBootstrap(): Promise<void> {
        try {
            const existing = await this.configRepository.findOne({
                where: {},
                order: { createdAt: 'ASC' },
            });
            if (existing) return;
            await this.configRepository.save(this.configRepository.create({}));
            this.logger.log('Configuración de EmailJS inicializada (vacía).');
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.error(`Error inicializando email-config: ${message}`);
        }
    }

    /**
     * Devuelve la única fila. Si por alguna razón no existe (p. ej. el
     * bootstrap aún no corrió), la crea sobre la marcha.
     */
    async findOne(): Promise<EmailConfig> {
        let config = await this.configRepository.findOne({
            where: {},
            order: { createdAt: 'ASC' },
        });
        if (!config) {
            config = await this.configRepository.save(
                this.configRepository.create({}),
            );
        }
        return config;
    }

    async update(dto: UpdateEmailConfigDto): Promise<EmailConfig> {
        const config = await this.findOne();
        // Cadena vacía => null para que el frontend pueda detectar
        // "campo no configurado" sin tener que comparar contra "".
        if (dto.publicKey !== undefined) {
            config.publicKey = dto.publicKey?.trim() || null;
        }
        if (dto.serviceId !== undefined) {
            config.serviceId = dto.serviceId?.trim() || null;
        }
        if (dto.templateContact !== undefined) {
            config.templateContact = dto.templateContact?.trim() || null;
        }
        if (dto.templateSubscribe !== undefined) {
            config.templateSubscribe = dto.templateSubscribe?.trim() || null;
        }
        if (dto.adminEmail !== undefined) {
            config.adminEmail = dto.adminEmail?.trim() || null;
        }
        return this.configRepository.save(config);
    }
}
