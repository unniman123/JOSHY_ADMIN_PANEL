# Truth Teller Admin Panel

## Project Description

This is a React-based admin panel for managing the Truth Teller website content, built with modern web technologies.

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

Follow these steps to set up the project locally:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd truth-teller-admin

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development server
npm run dev
```

### Environment Variables

For local development, you need to set the following environment variables:

- `VITE_SUPABASE_URL` - Supabase project URL (e.g. `https://xyz.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` - Supabase anon/public API key

Create a `.env.local` file in the root directory and add these variables.

### Development Options

You can edit this project in several ways:

**Using your preferred IDE**
- Clone the repository and work locally with your favorite code editor
- Make changes and commit them to the repository

**Edit directly in GitHub**
- Navigate to the desired file(s)
- Click the "Edit" button (pencil icon) at the top right of the file view
- Make your changes and commit them

**Using GitHub Codespaces**
- Navigate to the main page of your repository
- Click on the "Code" button (green button) near the top right
- Select the "Codespaces" tab
- Click on "New codespace" to launch a new Codespace environment
- Edit files directly within the Codespace and commit and push your changes

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

This project can be deployed to various hosting platforms. The build output is static and can be deployed to:

- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

### Build Commands

```sh
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Steps

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables on your hosting platform
