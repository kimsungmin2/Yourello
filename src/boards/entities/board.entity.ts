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
import { BoardMember } from './boardmember.entity';

@Entity({
  name: 'card',
})
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  status: string;

  @Column({ type: 'varchar', nullable: false })
  backgroundcolor: string;

  @Column({ type: 'varchar', nullable: false })
  explanation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany((type) => Columns, (column) => column.board)
  column: Columns[];

  @OneToMany((type) => BoardMember, (boardMember) => boardMember.board)
  boardMember: BoardMember[];
}
