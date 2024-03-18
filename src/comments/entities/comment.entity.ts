import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../users/types/userRole.type';
import { User } from 'src/users/entities/user.entity';
import { Card } from 'src/cards/entities/card.entity';

@Entity({
  name: 'comment',
})
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'userId', nullable: false })
  userId: number;

  @Column('int', { name: 'cardId', nullable: false })
  cardId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => Card, (card) => card.comment)
  @JoinColumn([{ name: 'cardId', referencedColumnName: 'id' }])
  card: Card;

  @ManyToOne(() => User, (user) => user.comment)
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: User;
}
