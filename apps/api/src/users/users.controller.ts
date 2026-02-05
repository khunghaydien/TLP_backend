import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '@app/users';
import { JwtAuthGuard, RequestUser } from '@app/common';
import { UserEntity } from '@app/database';

/** Trả về user không có password */
function toUserResponse(user: UserEntity) {
  const { password: _, ...rest } = user;
  return rest;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list() {
    const users = await this.usersService.findAll();
    return users.map(toUserResponse);
  }

  /** Thông tin bản thân (user đang đăng nhập) */
  @Get('me')
  async me(@Req() req: Request & { user: RequestUser }) {
    const user = await this.usersService.findOne(req.user.id);
    return toUserResponse(user);
  }

  @Get(':id')
  async getDetail(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return toUserResponse(user);
  }

  /** Chỉ được xóa chính mình (req.user.id === id) */
  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @Req() req: Request & { user: RequestUser },
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }
    await this.usersService.remove(id);
    return { message: 'Deleted' };
  }
}
