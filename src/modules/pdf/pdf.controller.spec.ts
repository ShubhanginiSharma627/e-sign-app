import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios'; // Import axios for mocking
import * as fs from 'fs';
import * as path from 'path';
import { PdfGeneratorService } from './pdf-generator.service';
import { PdfController } from './pdf.controller';
import { ZohoAuthService } from './zoho-auth.service';

// Mock the fs, path and axios modules
jest.mock('fs');
jest.mock('path', () => ({
  resolve: jest.fn(),
}));
jest.mock('axios');

describe('PdfController', () => {
  let pdfController: PdfController;
  let pdfGeneratorService: PdfGeneratorService;
  let zohoAuthService: ZohoAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfController],
      providers: [
        {
          provide: PdfGeneratorService,
          useValue: {
            createPdf: jest.fn(),
          },
        },
        {
          provide: ZohoAuthService,
          useValue: {
            getZohoAuthToken: jest.fn().mockResolvedValue('mock-token'),
          },
        },
      ],
    }).compile();

    pdfController = module.get<PdfController>(PdfController);
    pdfGeneratorService = module.get<PdfGeneratorService>(PdfGeneratorService);
    zohoAuthService = module.get<ZohoAuthService>(ZohoAuthService);
  });

  it('should call createPdf on pdfGeneratorService and send file', () => {
    const res = { sendFile: jest.fn() } as any;

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (path.resolve as jest.Mock).mockReturnValue('output/sample.pdf');

    pdfController.createPdf(res);

    expect(pdfGeneratorService.createPdf).toHaveBeenCalled();
    expect(res.sendFile).toHaveBeenCalledWith('output/sample.pdf');
  });

  it('should throw an exception if PDF file does not exist', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    await expect(pdfController.uploadPdf('test@example.com')).rejects.toThrow(
      new HttpException('PDF file not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should upload PDF and handle response', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (path.resolve as jest.Mock).mockReturnValue('output/sample.pdf');

    const uploadToZoho = jest
      .spyOn(pdfController as any, 'uploadToZoho')
      .mockResolvedValue({
        data: {
          requests: {
            request_id: 'mock-request-id',
            document_ids: [{ document_id: 'mock-document-id' }],
            actions: [{ action_type: 'SIGN', action_id: 'mock-action-id' }],
          },
        },
      });

    const submitZohoRequest = jest
      .spyOn(pdfController as any, 'submitZohoRequest')
      .mockResolvedValue({
        data: { status: 'success' },
      });

    const response = await pdfController.uploadPdf('test@example.com');

    expect(uploadToZoho).toHaveBeenCalled();
    expect(submitZohoRequest).toHaveBeenCalledWith(
      'mock-request-id',
      'mock-document-id',
      'mock-action-id',
      'mock-token',
    );

    expect(response).toEqual({
      initialResponse: {
        requests: {
          request_id: 'mock-request-id',
          document_ids: [{ document_id: 'mock-document-id' }],
          actions: [{ action_type: 'SIGN', action_id: 'mock-action-id' }],
        },
      },
      submitResponse: { status: 'success' },
    });
  });

  it('should handle missing action ID', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (path.resolve as jest.Mock).mockReturnValue('output/sample.pdf');

    const uploadToZoho = jest
      .spyOn(pdfController as any, 'uploadToZoho')
      .mockResolvedValue({
        data: {
          requests: {
            request_id: 'mock-request-id',
            document_ids: [{ document_id: 'mock-document-id' }],
            actions: [], // No SIGN action
          },
        },
      });

    await expect(pdfController.uploadPdf('test@example.com')).rejects.toThrow(
      new HttpException(
        'Error uploading PDF to Zoho',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
    );
  });

  it('should handle Zoho API error', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (path.resolve as jest.Mock).mockReturnValue('output/sample.pdf');

    jest
      .spyOn(pdfController as any, 'uploadToZoho')
      .mockRejectedValue(new Error('Zoho API Error'));

    await expect(pdfController.uploadPdf('test@example.com')).rejects.toThrow(
      new HttpException(
        'Error uploading PDF to Zoho',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
    );
  });

  it('should handle Zoho API error with response data', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (path.resolve as jest.Mock).mockReturnValue('output/sample.pdf');

    jest.spyOn(pdfController as any, 'uploadToZoho').mockRejectedValue({
      response: {
        data: 'Mock API error response',
      },
    });

    await expect(pdfController.uploadPdf('test@example.com')).rejects.toThrow(
      new HttpException(
        'Error uploading PDF to Zoho',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
    );
  });

  it('should log and throw error in uploadToZoho method', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (path.resolve as jest.Mock).mockReturnValue('output/sample.pdf');

    const logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.spyOn(axios, 'post').mockRejectedValue({
      response: {
        data: 'API error response',
      },
    });

    await expect(pdfController.uploadPdf('test@example.com')).rejects.toThrow(
      new Error('Error uploading PDF to Zoho'),
    );
  });

  it('should log and throw error in submitZohoRequest method', async () => {
    const logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.spyOn(axios, 'post').mockRejectedValue({
      response: {
        data: 'API error response',
      },
    });

    const submitZohoRequest = jest
      .spyOn(pdfController as any, 'submitZohoRequest')
      .mockImplementation(async () => {
        throw new Error('Error uploading PDF to Zoho');
      });
  });

  it('should return success message from test endpoint', () => {
    const response = pdfController.testEndpoint();
    expect(response).toEqual({ message: 'PDF service is up and running!' });
  });
});
