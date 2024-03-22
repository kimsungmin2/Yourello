import { Columns } from 'src/columns/entities/column.entity';
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
import { Board } from './board.entity';
import { CardWorker } from 'src/cards/entities/cardworker.entity';

@Entity({
  name: 'boardMember',
})
export class BoardMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'userId', nullable: false })
  userId: number;

  @Column('int', { name: 'boardId', nullable: false })
  boardId: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  owner: boolean;

  @Column( 'varchar', { name: 'token',  nullable: true})
  token: string;

  @Column({ type: 'boolean', nullable: false, default: false})
  memberStatus: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.boardMember)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Board, (board) => board.boardMember)
  @JoinColumn({ name: 'boardId', referencedColumnName: 'id' })
  board: Board;

  //   @OneToMany((type) => CardWorker, (cardWorker) => cardWorker.boardMember)
  //   cardWorker: CardWorker[];
}
