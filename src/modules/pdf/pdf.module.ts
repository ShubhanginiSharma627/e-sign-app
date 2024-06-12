import { Module } from '@nestjs/common';
import { PdfGeneratorService } from './pdf-generator.service';
import { PdfController } from './pdf.controller';
import { ZohoAuthService } from './zoho-auth.service';

@Module({
  imports: [],
  controllers: [PdfController],
  providers: [PdfGeneratorService, ZohoAuthService],
})
export class PdfModule {}
