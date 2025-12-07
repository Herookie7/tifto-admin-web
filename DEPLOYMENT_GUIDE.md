# Tifto Admin Dashboard - Render Deployment Guide

This guide will walk you through deploying the Tifto Admin Dashboard to Render's free hosting service.

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com) (free tier available)
3. **Node.js**: Ensure your code is compatible with Node.js 20+

## Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

If your code isn't already in GitHub:

```bash
# Navigate to your project directory
cd tifto-admin

# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Ready for Render deployment"

# Add your GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/your-username/your-repo-name.git

# Push to GitHub
git push -u origin main
```

### Step 2: Sign Up / Log In to Render

1. Go to [https://render.com](https://render.com)
2. Click **"Get Started for Free"** or **"Sign In"**
3. Sign up using your GitHub account (recommended for easier integration)

### Step 3: Create a New Web Service

1. From your Render Dashboard, click **"New +"** button
2. Select **"Web Service"**
3. Choose your GitHub repository:
   - If you signed up with GitHub, your repositories will be listed
   - Select the repository containing `tifto-admin`
   - Click **"Connect"**

### Step 4: Configure the Service

Fill in the following details:

#### Basic Settings:
- **Name**: `tifto-admin` (or any name you prefer)
- **Region**: Choose closest to your users (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `tifto-admin` (if your repo contains multiple projects) or leave blank if the repo is just the admin app
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

#### Environment Variables:

Click **"Advanced"** and add these environment variables:

**Required Variables:**
```
NODE_ENV=production
NODE_VERSION=20
PORT=3000
```

**Backend Integration (Optional - already set in render.yaml, but you can override):**
```
NEXT_PUBLIC_SERVER_URL=https://ftifto-backend.onrender.com
NEXT_PUBLIC_WS_SERVER_URL=wss://ftifto-backend.onrender.com
```

**Firebase Configuration (if using Firebase):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Note**: If you're using the `render.yaml` file (already created), Render will automatically use those settings. You only need to set environment variables in the dashboard if you want to override the defaults.

### Step 5: Choose a Plan

- Select **"Free"** plan (suitable for development/testing)
- **Note**: Free tier services spin down after 15 minutes of inactivity and take 30-60 seconds to wake up

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will start building your application
3. You can watch the build logs in real-time
4. The build process will:
   - Install dependencies (`npm install`)
   - Build the Next.js app (`npm run build`)
   - Start the server (`npm start`)

### Step 7: Access Your Application

Once deployment is complete:
- Your app will be available at: `https://tifto-admin.onrender.com` (or your custom name)
- Render provides a free `.onrender.com` subdomain
- You can add a custom domain later if needed

## Using render.yaml (Alternative Method)

If you prefer to use the `render.yaml` file (already created in your project):

1. In Render Dashboard, go to **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will automatically detect and use `render.yaml`
4. All settings from the YAML file will be applied automatically

## Post-Deployment Configuration

### 1. Update CORS Settings (If Needed)

If you encounter CORS errors, ensure your backend (`ftifto-backend`) allows requests from your Render URL:
- Add `https://tifto-admin.onrender.com` to CORS origins in backend configuration

### 2. Verify Environment Variables

1. Go to your service in Render Dashboard
2. Click **"Environment"** tab
3. Verify all required variables are set
4. Add any missing Firebase or other service credentials

### 3. Check Logs

1. Click **"Logs"** tab in Render Dashboard
2. Monitor for any errors or warnings
3. Common issues:
   - Build failures: Check Node version compatibility
   - Runtime errors: Verify environment variables
   - Network errors: Check backend API URLs

## Troubleshooting

### Build Fails

**Error**: `Module not found` or `Cannot find module`
- **Solution**: Ensure `package.json` has all dependencies listed
- Check build logs for specific missing packages

**Error**: `Build script failed`
- **Solution**: Run `npm run build` locally to test
- Fix any TypeScript or build errors before deploying

### App Won't Start

**Error**: `Port already in use` or `Cannot bind to port`
- **Solution**: Render automatically sets PORT environment variable
- Ensure your code uses `process.env.PORT` for the port (Next.js handles this automatically)

**Error**: `Backend connection failed`
- **Solution**: 
  - Verify backend URL is correct
  - Check if backend is running: `https://ftifto-backend.onrender.com/status`
  - Ensure CORS is configured in backend

### Service Keeps Spinning Down (Free Tier)

- **Solution**: This is expected behavior on free tier
- Services wake up automatically when accessed (takes 30-60 seconds)
- Consider upgrading to paid plan for always-on service

### Environment Variables Not Working

- **Solution**: 
  - Variables prefixed with `NEXT_PUBLIC_` are exposed to browser
  - Restart service after adding/changing environment variables
  - Check variable names are exactly correct (case-sensitive)

## Monitoring and Updates

### Automatic Deployments

Render automatically deploys when you push to your connected branch:
```bash
git add .
git commit -m "Update admin dashboard"
git push origin main
```

### Manual Deployments

1. Go to Render Dashboard
2. Click your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Viewing Logs

1. Click **"Logs"** tab in Render Dashboard
2. View real-time logs
3. Filter by level (Info, Warning, Error)

## Cost Considerations

### Free Tier Limitations:
- ✅ 750 hours/month (enough for one always-on service, or multiple with spin-down)
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ⚠️ Services spin down after 15 min inactivity
- ⚠️ Wake-up time: 30-60 seconds

### When to Upgrade:
- Need always-on service (no spin-down)
- Need faster response times
- Need more resources (memory, CPU)
- Need custom domains with SSL
- Need dedicated IP addresses

## Security Best Practices

1. **Never commit secrets**: Use environment variables for all sensitive data
2. **Use Render Secrets**: For sensitive values, use Render's "Secret Files" feature
3. **Enable HTTPS**: Automatically provided by Render
4. **Regular updates**: Keep dependencies updated
5. **Monitor logs**: Regularly check for suspicious activity

## Next Steps

After successful deployment:

1. ✅ Test all features (login, dashboard, etc.)
2. ✅ Verify backend connectivity
3. ✅ Test on mobile devices
4. ✅ Set up monitoring/alerting
5. ✅ Configure custom domain (optional)
6. ✅ Set up CI/CD for automated testing (optional)

## Support

- **Render Documentation**: [https://render.com/docs](https://render.com/docs)
- **Render Community**: [https://community.render.com](https://community.render.com)
- **Next.js Deployment**: [https://nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

**Good luck with your deployment! 🚀**

