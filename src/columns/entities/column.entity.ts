import { Board } from 'src/boards/entities/board.entity';
import { Card } from 'src/cards/entities/card.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { User } from 'src/users/entities/user.entity';
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

@Entity({
  name: 'column',
})
export class Columns {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @Column('int', { name: 'boardId', nullable: false })
  boardId: number;

  @ManyToOne(() => Board, (board) => board.column)
  @JoinColumn([{ name: 'boardId', referencedColumnName: 'id' }])
  board: Board;

  @OneToMany((type) => Card, (card) => card.column)
  card: Card[];
}
