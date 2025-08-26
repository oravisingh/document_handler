// Import JSZip for zipping files
const zip = new JSZip();

async function convertPdfToJpg() {
  const fileInput = document.getElementById("pdfInput");
  if (fileInput.files.length === 0) {
    alert("Please select a PDF file.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function (event) {
    try {
      const pdfData = new Uint8Array(event.target.result);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      console.log("PDF loaded with", pdf.numPages, "pages.");

      const outputDiv = document.getElementById("output");
      outputDiv.innerHTML = ""; // Clear previous output

     // Show the separated download button in the second row
      const downloadSection = document.getElementById("downloadSection");
      const zipDownloadBtn = document.getElementById("downloadZipButton");
      zipDownloadBtn.onclick = downloadZip;
      downloadSection.style.display = "block";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 2.0;
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        console.log("Rendering completed for page", i);

        const imgData = canvas.toDataURL("image/jpeg");

        // Add image to zip
        zip.file(`page_${i}.jpg`, imgData.split(',')[1], { base64: true });

        // Display Image
        const container = document.createElement("div");
        container.className = "image-container"; // use class for layout

        const imgElement = document.createElement("img");
        imgElement.src = imgData;
        imgElement.alt = "Page " + i;
        imgElement.className = "preview-image"; // apply styling via CSS
        container.appendChild(imgElement);

        const caption = document.createElement("p");
        caption.textContent = "Page " + i;
        container.appendChild(caption);


        outputDiv.appendChild(container);

      }

    } catch (error) {
      console.error("Error during conversion:", error);
      alert("Error during conversion: " + error.message);
    }
  };

  reader.readAsArrayBuffer(file);
}

// Function to download all images as ZIP
async function downloadZip() {
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const zipUrl = URL.createObjectURL(zipBlob);

  const link = document.createElement("a");
  link.href = zipUrl;
  link.download = "pdf_images.zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Prevent form submission refresh
document.getElementById("convertButton").addEventListener("click", function (event) {
  event.preventDefault();
  convertPdfToJpg();
});
