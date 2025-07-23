import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update_user.dto';
import { CreateUserDto } from './dtos/create_user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    return await this.usersService.findAll();
  }

  @Get(':firebaseId')
  @HttpCode(HttpStatus.OK)
  async getUserData(@Param('firebaseId') firebaseId: string) {
    return await this.usersService.findById(firebaseId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createUserData(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.usersService.create(createUserDto, profileImage);
  }

  @Patch(':firebaseId')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('firebaseId') firebaseId: string,
    @Body() updateUserDto: Partial<UpdateUserDto>,
  ) {
    return await this.usersService.update(firebaseId, updateUserDto);
  }

  @Delete(':firebaseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserData(@Param('firebaseId') firebaseId: string) {
    return await this.usersService.remove(firebaseId);
  }
}
