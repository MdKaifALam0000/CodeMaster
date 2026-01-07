# Deployment Guide: GitHub & Render

This guide will walk you through pushing your project to GitHub and deploying it to Render.com.

## Prerequisites

- [ ] A GitHub account.
- [ ] A Render.com account (login with GitHub recommended).
- [ ] Git installed on your computer.

## Part 1: Push to GitHub

Since you already have a repository set up (`https://github.com/MdKaifALam0000/CodeMaster.git`), we just need to save your changes and push them.

### Step 1: Save and Commit
Open your terminal (in VS Code, press `Ctrl+~`) and run:

```bash
git add .
git commit -m "Prepare for deployment: Update render.yaml"
```

### Step 2: Push to GitHub
Upload your code to GitHub:

```bash
git push -u origin main
```
*(Note: If your default branch is `master`, use `git push -u origin master`)*

## Part 2: Deploy to Render

We have updated `render.yaml` to make this easy. This file tells Render exactly how to build and deploy both your Frontend and Backend.

### Step 1: Create Blueprint
1.  Log in to [Render Dashboard](https://dashboard.render.com).
2.  Click **"New"** and select **"Blueprint"**.
3.  Connect your GitHub account if prompted.
4.  Select your repository: `CodeMaster`.
5.  Click **"Connect"**.

### Step 2: Configure & Deploy
1.  Render will read the `render.yaml` file from your repository.
2.  It will show you the two services it's about to create:
    - `codemaster-backend` (Web Service)
    - `codemaster-frontend` (Static Site)
3.  Click **"Apply"** or **"Create Resources"**.

### Step 3: Wait for Build
Render will now build both your services.
- **Backend**: Installs dependencies and starts the server.
- **Frontend**: Builds the React app and serves it.

Once the deployments are green and "Live", you can access your app! 
- The **Frontend URL** will be the one you visit to see your site.
- The **Backend URL** is automatically linked to your frontend via the `VITE_API_URL` environment variable we configured.

## Troubleshooting

- **Build Fails?** Click on the failed service to see the logs.
- **Frontend can't talk to Backend?** Ensure the `VITE_API_URL` environment variable is correctly set in the Frontend service on Render (it should happen automatically with our blueprint).
