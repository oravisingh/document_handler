# 🚀 Render Deployment Guide

This guide will help you deploy your Document Handle project to Render.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)

## 🚀 Step-by-Step Deployment

### **Step 1: Push to GitHub**

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Render deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### **Step 2: Deploy on Render**

1. **Go to [render.com](https://render.com) and sign in**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**

   - **Name**: `document-handle` (or your preferred name)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python server.py`
   - **Plan**: `Starter` (free tier)

5. **Click "Create Web Service"**

### **Step 3: Environment Variables (Optional)**

Render will automatically set:
- `PORT` - The port your app runs on
- `RENDER` - Set to `true` in production

### **Step 4: Wait for Deployment**

- First build: 5-10 minutes
- Subsequent deployments: 2-5 minutes

## 🔧 What Happens During Deployment

1. **Build Phase**: Render installs your Python dependencies
2. **Start Phase**: Your Flask app starts and serves both backend APIs and frontend
3. **Health Check**: Render verifies your app is running

## 🌐 Your App Structure on Render

```
https://your-app-name.onrender.com/
├── /                    → Frontend homepage
├── /compress           → Image compression API
├── /convert            → PDF to DOCX API
├── /converter/*        → Frontend converter pages
└── /scripts/*          → Frontend JavaScript files
```

## ✅ Verification

After deployment, test:
1. **Homepage**: Should load your main interface
2. **Image Compression**: Upload an image and compress it
3. **PDF to DOCX**: Convert a PDF file

## 🐛 Troubleshooting

### **Build Failures**
- Check `requirements.txt` for typos
- Ensure all dependencies are available on PyPI

### **Runtime Errors**
- Check Render logs in the dashboard
- Verify file paths are correct

### **API Not Working**
- Ensure frontend JavaScript uses relative URLs (already fixed)
- Check CORS settings (already configured)

## 💰 Cost

- **Starter Plan**: Free (with limitations)
- **Standard Plan**: $7/month (recommended for production)

## 🔄 Updating Your App

1. **Make changes locally**
2. **Push to GitHub**: `git push origin main`
3. **Render automatically redeploys**

## 📱 Custom Domain (Optional)

1. **Go to your Render service**
2. **Settings → Custom Domains**
3. **Add your domain**
4. **Configure DNS as instructed**

## 🎯 Next Steps

After successful deployment:
1. **Test all functionality**
2. **Monitor performance**
3. **Set up monitoring/analytics**
4. **Consider upgrading to paid plan for production use**

## 📞 Support

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Render Community**: [community.render.com](https://community.render.com)
- **Your App Logs**: Available in Render dashboard

---

**Happy Deploying! 🎉** 