import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ---------------------------------------------------------------------------
  // GET /chat/threads — list all booking threads for the authenticated user
  // Declared before parameterised routes to avoid shadowing.
  // ---------------------------------------------------------------------------

  @Get('threads')
  getThreads(@Req() req: any) {
    return this.chatService.getThreads(req.user.id);
  }

  // ---------------------------------------------------------------------------
  // GET /chat/booking/:bookingId — paginated messages for a booking thread
  // ---------------------------------------------------------------------------

  @Get('booking/:bookingId')
  getMessages(
    @Req() req: any,
    @Param('bookingId') bookingId: string,
    @Query('page') page?: string,
  ) {
    return this.chatService.getMessages(
      req.user.id,
      bookingId,
      page ? parseInt(page, 10) : 1,
    );
  }

  // ---------------------------------------------------------------------------
  // POST /chat/booking/:bookingId — send a message in a booking thread
  // ---------------------------------------------------------------------------

  @Post('booking/:bookingId')
  @HttpCode(HttpStatus.CREATED)
  sendMessage(
    @Req() req: any,
    @Param('bookingId') bookingId: string,
    @Body('content') content: string,
  ) {
    return this.chatService.sendMessage(req.user.id, bookingId, content);
  }

  // ---------------------------------------------------------------------------
  // DELETE /chat/:messageId — soft-delete a message (Rule 7)
  // Only hides the message (isDeleted=true). Record is NEVER removed from DB.
  // ---------------------------------------------------------------------------

  @Delete(':messageId')
  @HttpCode(HttpStatus.OK)
  softDeleteMessage(@Req() req: any, @Param('messageId') messageId: string) {
    return this.chatService.softDeleteMessage(req.user.id, messageId);
  }
}
