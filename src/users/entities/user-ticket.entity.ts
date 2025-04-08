import { User } from "./users.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";

@Entity('user_tickets')
export class UserTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userTickets)
  user: User;

  @Column({ nullable: false })
  userId: string;

  @CreateDateColumn()
  purchasedAt: Date;
}
