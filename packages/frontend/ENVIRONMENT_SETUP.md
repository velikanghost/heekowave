# Environment Setup

To get the Web3Auth modal working, you need to set up the following environment variables:

## 1. Create `.env.local` file

Create a `.env.local` file in the `packages/frontend` directory with the following content:

```env
# Web3Auth Configuration
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id_here

# Web Push Configuration (for notifications)
WEB_PUSH_EMAIL=user@example.com
WEB_PUSH_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=your_public_key_here
```

## 2. Get Web3Auth Client ID

1. Go to [Web3Auth Dashboard](https://dashboard.web3auth.io/)
2. Create a new project or use an existing one
3. Copy the Client ID from your project settings
4. Replace `your_web3auth_client_id_here` with your actual Client ID

## 3. Generate VAPID Keys (Optional - for push notifications)

If you want to enable push notifications, generate VAPID keys:

```bash
npm install -g web-push
node generate-vapid-keys.js
```

This will output keys that you can use for the Web Push configuration.

## 4. Restart the development server

After setting up the environment variables, restart your development server:

```bash
pnpm dev
```

## Current Flow

1. **Landing Page**: User clicks "Get Started" → redirects to `/dashboard`
2. **Dashboard**: If not connected, shows Web3Auth component with "Get Started" button
3. **After Connection**: User is automatically redirected to dashboard with full functionality

The Web3Auth modal should now appear when clicking the "Get Started" button on the dashboard page.

