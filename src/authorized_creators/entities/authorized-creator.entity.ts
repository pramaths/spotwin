import {
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
  Column,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
@Entity()
@Unique(['user'])
export class AuthorizedCreator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true , type: 'uuid' })
  userId: string;

  @Column({ unique: true })
  phoneNumber: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
