import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FeaturedVideo } from '../../videos/entities/featured-video.entity';
import { OutcomeType } from '../../common/enums/outcome-type.enum';
import { UserContest } from '../../user-contests/entities/user-contest.entity';

@Entity('bets')
export class Bet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserContest, (userContest) => userContest.bets)
  @JoinColumn({ name: 'userContestId' })
  userContest: UserContest;

  @Column()
  userContestId: string;

  @ManyToOne(() => FeaturedVideo)
  @JoinColumn({ name: 'videoId' })
  video: FeaturedVideo;

  @Column()
  videoId: string;

  @Column({ type: 'enum', enum: OutcomeType })
  prediction: OutcomeType;

  @Column({ type: 'boolean', nullable: true })
  isCorrect: boolean;

  @Column({ type: 'int', default: 0 })
  position: number; // Position 1-9 in the bet slip

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
