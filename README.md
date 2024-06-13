# Zoho ESign PDF Generator

This project is a web application that allows users to generate a PDF, preview it, and upload it to Zoho for e-signing. The application provides a simple user interface to create and manage PDFs, and integrates with Zoho Sign for document signing.

## Table of Contents

- [Zoho ESign PDF Generator](#zoho-esign-pdf-generator)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API Endpoints](#api-endpoints)
  - [Environment Variables](#environment-variables)
  - [Testing](#testing)
  - [Technologies Used](#technologies-used)
  - [Contributing](#contributing)

## Features

- Generate a PDF and preview it within the browser.
- Enter recipient's email and upload the PDF to Zoho for e-signing.
- Reset the interface to create a new PDF.
- Responsive design for desktop and mobile views.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/zoho-esign-pdf-generator.git
   cd zoho-esign-pdf-generator
   ```

2. **Install Dependencies:**

   Ensure you have [Node.js](https://nodejs.org/) installed, then run:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**

   Create a `.env` file in the root directory and add the following variables:

   ```bash
   ZOHO_CLIENT_ID=your_zoho_client_id
   ZOHO_CLIENT_SECRET=your_zoho_client_secret
   ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
   ```

4. **Run the Application:**

   Start the application using:

   ```bash
   npm run start
   ```

5. **Open the Application:**

   Navigate to `http://localhost:3000` in your web browser to access the application.

## Usage

1. **Generate a PDF:**

   Click on the "Generate PDF" button. The application will create a PDF and display a preview.

2. **Upload to Zoho:**

   Enter the recipient's email and click on the "Upload to Zoho" button. A message will confirm the successful upload.

3. **Reset for New PDF:**

   Click the "Create New PDF" button to reset the interface and generate another PDF.

## API Endpoints

- **Generate PDF:** `POST /pdf/create`
- **Upload PDF:** `POST /pdf/upload`

These endpoints are implemented in the backend using NestJS and can be tested using tools like Postman or cURL.

## Environment Variables

The application uses the following environment variables to configure the Zoho API integration:

- **`ZOHO_CLIENT_ID`**: Your Zoho API client ID.
- **`ZOHO_CLIENT_SECRET`**: Your Zoho API client secret.
- **`ZOHO_REFRESH_TOKEN`**: Your Zoho refresh token.

Ensure these values are set correctly in your `.env` file.

## Testing

1. **Run Unit Tests:**

   ```bash
   npm run test
   ```

2. **Run End-to-End Tests:**

   ```bash
   npm run test:e2e
   ```

3. **Run Tests with Coverage:**

   ```bash
   npm run test:cov
   ```

Test files are located in the `test` directory. Coverage reports can be found in the `coverage` directory.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** NestJS, Express
- **PDF Generation:** PDFKit
- **API Integration:** Zoho Sign API
- **Testing:** Jest, Supertest

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.
