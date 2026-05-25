import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ---------------------------------------------------------------------------
  // GET /notifications/unread-count — get unread notification count
  // Declared before :id routes to avoid "unread-count" being parsed as an ID.
  // ---------------------------------------------------------------------------

  @Get('unread-count')
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  // ---------------------------------------------------------------------------
  // PATCH /notifications/read-all — mark all notifications as read
  // Declared before :id routes to avoid "read-all" being parsed as an ID.
  // ---------------------------------------------------------------------------

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  // ---------------------------------------------------------------------------
  // GET /notifications — get paginated notifications for the authenticated user
  // ---------------------------------------------------------------------------

  @Get()
  getUserNotifications(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getUserNotifications(
      req.user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  // ---------------------------------------------------------------------------
  // PATCH /notifications/:id/read — mark a single notification as read
  // ---------------------------------------------------------------------------

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }
}
