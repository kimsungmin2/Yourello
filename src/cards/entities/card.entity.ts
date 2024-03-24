import { Columns } from '../../columns/entities/column.entity';
import { Comment } from '../../comments/entities/comment.entity';
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
import { CardWorker } from './cardworker.entity';
import { CardList } from './cardList.entity';

@Entity({
  name: 'card',
})
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  info: string;

  @Column({ type: 'varchar', nullable: false })
  color: string;

  @Column({ type: 'varchar', nullable: false })
  deadLine: Date;

  @Column({ type: 'varchar', nullable: false })
  cardImage: string;

  @Column({ type: 'int', nullable: false })
  orderNum: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @Column('int', { name: 'columnId', nullable: false })
  columnId: number;

  //   @Column('int', { name: 'userId', nullable: false })
  //   userId: number;

  @ManyToOne(() => Columns, (columns) => columns.card)
  @JoinColumn([{ name: 'columnId', referencedColumnName: 'id' }])
  columns: Columns;

  //   @ManyToOne(() => User, (user) => user.card)
  //   @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  //   user: User;

  @OneToMany((type) => CardList, (cardList) => cardList.card)
  cardList: CardList[];

  @OneToMany((type) => Comment, (comment) => comment.card)
  comment: Comment[];

  @OneToMany((type) => CardWorker, (cardWorker) => cardWorker.card)
  cardWorker: CardWorker[];
}
