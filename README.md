
# JobSafe - AI Job Posting Validator

A Chrome extension that helps job seekers validate the legitimacy of job postings using AI analysis.

## Project info

**URL**: https://lovable.dev/projects/29a26ab3-0764-4fcd-8ca4-851a2301c5d1

## Features

- Analyzes job postings from LinkedIn, Indeed, Monster, and Glassdoor
- Identifies potential red flags in job descriptions
- Provides a safety score for job postings
- Shows company verification status
- Displays application metrics

## Building the Chrome Extension

To build the extension for Chrome, follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm i

# Step 4: Build the extension
node build-extension.js
```

The built extension will be available in the `dist` directory.

## Installing the Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked"
4. Select the `dist` folder from the build output

## Using the Extension

1. Navigate to a job posting on LinkedIn, Indeed, Monster, or Glassdoor
2. Click the JobSafe extension icon in your browser toolbar
3. Review the analysis, safety score, and red/green flags
4. Use this information to make an informed decision about the job posting

## Development

For development:

```sh
npm run dev
```

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/29a26ab3-0764-4fcd-8ca4-851a2301c5d1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
