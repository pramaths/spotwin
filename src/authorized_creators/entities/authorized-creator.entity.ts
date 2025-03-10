import {
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
  Column,
} from 'typeorm';

@Entity()
@Unique(['user'])
export class AuthorizedCreator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 44, unique: true })
  user: string;

  @CreateDateColumn()
  createdAt: Date;
}
