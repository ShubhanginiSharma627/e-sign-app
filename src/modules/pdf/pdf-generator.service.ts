import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class PdfGeneratorService {
  createPdf() {
    const doc = new PDFDocument();
    const outputDir = 'output';

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    doc.pipe(fs.createWriteStream(`${outputDir}/sample.pdf`));

    // Add content to the PDF
    doc.fontSize(20).text('Sample E-sign PDF', 100, 50);

    // Radio buttons - arranged horizontally
    this.addRadioButton(doc, 'Radio Button 1', 100, 100, [
      { label: 'Option 1', x: 240 },
      { label: 'Option 2', x: 360 },
    ]);

    this.addRadioButton(doc, 'Radio Button 2', 100, 150, [
      { label: 'Option 1', x: 240 },
      { label: 'Option 2', x: 360 },
    ]);

    // E-Sign section - arranged horizontally
    this.addEsignSection(doc, 'E-Sign', 100, 200, 170);

    doc.end();
  }

  // Method to add radio buttons
  private addRadioButton(
    doc: PDFKit.PDFDocument,
    title: string,
    titleX: number,
    titleY: number,
    options: { label: string; x: number }[],
  ) {
    doc.fontSize(16).text(title, titleX, titleY);
    options.forEach((option) => {
      doc.circle(option.x, titleY + 8, 10).stroke();
      doc.text(option.label, option.x + 20, titleY); // 20 px space between circle and label
    });
  }

  // Method to add e-sign section
  private addEsignSection(
    doc: PDFKit.PDFDocument,
    title: string,
    titleX: number,
    titleY: number,
    inputX: number,
  ) {
    doc.fontSize(16).text(title, titleX, titleY);
    doc.rect(inputX, titleY - 10, 100, 30).stroke();
  }
}
