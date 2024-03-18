import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../types/userRole.type';
import { Comment } from 'src/comments/entities/comment.entity';
import { Card } from 'src/cards/entities/card.entity';
import { Board } from 'src/boards/entities/board.entity';
import { BoardMember } from 'src/boards/entities/boardmember.entity';

@Index('email', ['email'], { unique: true })
@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', select: false, nullable: false })
  password: string;

  @Column({ type: 'varchar', select: true, nullable: false })
  name: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @Column({ type: 'varchar', select: true, nullable: false })
  introduce: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany((type) => Comment, (comment) => comment.user)
  comment: Comment[];

  @OneToMany((type) => Card, (card) => card.createUser)
  createCards: Card[];

  @OneToMany((type) => Card, (card) => card.workerUser)
  workerCards: Card[];

  @OneToMany((type) => Board, (board) => board.createUser)
  createBoards: Board[];

  @OneToMany((type) => Board, (board) => board.workerUser)
  workerBoards: Board[];

  @OneToMany((type) => BoardMember, (boardMember) => boardMember.user)
  boardMember: BoardMember[];
}
