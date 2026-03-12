import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorDto } from 'src/common/dto/error.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in', description: 'Returns a JWT access token.' })
  @ApiResponse({ status: 200, description: 'Success', type: () => AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials', type: ErrorDto })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register', description: 'Create a new user and return a JWT access token.' })
  @ApiResponse({ status: 201, description: 'User created', type: () => AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Username already exists', type: ErrorDto })
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto.username, signUpDto.password);
  }
}
