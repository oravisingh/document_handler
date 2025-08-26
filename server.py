from flask import Flask, request, send_file, abort, send_from_directory
from flask_cors import CORS
from PIL import Image, ImageFile
import os
import io
import threading
import time
import tempfile
from pdf2docx import Converter
from waitress import serve

app = Flask(__name__, static_folder='frontend', static_url_path='')
CORS(app)

# Create necessary directories
UPLOAD_FOLDER = 'static/uploads'
COMPRESSED_FOLDER = 'static/compressed'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(COMPRESSED_FOLDER, exist_ok=True)

ImageFile.LOAD_TRUNCATED_IMAGES = True

# ===== IMAGE COMPRESSION ROUTES =====

def schedule_file_deletion(path, delay=300):
    def delete_file():
        time.sleep(delay)
        try:
            os.remove(path)
        except Exception as e:
            print(f"Error deleting {path}: {e}")
    threading.Thread(target=delete_file, daemon=True).start()

def png_to_jpeg(image):
    if image.mode in ("RGBA", "LA"):
        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.split()[-1])
        return background
    return image.convert("RGB")

def compress_jpeg(image, target_bytes):
    quality = 95
    last_data = None
    
    while quality > 5:
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=quality, optimize=True)
        data = buffer.getvalue()
        
        if len(data) <= target_bytes:
            return data
        
        last_data = data
        quality -= 5
    
    return last_data

@app.route('/compress', methods=['POST'])
def compress():
    if 'image' not in request.files:
        return abort(400, description="No file uploaded")

    file = request.files['image']
    target_kb = request.form.get('target_kb', type=int)
    if not target_kb or target_kb < 20 or target_kb > 300:
        return abort(400, description="Invalid target size")

    filename = file.filename
    upload_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(upload_path)

    try:
        img = Image.open(upload_path)
    except Exception:
        return abort(400, description="Cannot process image")

    target_bytes = target_kb * 1024
    format = img.format.upper()
    if format == 'JPG':
        format = 'JPEG'

    if format == 'PNG':
        jpeg_img = png_to_jpeg(img)
        compressed_data = compress_jpeg(jpeg_img, target_bytes)
        format = 'JPEG'
        compressed_filename = f"compressed_{int(time.time())}_{filename.rsplit('.', 1)[0]}.jpg"
    elif format == 'JPEG':
        compressed_data = compress_jpeg(img, target_bytes)
        compressed_filename = f"compressed_{int(time.time())}_{filename}"
    else:
        return abort(400, description="Unsupported image format")

    compressed_path = os.path.join(COMPRESSED_FOLDER, compressed_filename)
    with open(compressed_path, 'wb') as f:
        f.write(compressed_data)

    schedule_file_deletion(upload_path, delay=300)
    schedule_file_deletion(compressed_path, delay=300)

    return send_file(
        io.BytesIO(compressed_data),
        mimetype='image/jpeg',
        as_attachment=True,
        download_name=compressed_filename
    )

# ===== PDF TO DOCX ROUTES =====

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

# ===== FRONTEND ROUTES =====

@app.route('/')
def index():
    return send_from_directory('frontend', 'index.html')

@app.route('/<path:path>')
def serve_frontend(path):
    return send_from_directory('frontend', path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    if os.environ.get('RENDER'):
        # Production on Render
        app.run(host='0.0.0.0', port=port)
    else:
        # Development with Waitress
        serve(app, host='0.0.0.0', port=port) 