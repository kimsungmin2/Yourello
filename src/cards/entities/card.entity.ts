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

@Entity({
  name: 'card',
})
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  info: string;

  @Column({ type: 'varchar', nullable: false })
  color: string;

  @Column({ type: 'varchar', nullable: false })
  cardImage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @Column('int', { name: 'createUserId', nullable: false })
  createUserId: number;

  @Column('int', { name: ' workerUserId', nullable: false })
  workerUserId: number;

  @Column('int', { name: 'columnId', nullable: false })
  columnId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createUserId', referencedColumnName: 'id' })
  createUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'workerUserId', referencedColumnName: 'id' })
  workerUser: User;

  @ManyToOne(() => Columns, (column) => column.card)
  @JoinColumn([{ name: 'columnId', referencedColumnName: 'id' }])
  column: Columns;

  @OneToMany((type) => Comment, (comment) => comment.card)
  comment: Comment[];
}
