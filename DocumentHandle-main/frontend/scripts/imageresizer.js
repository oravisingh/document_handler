// scripts/imageresizer.js

console.log('Image resizer script loaded');

const dropArea       = document.getElementById('dropArea');
const fileInput      = document.getElementById('fileInput');
const convertBtn     = document.getElementById('convertBtn');
const targetSizeInput= document.getElementById('targetSize');
const statusMsg      = document.getElementById('statusMsg');

let selectedFile = null;

function updateStatus(msg) {
  statusMsg.innerText = msg;
}

// File selection handlers
dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => {
  selectedFile = e.target.files[0] || null;
  if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
    updateStatus(` Ready: ${selectedFile.name}`);
  } else if (selectedFile) {
    updateStatus(" File too large. Under 10 MB please.");
    selectedFile = null;
  }
});

// Drag & drop
['dragover','dragleave','drop'].forEach(evt => {
  dropArea.addEventListener(evt, e => {
    e.preventDefault();
    dropArea.classList.toggle('dragover', evt==='dragover');
    if (evt==='drop') {
      selectedFile = e.dataTransfer.files[0] || null;
      if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
        updateStatus(` Ready: ${selectedFile.name}`);
      } else {
        updateStatus(" File too large. Under 10 MB please.");
        selectedFile = null;
      }
    }
  });
});

// Main convert button
convertBtn.addEventListener('click', e => {
  e.preventDefault();
  if (!selectedFile) {
    return updateStatus("Please select an image first.");
  }
  const targetKB = parseInt(targetSizeInput.value, 10);
  if (isNaN(targetKB) || targetKB < 20 || targetKB > 300) {
    return updateStatus("Enter a size between 20 and 300 KB.");
  }

  updateStatus(" Compressing...");

  const form = new FormData();
  form.append('image', selectedFile);
  form.append('target_kb', targetKB);

  fetch('/compress', {
    method: 'POST',
    body: form
  })
  .then(res => {
    if (!res.ok) throw new Error("Compression failed");
    return res.blob();
  })
  .then(blob => {
    updateStatus("✅ Done—downloading now!");
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed_${selectedFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  })
  .catch(err => updateStatus(` ${err.message}`));
});
