window.onload = function () {
  const pdfFileInput = document.getElementById('pdf-file');
  const pdfViewer = document.getElementById('pdf-viewer');
  const generateButton = document.getElementById('split-pdf');

  let pdfDoc = null;
  let totalPages = 0;
  let pageOrder = []; // Holds {page: 1, selected: true/false}

  pdfjsLib.GlobalWorkerOptions.workerSrc = '../scripts/pdf.worker.min.js';

  // Load and render PDF
  pdfFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = function (e) {
        const loadingTask = pdfjsLib.getDocument({ data: e.target.result });
        loadingTask.promise.then((pdf) => {
          pdfDoc = pdf;
          totalPages = pdf.numPages;
          pageOrder = Array.from({ length: totalPages }, (_, i) => ({ page: i + 1, selected: false }));
          renderPages();
        });
      };
      reader.readAsArrayBuffer(file);
    }
  });

  function renderPages() {
    pdfViewer.innerHTML = '';
    pageOrder.forEach(({ page }) => {
      const block = document.createElement('div');
      block.classList.add('page-block');
      block.setAttribute('draggable', true);
      block.dataset.page = page;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.page = page;
      checkbox.addEventListener('change', handleSelection);

      const label = document.createElement('label');
      label.textContent = `Page ${page}`;

      const canvas = document.createElement('canvas');
      canvas.id = `canvas-${page}`;

      block.appendChild(checkbox);
      block.appendChild(label);
      block.appendChild(canvas);
      pdfViewer.appendChild(block);

      renderSinglePage(page, canvas);

      // Drag and drop logic
      block.addEventListener('dragstart', (e) => {
        block.classList.add('dragging');
        e.dataTransfer.setData('text/plain', page);
      });

      block.addEventListener('dragend', () => {
        block.classList.remove('dragging');
      });

      block.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        const target = e.currentTarget;
        if (dragging && target !== dragging) {
          const draggingPage = parseInt(dragging.dataset.page, 10);
          const targetPage = parseInt(target.dataset.page, 10);
          const draggingIndex = pageOrder.findIndex(p => p.page === draggingPage);
          const targetIndex = pageOrder.findIndex(p => p.page === targetPage);
          if (draggingIndex !== -1 && targetIndex !== -1) {
            const temp = pageOrder[draggingIndex];
            pageOrder.splice(draggingIndex, 1);
            pageOrder.splice(targetIndex, 0, temp);
            renderPages();
          }
        }
      });
    });
  }

  function renderSinglePage(pageNum, canvas) {
    pdfDoc.getPage(pageNum).then((page) => {
      const scale = 1.2;
      const viewport = page.getViewport({ scale: scale });
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      page.render({
        canvasContext: context,
        viewport: viewport,
      });
    });
  }

  function handleSelection(event) {
    const pageNum = parseInt(event.target.dataset.page, 10);
    const pageObj = pageOrder.find(p => p.page === pageNum);
    if (pageObj) pageObj.selected = event.target.checked;
  }

  generateButton.addEventListener('click', async () => {
    const selected = pageOrder.filter(p => p.selected).map(p => p.page);
    if (selected.length === 0) {
      alert('Please select pages to split.');
      return;
    }

    const pdfBytes = await pdfDoc.getData();
    const pdfDocCopy = await PDFLib.PDFDocument.load(pdfBytes);
    const newPdf = await PDFLib.PDFDocument.create();

    for (let pageNum of selected) {
      const [copiedPage] = await newPdf.copyPages(pdfDocCopy, [pageNum - 1]);
      newPdf.addPage(copiedPage);
    }

    const newPdfBytes = await newPdf.save();
    const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'split_pdf.pdf';
    link.click();
  });
};
