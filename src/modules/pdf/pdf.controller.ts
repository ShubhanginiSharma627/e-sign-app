import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PdfGeneratorService } from './pdf-generator.service';
import { ZohoAuthService } from './zoho-auth.service';

@Controller('pdf')
export class PdfController {
  constructor(
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly zohoAuthService: ZohoAuthService,
  ) {}

  @Get('test')
  testEndpoint() {
    return { message: 'PDF service is up and running!' };
  }

  @Post('create')
  createPdf(@Res() res: Response) {
    this.pdfGeneratorService.createPdf();
    const filePath = path.resolve('output/sample.pdf');
    res.sendFile(filePath);
  }

  @Post('upload')
  async uploadPdf(@Body('email') email: string) {
    const filePath = 'output/sample.pdf';
    if (!fs.existsSync(filePath)) {
      throw new HttpException('PDF file not found', HttpStatus.NOT_FOUND);
    }

    const token = await this.zohoAuthService.getZohoAuthToken();

    const response = await this.uploadToZoho(filePath, token, email);
    return response.data;
  }

  private async uploadToZoho(filePath: string, token: string, email: string) {
    const axios = require('axios');
    const FormData = require('form-data');
    const fs = require('fs');

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append(
      'data',
      JSON.stringify({
        requests: {
          request_name: 'Sample E-sign',
          description: 'E-signature document',
          is_sequential: true,
          actions: [
            {
              action_type: 'SIGN',
              recipient_email: email,
              recipient_name: 'John Doe',
              signing_order: 0,
              verify_recipient: true,
              verification_type: 'EMAIL',
              private_notes: 'Please sign',
            },
          ],
          expiration_days: 10,
          email_reminders: true,
          reminder_period: 2,
          notes: 'General notes',
        },
      }),
    );

    const response = await axios.post(
      'https://sign.zoho.com/api/v1/requests',
      form,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          ...form.getHeaders(),
        },
      },
    );

    return response;
  }
}
