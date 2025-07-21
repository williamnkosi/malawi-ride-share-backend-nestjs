import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update_user.dto';
import { CreateUserDto } from './dtos/create_user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    try {
      return this.usersService.findAll();
    } catch (e) {}
  }

  @Get(':firebaseId')
  async getUserData(@Param('firebaseId') firebaseId: string) {
    try {
      return this.usersService.findById(firebaseId);
    } catch (e) {}
  }

  @Post()
  async createUserData(@Body() createUserDto: CreateUserDto) {
    try {
      return this.usersService.create(createUserDto);
    } catch (e) {}
  }

  @Patch(':firebaseId')
  async updateUser(
    @Param('firebaseId') firebaseId: string,
    @Body() updateUserDto: Partial<UpdateUserDto>,
  ) {
    // PATCH updates only provided fields
    return this.usersService.update(firebaseId, updateUserDto);
  }

  @Delete()
  async deletUserData(@Query('firebaseId') firebaseId: string) {
    try {
      return this.usersService.remove(firebaseId);
    } catch (e) {}
  }
}
