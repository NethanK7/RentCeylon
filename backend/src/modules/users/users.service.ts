import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: 'RENTER' | 'LISTER';
    tosAccepted: boolean;
    tosAcceptedAt: Date;
  }) {
    return this.prisma.user.create({ data });
  }

  async findPublicProfile(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
        verificationStatus: true,
        createdAt: true,
        badges: true,
        reviewsReceived: {
          where: { isBlinded: false },
          select: { rating: true },
        },
      },
    });
  }
}
