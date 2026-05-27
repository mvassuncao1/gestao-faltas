import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Request, Response } from 'express';
import { Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    const result = await this.authService.login(user);

    // set refresh token in HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    const { refreshToken, password, ...safeUser } = (result.user as any) || {};
    return { accessToken: result.accessToken, user: safeUser };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const auth = req.headers.authorization;
    let token: string | undefined = undefined;
    if (auth && auth.startsWith('Bearer ')) {
      token = auth.split(' ')[1];
    }

    try {
      const jwt = await import('jsonwebtoken');
      const secret = process.env.JWT_SECRET ?? 'change-me-for-dev';

      let user: any = null;
      if (token) {
        const decoded: any = (jwt as any).verify(token, secret as any);
        user = await this.usersService.findById(decoded.sub);
      }

      // fallback: if no access token or user not found, try refresh cookie
      if (!user && req.cookies?.refreshToken) {
        const refreshSecret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'change-me-for-dev';
        const decodedRef: any = (jwt as any).verify(req.cookies.refreshToken, refreshSecret as any);
        user = await this.usersService.findById(decodedRef.sub);
      }

      if (!user) return { user: null };
      const { password, refreshToken, ...safe } = user as any;
      return { user: safe };
    } catch (e) {
      return { user: null };
    }
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    const result = await this.authService.refresh(refreshToken);

    // set rotated refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const jwt = await import('jsonwebtoken');
        const refreshSecret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'change-me-for-dev';
        const decoded: any = (jwt as any).verify(refreshToken, refreshSecret as any);
        await this.authService.logout(decoded.sub);
      } catch (e) {
        // ignore
      }
    }

    res.clearCookie('refreshToken', { path: '/' });
    return { ok: true };
  }
}
