import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByRefreshToken(token: string) {
    return this.prisma.user.findFirst({ where: { refreshToken: token } });
  }

  async setRefreshToken(userId: number, token: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { refreshToken: token } });
  }

  async clearRefreshToken(userId: number) {
    return this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
  }

  async create(data: { email: string; password: string; name: string; role?: string }) {
    return this.prisma.user.create({ data: { ...data, role: data.role ?? 'user' } });
  }
}
