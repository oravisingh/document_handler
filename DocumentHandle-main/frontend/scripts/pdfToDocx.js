// Get references to DOM elements
const dropZone = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const status = document.getElementById('status');
const downloadBtn = document.getElementById('downloadBtn');

let convertedDocxBlob = null;  // to temporarily store the converted DOCX blob

// Helper function to set status messages
function setStatus(message) {
  status.textContent = message;
}

// Drag & Drop events
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', (e) => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    handleFile(e.dataTransfer.files[0]);
  }
});

// Click to select file
dropZone.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) {
    handleFile(fileInput.files[0]);
  }
});

// Handle file selection and preview
function handleFile(file) {
  // Validate file type
  if (file.type !== 'application/pdf') {
    setStatus('Please select a valid PDF file.');
    return;
  }
  
  // File size check: recommend a maximum of 10MB
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    setStatus('File is too large. Please select a PDF under 10MB.');
    return;
  }
  
  // Reset previous preview, status, and download button
  preview.innerHTML = '';
  setStatus('');
  downloadBtn.style.display = 'none';
  
  // Display a simple preview: showing file name
  preview.textContent = `Selected file: ${file.name}`;
  
  // Start conversion process
  uploadFile(file);
}

// Upload file to backend for conversion
function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  setStatus('Converting, please wait...');

  // API endpoint for PDF to DOCX conversion
  fetch('/convert', {
    method: 'POST',
    body: formData
  })
  .then(async response => {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Conversion failed');
    }
    return response.blob(); // Receive the DOCX as a blob
  })
  .then(blob => {
    convertedDocxBlob = blob;
    setStatus('Conversion successful!');
    downloadBtn.style.display = 'block';
  })
  .catch(error => {
    console.error(error);
    setStatus(`Error: ${error.message}`);
  });
}

// Download the converted DOCX file when the button is clicked
downloadBtn.addEventListener('click', () => {
  if (!convertedDocxBlob) return;
  
  const url = URL.createObjectURL(convertedDocxBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'converted.docx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
