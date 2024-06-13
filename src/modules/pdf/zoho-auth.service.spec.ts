import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import * as fs from 'fs';
import { ZohoAuthService } from './zoho-auth.service';

jest.mock('fs'); // Mock file system module
jest.mock('axios'); // Mock axios

describe('ZohoAuthService', () => {
  let zohoAuthService: ZohoAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZohoAuthService],
    }).compile();

    zohoAuthService = module.get<ZohoAuthService>(ZohoAuthService);
  });

  it('should return token from file if valid', async () => {
    const mockTokenData = {
      access_token: 'mock-token',
      expiry: Date.now() + 100000, // Valid for the next 100 seconds
    };

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue(JSON.stringify(mockTokenData));

    const token = await zohoAuthService.getZohoAuthToken();

    expect(token).toBe('mock-token');
  });

  it('should fetch a new token if the existing one is expired', async () => {
    const expiredTokenData = {
      access_token: 'mock-token',
      expiry: Date.now() - 100000, // Expired
    };
    const newTokenData = {
      access_token: 'new-mock-token',
      expires_in: 3600, // 1 hour
    };

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue(JSON.stringify(expiredTokenData));
    jest.spyOn(fs, 'writeFileSync').mockImplementation(jest.fn());
    (axios.post as jest.Mock).mockResolvedValue({ data: newTokenData });

    const token = await zohoAuthService.getZohoAuthToken();

    expect(token).toBe('new-mock-token');
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should throw an error if unable to fetch a new token', async () => {
    const expiredTokenData = {
      access_token: 'mock-token',
      expiry: Date.now() - 100000, // Expired
    };

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue(JSON.stringify(expiredTokenData));
    (axios.post as jest.Mock).mockRejectedValue({
      response: {
        data: 'Failed to fetch token',
      },
    });

    await expect(zohoAuthService.getZohoAuthToken()).rejects.toThrow(
      'Error fetching Zoho OAuth token',
    );
  });

  it('should throw an error if error.response is undefined', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(zohoAuthService.getZohoAuthToken()).rejects.toThrow(
      'Error fetching Zoho OAuth token',
    );
  });
});
