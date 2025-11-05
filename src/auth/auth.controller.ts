import { Body, Controller, Get, Post, Req, Request, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import express from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("register")
  register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  // @Post("login")
  // login(@Body() body: { email: string; password: string }) {
  //   return this.authService.login(body.email, body.password);
  // }

  @Post("login")
  async login(@Body() body, @Res({ passthrough: true }) res: express.Response) {
    const tokens = await this.authService.login(body.email, body.password);
    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken: tokens.accessToken };
  }

  @Post("refresh")
  async refresh(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
    const token = req.cookies?.refresh_token;
    const tokens = await this.authService.refreshTokens(token);
    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken: tokens.accessToken };
  }

  @Post("logout")
  async logout(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
    const token = req.cookies?.refresh_token;
    if (token) {
      const { sub } = await this.authService["jwtService"].verifyAsync(token);
      await this.authService.logout(sub);
    }
    res.clearCookie("refresh_token");
    return { message: "Logged out" };
  }


  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    const { id, email, role } = req.user;
    return { id, email, role };
  }
}
