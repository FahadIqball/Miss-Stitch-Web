# Miss Stitch

A modern e-commerce and tailoring storefront for Pakistani fashion, built with Next.js and TypeScript. Miss Stitch showcases premium unstitched lawn, velvet formals, ready-to-wear suits, and bespoke tailoring services for customers in Pakistan and beyond.

Live demo: https://miss-stitch-web.vercel.app/

## Overview

Miss Stitch is designed as a luxury fashion commerce experience with a strong emphasis on:

- premium product presentation
- multi-category shopping journeys
- made-to-measure tailoring support
- customer trust and social proof
- fast, responsive browsing across desktop and mobile

The app combines storefront UI, product catalog browsing, interaction flows, and CMS-driven content configuration for a polished brand experience.

## Features

- Hero carousel and editorial-style landing page
- Category browsing and curated collection rails
- Live product catalog integration
- Dual price display / product pricing toggle
- Quick view modal and size chart support
- Shopping cart drawer and saved cart experience
- WhatsApp concierge / inquiry flow
- Authentication modal and user-aware interactions
- Tailoring education and process storytelling sections
- Review/testimonial sections for social proof
- Responsive design optimized for modern devices
- CMS-backed content and marketing data

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Zustand for state management
- Supabase for backend data support
- Resend for email delivery support
- Lucide React icons
- Vercel deployment

## Project Structure

```text
.
├── public/                  # Static assets and public files
├── src/
│   ├── app/                 # App Router pages, layouts, and actions
│   ├── components/         # Reusable UI components and sections
│   ├── data/               # Default CMS/content configuration
│   ├── lib/                # Utility logic and helpers
│   ├── store/              # App state/store modules
│   ├── types/              # Shared TypeScript types
│   └── ...
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── README.md
└── package-lock.json
```

## Getting Started

### Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+ or newer
- npm, pnpm, or yarn

### Install dependencies

```bash
git clone https://github.com/FahadIqball/Miss-Stitch-Web.git
cd Miss-Stitch-Web
npm install
```

### Run the development server

```bash
npm run dev
```

Then open: http://localhost:3000

## Production Build

```bash
npm run build
npm run start
```

## Environment Variables

If your local deployment or hosted setup uses environment variables, create a `.env.local` file in the project root and add the required values.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If this project uses additional keys for email, API calls, or analytics, add them here as needed.

## Screenshots

Add your final screenshots later in the `public` folder or an appropriate assets directory. The examples below are placeholders for now.

```md
![Homepage hero](/screenshots/homepage.png)
![Category section](/screenshots/categories.png)
![Product catalog](/screenshots/catalog.png)
![Tailoring process](/screenshots/tailoring-process.png)
```

Suggested structure for future screenshots:

```text
public/
├── screenshots/
│   ├── homepage.png
│   ├── categories.png
│   ├── catalog.png
│   ├── tailoring-process.png
│   └── mobile-view.png
```

## Deployment

This project is configured for deployment on Vercel.

### Deploy to Vercel

1. Push the repository to GitHub
2. Import the project into Vercel
3. Configure any required environment variables
4. Deploy the app

Live site: https://miss-stitch-web.vercel.app/

## Contributing

Contributions are welcome. If you want to improve the project:

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Open a pull request with a clear description

## License

This project does not currently specify a license. If you plan to make it public, add a license file and choose a license such as MIT.

## Contact

- GitHub: https://github.com/FahadIqball
- Project repository: https://github.com/FahadIqball/Miss-Stitch-Web

---

Built for a premium Pakistani fashion shopping experience with modern web technology.