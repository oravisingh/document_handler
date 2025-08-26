const input = document.getElementById('pdfInput');
const mergeBtn = document.getElementById('mergeButton');
const downloadBtn = document.getElementById('downloadPdfButton');
const container = document.getElementById('pdf-container');

let fileList = [];

input.addEventListener('change', (e) => {
  fileList = Array.from(e.target.files);
});

mergeBtn.addEventListener('click', async () => {
  if (fileList.length === 0) {
    alert('Please select PDF files to merge');
    return;
  }

  container.innerHTML = ''; // Clear previous previews

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const pdfData = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;

    const div = document.createElement('div');
    div.className = 'image-container';
    div.setAttribute('data-index', i);
    div.appendChild(canvas);
    container.appendChild(div);
  }

  Sortable.create(container, {
    animation: 150,
  });

  downloadBtn.style.display = 'block';
});

downloadBtn.addEventListener('click', async () => {
  const reorderedDivs = Array.from(container.children);
  const reorderedFiles = reorderedDivs.map(div => fileList[parseInt(div.getAttribute('data-index'))]);

  const mergedPdf = await PDFLib.PDFDocument.create();

  for (const file of reorderedFiles) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(bytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach(p => mergedPdf.addPage(p));
  }

  const mergedPdfBytes = await mergedPdf.save();
  const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'merged.pdf';
  a.click();

  URL.revokeObjectURL(url);
});
