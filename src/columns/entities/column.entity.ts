import { Board } from '../../boards/entities/board.entity';
import { Card } from '../../cards/entities/card.entity';
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

  @OneToMany((type) => Card, (card) => card.columns)
  card: Card[];
}
