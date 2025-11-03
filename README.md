# TikTok Translator 🔮

A Next.js 14 app that translates what people *really* mean - in the style of the TikTok "translating" trend.

## Features

- ✨ TikTok aesthetic with dark background and pink accents
- 🔮 Sarcastic translations powered by Mistral AI
- 💀 Gen Z meme humor style
- ⚡ Smooth animations and loading states

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```bash
MISTRAL_API_KEY=your_mistral_api_key_here
```

To get a Mistral API key:
- Visit [Mistral AI Console](https://console.mistral.ai) and sign up
- Add payment information at [admin.mistral.ai](https://admin.mistral.ai)
- Generate an API key from your dashboard

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Mistral AI API (mistral-medium-2508)

## Usage

Type a sentence in the textarea and click "🔁Translating...🔁" to get a brutally honest TikTok-style translation!

## Deployment to Render

### Prerequisites
1. A Render account (sign up at https://render.com)
2. Your Mistral API key from https://console.mistral.ai

### Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create a new Web Service on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` configuration

3. **Add Environment Variables**
   - In the Render dashboard, go to your service's "Environment" tab
   - Add the following environment variable:
     - `MISTRAL_API_KEY`: Your Mistral AI API key
   - Optionally add:
     - `NODE_ENV`: `production` (automatically set by Render)

4. **Deploy**
   - Render will automatically build and deploy using the configuration in `render.yaml`
   - The build command: `npm install && npm run build`
   - The start command: `npm start`

5. **Your app will be live at**: `https://your-service-name.onrender.com`

### Render Configuration

The `render.yaml` file is already configured with:
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path: `/`
- Plan: Starter (can be upgraded)

### Environment Variables Required

- `MISTRAL_API_KEY`: Your Mistral AI API key (required)
- `NODE_ENV`: Automatically set to `production` by Render

