from flask import Flask, request, send_file, abort
from flask_cors import CORS
from PIL import Image, ImageFile
import os
import io
import threading
import time
from waitress import serve


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'static/uploads'
COMPRESSED_FOLDER = 'static/compressed'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(COMPRESSED_FOLDER, exist_ok=True)

ImageFile.LOAD_TRUNCATED_IMAGES = True

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
    else:
        return image.convert("RGB")

def compress_jpeg(image, target_bytes):
    quality = 95
    best_data = None
    last_data = None
    if image.mode != 'RGB':
        image = image.convert('RGB')
    while quality >= 10:
        buf = io.BytesIO()
        image.save(buf, format='JPEG', quality=quality, optimize=True)
        data = buf.getvalue()
        if len(data) <= target_bytes:
            best_data = data
            break
        last_data = data
        quality -= 5
    if not best_data:
        width, height = image.size
        while len(last_data) > target_bytes and width > 100 and height > 100:
            width = int(width * 0.9)
            height = int(height * 0.9)
            resized = image.resize((width, height), Image.LANCZOS)
            buf = io.BytesIO()
            resized.save(buf, format='JPEG', quality=85, optimize=True)
            last_data = buf.getvalue()
            if len(last_data) <= target_bytes:
                return last_data
        return last_data
    return best_data

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

if __name__ == '__main__':
    serve(app, host='0.0.0.0', port=5000)
