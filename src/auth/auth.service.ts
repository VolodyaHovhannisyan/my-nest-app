import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma, Role } from "@prisma/client";


// type Role = "USER" | "ADMIN";
interface User {
  id: number;
  email: string;
  password: string;
  role: Role
}

@Injectable()
export class AuthService {
  // private users: User[] = [];
  // private idCounter = 1;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) { }

  async register(email: string, password: string, role: Role = "USER") {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new UnauthorizedException("User already exists");

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { email, password: hashed, role },
    });

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { token, user: { email: user.email, role: user.role } };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { token, user: { email: user.email, role: user.role } };
  }
}
