import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { UserService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  private readonly expo = new Expo();
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly userService: UserService) {}

  /**
   * Sends notifications to users based on their Expo push tokens
   */
  async sendNotifications(
    title: string, 
    body: string, 
  ): Promise<void> {
    try {
      const users = await this.userService.findAll();

      const validTokens = users
        .filter(user => user && Expo.isExpoPushToken(user.expoPushToken))
        .map(user => ({
          userId: user.id,
          token: user.expoPushToken
        }));

      if (validTokens.length === 0) {
        this.logger.log('No valid push tokens found');
        return;
      }

      // Create notification messages
      const messages: ExpoPushMessage[] = validTokens.map(({ token }) => ({
        to: token,
        title,
        body,
      }));

      const chunks = this.expo.chunkPushNotifications(messages);
      
      // Send notifications
      const tickets: ExpoPushTicket[] = [];
      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          this.logger.error('Error sending notifications', error);
        }
      }
      
      this.logger.log(`Successfully sent ${tickets.length} notifications`);
    } catch (error) {
      this.logger.error('Failed to send notifications', error);
    }
  }

  /**
   * Send notification about new contest creation
   */
  async sendNewContestNotification(
    contestId: string, 
    contestName: string, 
    matchName: string
  ): Promise<void> {
    // For new contests, we would typically notify all users
    // You may adjust this to target specific user groups
    const users = await this.userService.findAll();
    const userIds = users.map(user => user.id);
    
    await this.sendNotifications(
      'New Contest Available!',
      `${contestName} for ${matchName} is now available to join!`,
    );
  }

  
  async sendLeaderboardNotification(
    contestId: string,
    contestName: string,
    userIds: string[]
  ): Promise<void> {
    await this.sendNotifications(
      'Leaderboard Released!',
      `The leaderboard for ${contestName} is now available!`,
    );
  }

  /**
   * Send notification to contest participants about contest completion
   */
  async sendContestCompletedNotification(
    contestId: string,
    contestName: string,
    userIds: string[]
  ): Promise<void> {
    await this.sendNotifications(
      'Contest Completed!',
      `${contestName} has concluded. Check the results!`,
    );
  }
} 