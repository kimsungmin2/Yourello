import { Board } from 'src/boards/entities/board.entity';
import { Card } from 'src/cards/entities/card.entity';
// import { Comment } from 'src/comments/entities/comment.entity';
// import { User } from 'src/users/entities/user.entity';
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
  name: 'columns',
})
export class Columns {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ default: 0 })
  order: number;

  @Column('int', { name: 'boardId', nullable: false })
  boardId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => Board, (board) => board.column)
  @JoinColumn([{ name: 'boardId', referencedColumnName: 'id' }])
  board: Board;

  @OneToMany((type) => Card, (card) => card.column)
  card: Card[];
}
