import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    return this.db.db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users);
  }

  async findOne(id: string) {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.id, id));
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user;
    return rest;
  }

  async findByEmail(email: string) {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const [user] = await this.db.db
      .update(users)
      .set(dto as any)
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user;
    return rest;
  }

  async remove(id: string) {
    await this.db.db.delete(users).where(eq(users.id, id));
    return { message: 'User deleted' };
  }
}
