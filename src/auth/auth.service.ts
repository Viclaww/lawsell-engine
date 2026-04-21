import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.db.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));
    if (existing.length > 0) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const [user] = await this.db.db
      .insert(users)
      .values({
        email: dto.email,
        password: hashed,
        role: (dto.role as any) || 'VENDOR',
      })
      .returning();

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }

  async login(dto: LoginDto) {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }
}
