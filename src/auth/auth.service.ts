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

type UserWithRefreshToken = Prisma.UserUncheckedUpdateInput & {
  refreshToken?: string;  // Optional or required based on your needs
};

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

    // const token = await this.jwtService.signAsync({
    //   sub: user.id,
    //   email: user.email,
    //   role: user.role,
    // });

    // return { token, user: { email: user.email, role: user.role } };
    return this.issueTokens(user.id, user.email, user.role);

  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    // const token = await this.jwtService.signAsync({
    //   sub: user.id,
    //   email: user.email,
    //   role: user.role,
    // });

    // return { token, user: { email: user.email, role: user.role } };

    return this.issueTokens(user.id, user.email, user.role);

  }

  async issueTokens(id: number, email: string, role: string) {
    const accessToken = await this.jwtService.signAsync(
      { sub: id, email, role },
      { expiresIn: "15m" }
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: id, email },
      { expiresIn: "7d" }
    );

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id },
      data: { refreshToken: hashedRefresh } as UserWithRefreshToken,
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.refreshToken) throw new UnauthorizedException();

      const valid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!valid) throw new UnauthorizedException("Invalid refresh token");

      return this.issueTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

}
