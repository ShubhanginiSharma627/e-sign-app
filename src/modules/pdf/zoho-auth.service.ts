import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ZohoAuthService {
  private tokenFilePath = path.resolve(__dirname, 'zoho-token.json');

  async getZohoAuthToken(): Promise<string> {
    // Check if token file exists and token is valid
    if (fs.existsSync(this.tokenFilePath)) {
      const tokenData = JSON.parse(
        fs.readFileSync(this.tokenFilePath, 'utf-8'),
      );
      if (tokenData.expiry > Date.now()) {
        return tokenData.access_token;
      }
    }

    const url = 'https://accounts.zoho.in/oauth/v2/token';
    const params = new URLSearchParams();
    params.append('refresh_token', process.env.ZOHO_REFRESH_TOKEN || '');
    params.append('client_id', process.env.ZOHO_CLIENT_ID || '');
    params.append('client_secret', process.env.ZOHO_CLIENT_SECRET || '');
    params.append('redirect_uri', 'https://sign.zoho.com');
    params.append('grant_type', 'refresh_token');

    try {
      const response = await axios.post(url, params);
      if (response.data && response.data.access_token) {
        // Save the new token and its expiry time
        const tokenData = {
          access_token: response.data.access_token,
          expiry: Date.now() + response.data.expires_in * 1000 - 60000, // Save with a buffer of 1 minute
        };
        fs.writeFileSync(this.tokenFilePath, JSON.stringify(tokenData));
        return response.data.access_token;
      } else {
        throw new Error('Failed to retrieve access token');
      }
    } catch (error) {
      console.error(
        'Error fetching Zoho OAuth token:',
        error.response?.data || error.message,
      );
      throw new Error('Error fetching Zoho OAuth token');
    }
  }
}
