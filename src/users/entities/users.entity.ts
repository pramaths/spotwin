import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  publicAddress: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  totalBetsPlaced: number;

  @Column({ nullable: true })
  totalBetsWon: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
