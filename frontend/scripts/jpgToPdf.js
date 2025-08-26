const imgInput = document.getElementById("imgInput");
const previewArea = document.getElementById("previewArea");
const downloadBtn = document.getElementById("downloadPdfButton");

imgInput.addEventListener("change", handleFiles);
downloadBtn.addEventListener("click", downloadPdf);

function handleFiles(event) {
  previewArea.innerHTML = "";

  const files = Array.from(event.target.files);

  if (files.length === 0) {
    alert("Please select image files.");
    return;
  }

  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const container = document.createElement("div");
      container.className = "image-container";
      container.draggable = true;

      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "preview-image";

      const label = document.createElement("p");
      label.innerText = `Page ${index + 1}`;

      container.appendChild(img);
      container.appendChild(label);
      previewArea.appendChild(container);
      addDragHandlers(container);
    };
    reader.readAsDataURL(file);
  });

  downloadBtn.style.display = "inline-block";
}

function addDragHandlers(container) {
  container.addEventListener("dragstart", dragStart);
  container.addEventListener("dragover", dragOver);
  container.addEventListener("drop", drop);
  container.addEventListener("dragend", dragEnd);
}

let dragged;

function dragStart(e) {
  dragged = this;
  this.classList.add("dragging");
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  if (dragged !== this) {
    const draggedIndex = Array.from(previewArea.children).indexOf(dragged);
    const dropIndex = Array.from(previewArea.children).indexOf(this);

    if (draggedIndex < dropIndex) {
      this.after(dragged);
    } else {
      this.before(dragged);
    }
  }
}

function dragEnd(e) {
  this.classList.remove("dragging");
}

async function downloadPdf() {
  const { jsPDF } = window.jspdf;
  let pdf = null;

  const imgElements = previewArea.querySelectorAll(".image-container img");

  for (let i = 0; i < imgElements.length; i++) {
    const imgEl = imgElements[i];
    const imgData = imgEl.src;

    const img = new Image();
    img.src = imgData;

    await new Promise((resolve) => {
      img.onload = function () {
        const width = img.width;
        const height = img.height;
        const orientation = width > height ? "l" : "p";

        if (!pdf) {
          pdf = new jsPDF({ orientation });
        } else {
          pdf.addPage();
          pdf.setPage(pdf.getNumberOfPages());
        }

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        let newWidth = pageWidth - 20;
        let newHeight = (height * newWidth) / width;

        if (newHeight > pageHeight - 20) {
          newHeight = pageHeight - 20;
          newWidth = (width * newHeight) / height;
        }

        const x = (pageWidth - newWidth) / 2;
        const y = (pageHeight - newHeight) / 2;

        pdf.addImage(imgData, 'JPEG', x, y, newWidth, newHeight);
        resolve();
      };
    });
  }

  if (pdf) {
    pdf.save("converted.pdf");
  }
}
