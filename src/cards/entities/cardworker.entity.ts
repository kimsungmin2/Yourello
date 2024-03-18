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

  @Column('int', { name: 'boardMemberId', nullable: false })
  boardMemberId: number;

  @Column('int', { name: 'cardId', nullable: false })
  cardId: number;

  @ManyToOne(() => Card, (card) => card.cardWorker)
  @JoinColumn([{ name: 'columnId', referencedColumnName: 'id' }])
  card: Card;

  @ManyToOne(() => BoardMember, (boardMember) => boardMember.cardWorker)
  @JoinColumn([{ name: 'boardMemberId', referencedColumnName: 'id' }])
  boardMember: BoardMember;
}
