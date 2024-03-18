import { BoardMember } from 'src/boards/entities/boardmember.entity';
import { Columns } from 'src/columns/entities/column.entity';
import { Comment } from 'src/comments/entities/comment.entity';
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
  name: 'cardWorker',
})
export class CardWorker {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @Column('int', { name: 'ownerId', nullable: false })
  ownerId: number;

  @Column('int', { name: 'cardId', nullable: false })
  cardId: number;

  @ManyToOne(() => Card, (card) => card.cardWorker)
  @JoinColumn([{ name: 'cardId', referencedColumnName: 'id' }])
  card: Card;

  @ManyToOne(() => User, (user) => user.cardWorker)
  @JoinColumn([{ name: 'ownerId', referencedColumnName: 'id' }])
  user: User;

  @Column({ type: 'int', nullable: false })
  worker: number;
}
