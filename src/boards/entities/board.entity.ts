import { Card } from 'src/cards/entities/card.entity';
import { Columns } from 'src/columns/entities/column.entity';
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
import { BoardMember } from './boardmember.entity';

@Entity({
  name: 'card',
})
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  status: string;

  @Column('int', { name: 'createUserId', nullable: false })
  createUserId: number;

  @Column('int', { name: ' workerUserId', nullable: false })
  workerUserId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @Column('int', { name: 'boardId', nullable: false })
  boardId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createUserId', referencedColumnName: 'id' })
  createUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'workerUserId', referencedColumnName: 'id' })
  workerUser: User;

  @OneToMany((type) => Columns, (column) => column.board)
  column: Columns[];
  @OneToMany((type) => BoardMember, (boardMember) => boardMember.board)
  boardMember: BoardMember[];
}
