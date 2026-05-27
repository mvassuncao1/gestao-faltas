import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { password: _password, ...safeUser } = user as any;
    return safeUser;
  }

  async login(user: { id: number; email: string; name: string; role: string }) {
    const secret = (process.env.JWT_SECRET ?? 'change-me-for-dev') as jwt.Secret;
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = (jwt as any).sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    });

    // generate refresh token and persist
    const refreshSecret = (process.env.JWT_REFRESH_SECRET ?? (process.env.JWT_SECRET ?? 'change-me-for-dev')) as jwt.Secret;
    const refreshToken = (jwt as any).sign({ sub: user.id }, refreshSecret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    });

    await this.usersService.setRefreshToken(user.id, refreshToken as string);

    return {
      accessToken: token,
      refreshToken,
      user,
    };
  }

  async refresh(refreshToken: string) {
    const refreshSecret = (process.env.JWT_REFRESH_SECRET ?? (process.env.JWT_SECRET ?? 'change-me-for-dev')) as jwt.Secret;
    try {
      const decoded: any = (jwt as any).verify(refreshToken, refreshSecret);
      const user = await this.usersService.findById(decoded.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
      const secret = (process.env.JWT_SECRET ?? 'change-me-for-dev') as jwt.Secret;
      const accessToken = (jwt as any).sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN ?? '1h' });

      // optionally rotate refresh token
      const newRefreshToken = (jwt as any).sign({ sub: user.id }, refreshSecret, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d' });
      await this.usersService.setRefreshToken(user.id, newRefreshToken as string);

      return { accessToken, refreshToken: newRefreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    } catch (e) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(userId: number) {
    await this.usersService.clearRefreshToken(userId);
    return { ok: true };
  }
}
