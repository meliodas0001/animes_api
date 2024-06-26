import { ORMTransactionInstance } from '@domains/database/ORM';
import { IUserRepository } from '@domains/database/repositories/UserRepository/IUserRepository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { ILogin } from '@domains/requests/auth/login';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private jwtService: JwtService,
  ) {}

  async login(
    userLogin: ILogin,
    transaction: ORMTransactionInstance,
  ): Promise<any> {
    const { email, password } = userLogin;

    const findUser = await this.userRepository.findByEmail(email, transaction);

    if (!findUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { username, id, roles } = findUser;

    const isMatch = await bcrypt.compare(password, findUser.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email, username, roles, id };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });

    return {
      access_token,
    };
  }
}
