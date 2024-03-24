import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../types/userRole.type';
import { Comment } from '../../comments/entities/comment.entity';
import { BoardMember } from '../../boards/entities/boardmember.entity';
import { CardWorker } from '../../cards/entities/cardworker.entity';

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

  @OneToMany((type) => CardWorker, (cardWorker) => cardWorker.user)
  cardWorker: CardWorker[];

  @OneToMany((type) => CardWorker, (worker) => worker.workerId)
  worker: CardWorker[];

  @OneToMany((type) => BoardMember, (boardMember) => boardMember.user)
  boardMember: BoardMember[];
}
