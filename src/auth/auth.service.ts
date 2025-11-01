import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

interface User {
  id: number;
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  private users: User[] = [];
  private idCounter = 1;

  constructor(private jwtService: JwtService) {}

  async register(email: string, password: string) {
    const existing = this.users.find((u) => u.email === email);
    if (existing) throw new UnauthorizedException("User already exists");

    const hashed = await bcrypt.hash(password, 10);
    const user = { id: this.idCounter++, email, password: hashed };
    this.users.push(user);

    const token = await this.jwtService.signAsync({ sub: user.id, email });
    return { token, user: { email: user.email } };
  }

  async login(email: string, password: string) {
    const user = this.users.find((u) => u.email === email);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    const token = await this.jwtService.signAsync({ sub: user.id, email });
    return { token, user: { email: user.email } };
  }
}
