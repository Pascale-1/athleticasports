# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/cf052cd2-1671-4422-bc90-2b3b42373aba

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/cf052cd2-1671-4422-bc90-2b3b42373aba) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Capacitor (for native iOS/Android apps)
- Supabase (via Lovable Cloud)

## How can I build native mobile apps (iOS/Android)?

Athletica is configured with Capacitor to build native mobile apps. Follow these steps:

### Prerequisites
- Node.js & npm installed
- For iOS: macOS with Xcode installed
- For Android: Android Studio installed

### Setup Steps

```sh
# Step 1: Clone and install dependencies (if not already done)
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i

# Step 2: Initialize Capacitor (first time only)
npx cap init

# Step 3: Build the web app
npm run build

# Step 4: Add platforms (first time only)
npx cap add ios
npx cap add android

# Step 5: Sync web assets to native projects
npx cap sync

# Step 6: Open in native IDEs and run
npx cap open ios      # Opens Xcode (macOS only)
npx cap open android  # Opens Android Studio
```

### For Subsequent Builds

After making changes to your code:

```sh
npm run build
npx cap sync
# Then run from Xcode/Android Studio or use:
npx cap run ios       # Run on iOS simulator/device
npx cap run android   # Run on Android emulator/device
```

### Hot Reload for Development

The app is configured to hot-reload from the Lovable preview URL during development. This means you can test changes instantly without rebuilding for each change.

To switch to local builds for production:
1. Edit `capacitor.config.ts`
2. Remove or comment out the `server` section
3. Run `npm run build && npx cap sync`

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/cf052cd2-1671-4422-bc90-2b3b42373aba) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
