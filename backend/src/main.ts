import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser = require('cookie-parser');
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);

  const prisma = app.get(PrismaService);
  const adminEmail = 'admin@loja.com';
  const adminPassword = 'Admin123';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: passwordHash,
        name: 'Administrador',
        role: 'admin',
      },
    });
    console.log(`Admin seeded: ${adminEmail} / ${adminPassword}`);
  }
}

bootstrap();
