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

    try {
      const initialResponse = await this.uploadToZoho(filePath, token, email);
      const requestId = initialResponse.data.requests.request_id;
      const documentId =
        initialResponse.data.requests.document_ids[0].document_id;

      // Extract the action_id for SIGN action
      const signAction = initialResponse.data.requests.actions.find(
        (action) => action.action_type === 'SIGN',
      );
      const actionId = signAction ? signAction.action_id : null;

      if (!actionId) {
        throw new HttpException(
          'Action ID for SIGN not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const submitResponse = await this.submitZohoRequest(
        requestId,
        documentId,
        actionId,
        token,
      );

      return {
        initialResponse: initialResponse.data,
        submitResponse: submitResponse.data,
      };
    } catch (error) {
      throw new HttpException(
        'Error uploading PDF to Zoho',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

    // Include form headers to ensure multipart/form-data is properly handled
    const formHeaders = form.getHeaders();

    // Define headers with Authorization
    const headers = {
      ...formHeaders,
      Authorization: `Zoho-oauthtoken ${token}`,
    };

    try {
      // Make the API call with axios
      const response = await axios.post(
        'https://sign.zoho.in/api/v1/requests',
        form,
        {
          headers,
        },
      );

      return response;
    } catch (error) {
      // Log error details for debugging
      console.error(
        'Error in uploadToZoho:',
        error.response?.data || error.message,
      );
      throw new Error('Error uploading PDF to Zoho');
    }
  }

  private async submitZohoRequest(
    requestId: string,
    documentId: string,
    actionId: string,
    token: string,
  ) {
    const axios = require('axios');

    // Construct the payload with Signature and Radiogroup fields
    const payload = {
      requests: {
        actions: [
          {
            action_id: actionId,
            action_type: 'SIGN',
            fields: [
              {
                field_type_name: 'Radiogroup',
                field_name: 'Radio Button 1',
                field_label: 'Radio Button 1',
                document_id: documentId,
                action_id: actionId,
                is_mandatory: true,
                page_no: 0,
                default_value: 'Option 1',
                sub_fields: [
                  {
                    sub_field_name: 'Option 1',
                    page_no: 0,
                    x_value: 240,
                    y_value: 108,
                    width: 20,
                    height: 30,
                    x_coord: 240,
                    y_coord: 108,
                    abs_width: 50,
                    abs_height: 50,
                    document_id: documentId,
                  },
                  {
                    sub_field_name: 'Option 2',
                    page_no: 0,
                    x_value: 360,
                    y_value: 108,
                    width: 20,
                    height: 30,
                    x_coord: 360,
                    y_coord: 108,
                    abs_width: 50,
                    abs_height: 50,
                    document_id: documentId,
                  },
                ],
              },
              {
                field_type_name: 'Radiogroup',
                field_name: 'Radio Button 2',
                field_label: 'Radio Button 2',
                document_id: documentId,
                action_id: actionId,
                is_mandatory: true,
                page_no: 0,
                default_value: 'Option 1',
                sub_fields: [
                  {
                    sub_field_name: 'Option 1',
                    page_no: 0,
                    x_value: 240,
                    y_value: 108,
                    width: 20,
                    height: 30,
                    x_coord: 240,
                    y_coord: 108,
                    abs_width: 50,
                    abs_height: 50,
                    document_id: documentId,
                  },
                  {
                    sub_field_name: 'Option 2',
                    page_no: 0,
                    x_value: 360,
                    y_value: 108,
                    width: 20,
                    height: 30,
                    x_coord: 360,
                    y_coord: 108,
                    abs_width: 50,
                    abs_height: 50,
                    document_id: documentId,
                  },
                ],
              },
              {
                field_type_name: 'Signature',
                field_name: 'E-Sign',
                field_label: 'E-Sign',
                document_id: documentId,
                action_id: actionId,
                is_mandatory: true,
                page_no: 0,
                x_value: 28,
                y_value: 24,
                width: 16,
                height: 4,
                x_coord: 28,
                y_coord: 24,
                abs_width: 100,
                abs_height: 30,
                field_category: 'image',
              },
            ],
          },
        ],
      },
    };

    try {
      // Log payload for debugging
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `https://sign.zoho.in/api/v1/requests/${requestId}/submit`,
        new URLSearchParams({ data: JSON.stringify(payload) }).toString(),
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response;
    } catch (error) {
      // Log detailed error information for debugging
      console.error('Error in submitZohoRequest:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw new Error('Error submitting Zoho request');
    }
  }
}
