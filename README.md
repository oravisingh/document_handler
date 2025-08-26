# 📚 PDF & Image Utility Toolkit

A browser-based utility project for performing common PDF and image tasks.

It includes the following tools:

* ✅ **Image Size Reducer** (JPG, PNG to target size)
* ✅ **JPG to PDF Converter**
* ✅ **PDF to JPG Converter**
* ✅ **PDF Merger**
* ✅ **PDF Splitter**
* ✅ **PDF to DOCX Converter**

## 🧩 Project Structure

resourcePP/
├── assets/              # Logos, wallpapers, branding
├── backend/             # Python Flask backend APIs
├── frontend/            # HTML, CSS, JS frontend
├── static/              # Temporary storage for uploads and 

## ⚙ Technologies Used

* **Frontend:** HTML, CSS, JavaScript (Vanilla)
* **Backend:** Python 3 with Flask (REST APIs)
* **Libraries:**

  * Pillow (image processing & compression)
  * Ghostscript (PDF compression, splitting, merging)
  * Flask-CORS (for frontend–backend communication)
  * Waitress (for production deployment on Windows servers)


## ⚡ Running in Development Mode

1. **Install dependencies**

```bash
pip install -r requirements.txt
```

2. **Install Ghostscript**

   * Make sure Ghostscript (`gs` / `gswin64c`) is installed and added to system PATH.
   * [Download Ghostscript](https://www.ghostscript.com/download/gsdnld.html)

3. **Start Flask backend**

```bash
python backend/server.py
```

4. **Open frontend**

   * Simply open `frontend/index.html` in your browser.
   * Frontend will send API requests to: `http://127.0.0.1:5000`

## 🚀 Running in Production Mode (University Server Deployment)

1. **Install Waitress**

```bash
pip install waitress
```

2. **Run backend via Waitress**

```bash
python backend/server.py
```

> This will serve the app on port **5000** (or your configured port).
> For university-wide access, technical cell can set up a **reverse proxy (e.g., Nginx/Apache)** to map it to a public domain.

3. **Frontend Hosting**

   * `frontend/` can be hosted on any web server (Apache, Nginx, IIS, or even static hosting).
   * The only requirement: it must be able to reach the backend API (Flask+Waitress).

## 📦 requirements.txt

```
Flask
flask-cors
Pillow
waitress
```

## 🔒 Security & Cleanup

* Uploaded and processed files are stored only temporarily inside `static/`.
* Files are deleted automatically after being served to the user.
* No permanent storage of user documents.


## 👨‍🏫 Notes for University Deployment

* The **Flask app is for development**.
* The **Waitress server is for production** (stable, secure, non-reloading).
* If deployment is required for multiple users, technical cell should:

  * Run backend with Waitress.
  * Expose backend using Nginx/Apache reverse proxy.
  * Host `frontend/` as static files accessible to students.

## 🧠 Developed By

**Ravinandan Samrat**
B.Tech CSE, 3rd Year, Central University of Jharkhand
📧 Email: [ornsamrat2004@gmail.com](mailto:ornsamrat2004@gmail.com)
