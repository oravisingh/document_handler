from flask import Flask, request, send_file
from flask_cors import CORS
import os
import tempfile
from pdf2docx import Converter
from waitress import serve


app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for all routes

@app.route('/convert', methods=['POST'])
def convert_pdf_to_docx():
    if 'file' not in request.files:
        return "No file part", 400

    file = request.files['file']

    if file.filename == '':
        return "No selected file", 400

    # Validate that the file is a PDF
    if not file or not file.filename.lower().endswith('.pdf'):
        return "Invalid file type", 400

    try:
        # Save the uploaded PDF to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
            file.save(temp_pdf)
            temp_pdf_path = temp_pdf.name

        # Prepare a temporary file for the DOCX output
        with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as temp_docx:
            temp_docx_path = temp_docx.name

        # Convert the PDF to DOCX using pdf2docx with full layout conversion
        try:
            cv = Converter(temp_pdf_path)
            cv.convert(temp_docx_path, start=0, end=None)
            cv.close()
        except Exception as e:
            return f"Conversion failed: {str(e)}", 500

        # Send the DOCX file as a download
        response = send_file(
            temp_docx_path,
            as_attachment=True,
            download_name='converted.docx',
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )

        # Schedule cleanup of the DOCX file after response is sent
        response.call_on_close(lambda: os.remove(temp_docx_path))

        return response
    finally:
        # Clean up the temporary PDF file immediately
        try:
            if 'temp_pdf_path' in locals() and os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)
        except Exception as e:
            print("Error cleaning up temporary PDF file:", e)



if __name__ == '__main__':
    serve(app, host='0.0.0.0', port=5000)
