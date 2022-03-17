import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private users: User[] = [];
  private totals: number = 0;

  create(user: CreateUserDto): User {
    // User here is the return type
    this.totals = this.totals + 1;
    const id = this.totals;
    this.users.push({ id, ...user });
    return { id, ...user };
  }

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    const foundUser = this.users.filter((u) => u.id == id)[0];
    if (foundUser)
      return `Found user id: ${id}, name: ${foundUser.name}, userType: ${foundUser.userType}`;
    else return 'User not found';
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    this.users = this.users.filter((u) => {
      return u.id !== id;
    });

    return `Removed user with id ${id}`;
  }
}
