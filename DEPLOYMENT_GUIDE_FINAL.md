# 🚀 Deployment Guide: CodeMaster on Render

Your code is fully configured for deployment. Follow these exact steps to get it live.

## Phase 1: Create Services on Render

1.  **Log in**: Go to [dashboard.render.com](https://dashboard.render.com).
2.  **Create Blueprint**:
    *   Click **New +** -> **Blueprint**.
    *   Connect your GitHub account.
    *   Select your repository: `CodeMaster`.
    *   Click **Connect**.
3.  **Apply**:
    *   Render will detect `render.yaml`.
    *   Click **Apply** or **Create Resources**.
    *   *Note: The first build might fail or hang until we add the environment variables. This is normal.*

## Phase 2: Configure Environment Variables (CRITICAL)

You must add these secrets manually in the Render Dashboard. `render.yaml` cannot safely store them.

### 1. Backend Service (`codemaster-backend`)
Go to **Dashboard** -> **codemaster-backend** -> **Environment**.
Add the following variables:

| Key | Value (Copy from your local .env) |
| :--- | :--- |
| `MONGO_URI` | `mongodb+srv://...` (Your connection string) |
| `REDIS_HOST` | `redis-16281.c8.us-east-1-4.ec2.cloud.redislabs.com` |
| `REDIS_PORT` | `16281` |
| `REDIS_PASSWORD` | `YOUR_REDIS_PASSWORD` |
| `JWT_SECRET` | `YOUR_JWT_SECRET` |
| `MAIL_USER` | `YOUR_GMAIL_ADDRESS` |
| `MAIL_PASS` | `YOUR_GMAIL_APP_PASSWORD` |
| `FRONTEND_URL` | `https://codemaster-frontend.onrender.com` (Check exact URL after creation) |
| `GEMINI_API_KEY` | `YOUR_GEMINI_KEY` |
| `CLOUDINARY_CLOUD_NAME` | `YOUR_CLOUD_NAME` |
| `CLOUDINARY_API_KEY` | `YOUR_API_KEY` |
| `CLOUDINARY_API_SECRET` | `YOUR_API_SECRET` |

**Click "Save Changes"**. This will trigger a redeploy of the backend.

### 2. Frontend Service (`codemaster-frontend`)
Go to **Dashboard** -> **codemaster-frontend** -> **Environment**.
The `VITE_API_URL` should already be set automatically by the Blueprint. If not:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://codemaster-backend.onrender.com` (Your backend URL) |

## Phase 3: Network Access (MongoDB)

If your backend logs show a "Timeout" or "ServerSelectionError":
1.  Go to **MongoDB Atlas**.
2.  **Network Access** -> **Add IP Address**.
3.  Select **"Allow Access from Anywhere"** (`0.0.0.0/0`).
4.  Confirm.

## Phase 4: Verification

1.  Wait for both services to show **"Live"** (Green).
2.  Open your **Frontend URL**.
3.  Test a login or signup to verify the backend connection.

---
**Troubleshooting:**
*   **Logs**: Check the "Logs" tab of the specific service if something breaks.
*   **Build Fail?**: Ensure `npm install` runs successfully in the logs.
