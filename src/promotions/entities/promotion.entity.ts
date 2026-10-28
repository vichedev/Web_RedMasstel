import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ProductBrand } from '../../products/entities/product.entity';

export enum PromotionLayout {
    CINEMATIC = 'CINEMATIC',
    BILLBOARD = 'BILLBOARD',
    SPOTLIGHT = 'SPOTLIGHT',
}

@Entity('promotions')
export class Promotion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column()
    imageUrl: string;

    @Column({ nullable: true })
    ctaText: string;

    @Column({ nullable: true })
    ctaLink: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 0 })
    displayOrder: number;

    @Column({
        type: 'enum',
        enum: PromotionLayout,
        default: PromotionLayout.CINEMATIC,
    })
    layout: PromotionLayout;

    @Column({ type: 'timestamp', nullable: true })
    startDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    endDate: Date;

    /**
     * Microsite al que pertenece la promoción. `null` = aplica a los
     * 3 microsites; valor concreto = sólo en ese microsite.
     */
    @Column({
        type: 'enum',
        enum: ProductBrand,
        nullable: true,
    })
    brand: ProductBrand | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
