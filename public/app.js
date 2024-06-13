document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generate-btn');
  const pdfPreview = document.getElementById('pdf-preview');
  const emailSection = document.getElementById('email-section');
  const uploadBtn = document.getElementById('upload-btn');
  const message = document.getElementById('message');
  const resetBtn = document.getElementById('reset-btn');

  generateBtn.addEventListener('click', generatePdf);
  uploadBtn.addEventListener('click', uploadPdf);
  resetBtn.addEventListener('click', resetUI);

  function generatePdf() {
    fetch('/pdf/create', { method: 'POST' })
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        pdfPreview.src = url;
        pdfPreview.classList.remove('hidden');
        emailSection.classList.remove('hidden');
        generateBtn.classList.add('hidden');
      })
      .catch((error) => console.error('Error generating PDF:', error));
  }

  function uploadPdf() {
    const email = document.getElementById('email').value;
    if (!email) {
      alert('Please enter an email.');
      return;
    }

    fetch('/pdf/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then((response) => response.json())
      .then((data) => {
        message.textContent = 'PDF uploaded successfully.';
        message.classList.remove('hidden');
        pdfPreview.classList.add('hidden');
        emailSection.classList.add('hidden');
        resetBtn.classList.remove('hidden');
      })
      .catch((error) => console.error('Error uploading PDF:', error));
  }

  function resetUI() {
    generateBtn.classList.remove('hidden');
    pdfPreview.classList.add('hidden');
    emailSection.classList.add('hidden');
    message.classList.add('hidden');
    resetBtn.classList.add('hidden');
    pdfPreview.src = ''; // Clear the preview
  }
});
