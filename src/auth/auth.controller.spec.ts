import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signIn: jest.fn(),
    signUp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should call authService.signIn with username and password', async () => {
      mockAuthService.signIn.mockResolvedValue({ access_token: 'jwt' });
      const dto = { username: 'u', password: 'p' };

      await controller.signIn(dto);

      expect(mockAuthService.signIn).toHaveBeenCalledWith('u', 'p');
    });

    it('should return the result from authService.signIn', async () => {
      const token = { access_token: 'abc123' };
      mockAuthService.signIn.mockResolvedValue(token);

      const result = await controller.signIn({
        username: 'u',
        password: 'p',
      });

      expect(result).toEqual(token);
    });
  });

  describe('signUp', () => {
    it('should call authService.signUp with username and password', async () => {
      mockAuthService.signUp.mockResolvedValue({ access_token: 'jwt' });
      const dto = { username: 'newuser', password: 'secret' };

      await controller.signUp(dto);

      expect(mockAuthService.signUp).toHaveBeenCalledWith('newuser', 'secret');
    });

    it('should return the result from authService.signUp', async () => {
      const token = { access_token: 'xyz' };
      mockAuthService.signUp.mockResolvedValue(token);

      const result = await controller.signUp({
        username: 'newuser',
        password: 'secret',
      });

      expect(result).toEqual(token);
    });
  });
});
