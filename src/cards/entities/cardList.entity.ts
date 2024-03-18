import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Card } from './card.entity';
import { User } from 'src/users/entities/user.entity';

@Entity({
  name: 'cardList',
})
export class CardList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  cardContent: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  checking: boolean;

  @Column('int', { name: 'cardId', nullable: false })
  cardId: number;

  @ManyToOne(() => Card, (card) => card.cardList)
  @JoinColumn([{ name: 'cardId', referencedColumnName: 'id' }])
  card: Card;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
