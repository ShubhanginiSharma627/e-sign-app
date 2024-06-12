document.getElementById('generate-btn').addEventListener('click', generatePdf);
document.getElementById('upload-btn').addEventListener('click', uploadPdf);

function generatePdf() {
  fetch('/pdf/create', {
    method: 'POST',
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const iframe = document.getElementById('pdf-preview');
      iframe.src = url;
      iframe.style.display = 'block';
      document.getElementById('email-section').style.display = 'block';
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('message').textContent =
        'PDF uploaded successfully.';
      console.log('Upload response:', data);
    })
    .catch((error) => console.error('Error uploading PDF:', error));
}
