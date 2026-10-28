import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    CookieConsent,
    CookieDecision,
} from './entities/cookie-consent.entity';
import { CreateCookieConsentDto } from './dto/create-cookie-consent.dto';

export interface DailyRow {
    date: string;
    accepted: number;
    rejected: number;
}

@Injectable()
export class CookieConsentService {
    constructor(
        @InjectRepository(CookieConsent)
        private readonly repo: Repository<CookieConsent>,
    ) { }

    /** Registra o actualiza la decisión de un visitante. */
    async record(dto: CreateCookieConsentDto, userAgent?: string) {
        await this.repo.upsert(
            {
                visitorId: dto.visitorId,
                decision: dto.decision,
                userAgent: userAgent ? userAgent.slice(0, 255) : null,
            },
            { conflictPaths: ['visitorId'] },
        );
        return { ok: true };
    }

    /** Estadísticas para el panel. */
    async stats(days = 30) {
        const totals = await this.repo
            .createQueryBuilder('c')
            .select('c.decision', 'decision')
            .addSelect('COUNT(*)::int', 'count')
            .groupBy('c.decision')
            .getRawMany<{ decision: CookieDecision; count: number }>();

        const accepted =
            totals.find((t) => t.decision === CookieDecision.ACCEPTED)?.count ?? 0;
        const rejected =
            totals.find((t) => t.decision === CookieDecision.REJECTED)?.count ?? 0;
        const total = accepted + rejected;

        // Serie diaria de los últimos `days` días (incluye días en cero).
        const daily: DailyRow[] = await this.repo.query(
            `SELECT to_char(d.day, 'YYYY-MM-DD') AS date,
                    COALESCE(SUM(CASE WHEN c.decision = 'ACCEPTED' THEN 1 ELSE 0 END), 0)::int AS accepted,
                    COALESCE(SUM(CASE WHEN c.decision = 'REJECTED' THEN 1 ELSE 0 END), 0)::int AS rejected
               FROM generate_series(current_date - ($1::int - 1), current_date, interval '1 day') AS d(day)
               LEFT JOIN cookie_consents c ON date_trunc('day', c."updatedAt") = d.day
              GROUP BY d.day
              ORDER BY d.day`,
            [days],
        );

        const last7Days = await this.repo
            .createQueryBuilder('c')
            .where(`c."updatedAt" >= now() - interval '7 days'`)
            .getCount();

        const recent = await this.repo.find({
            order: { updatedAt: 'DESC' },
            take: 25,
            select: ['id', 'decision', 'userAgent', 'createdAt', 'updatedAt'],
        });

        return {
            total,
            accepted,
            rejected,
            acceptanceRate: total ? Math.round((accepted / total) * 1000) / 10 : 0,
            last7Days,
            daily,
            recent,
        };
    }
}
