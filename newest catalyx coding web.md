# Catalyx Labs Hydroponic Nutrients E-Commerce Website

A modern, full-featured e-commerce platform built with **Next.js 14**, **React 18**, **TypeScript**, and **Tailwind CSS** for selling professional hydroponic nutrient solutions.

## 🚀 Features

- **Product Catalog**: Browse and filter products
- **Shopping Cart**: Add/remove items with Zustand state management
- **Blog**: Content management and articles
- **Team Showcase**: Display team members and portfolio
- **Contact Form**: Customer communication
- **Responsive Design**: Mobile-first approach
- **TypeScript**: Full type safety
- **Tailwind CSS**: Modern styling

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Auth.js (optional - add when stable)
- **Linting**: ESLint
- **Package Manager**: npm

## 📂 Project Structure

```text
.
├── app/                  # Next.js App Router
│   ├── api/             # API routes
│   ├── products/        # Products page
│   ├── blog/           # Blog page
│   ├── team/           # Team showcase
│   ├── contact/        # Contact form
│   ├── cart/           # Shopping cart
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/          # Reusable components
│   ├── Navbar.tsx      # Navigation header
│   └── Footer.tsx      # Footer component
├── lib/                 # Utilities and helpers
│   └── store.ts        # Zustand cart store
├── types/              # TypeScript type definitions
├── public/             # Static assets
├── styles/             # Additional stylesheets
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── next.config.js      # Next.js config
├── tailwind.config.ts  # Tailwind config
└── .eslintrc.json      # ESLint config
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit
```

The application will be available at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is in use)

## 📄 Available Pages

- **Home** (`/`) - Hero section with featured products
- **Products** (`/products`) - Product catalog
- **Blog** (`/blog`) - Blog articles
- **Team** (`/team`) - Team members showcase
- **Contact** (`/contact`) - Contact form
- **Cart** (`/cart`) - Shopping cart with summary

## 🎨 Customization

### Brand Colors

Edit `tailwind.config.ts` to customize brand colors:

```typescript
'catalyx-purple': '#6B46C1',
'catalyx-dark': '#1F2937',
```

### Product Data

Replace placeholder products in `/app/products/page.tsx` with your actual product data. ✅ **Catalyx Labs hydroponic nutrient lineup already added** including A-X PRO, B-X PRO, ROOT-X, VITAL-X, PK-X, RIPEN-X, MICRO-X, TRACE-X, IRON-X, and FLUSH-X.

### Team Members

Update team data in `/app/team/page.tsx` with your team information.

## 🔒 Security Considerations

- Implement proper authentication with Auth.js (when stable)
- Add payment processing (Stripe, PayPal)
- Validate form inputs on server-side
- Use environment variables for sensitive data
- Add CORS headers for API routes

## 📱 Responsive Design

The website is fully responsive with breakpoints for:

- Mobile: 320px
- Tablet: 768px (md)
- Desktop: 1024px+ (lg)

## 🚀 Deployment

Deploy to Vercel (recommended for Next.js):

```bash
npm install -g vercel
vercel
```

Or deploy to other platforms:

- AWS Amplify
- Netlify
- DigitalOcean
- Custom VPS

## 📝 Environment Variables

Create a `.env.local` file:

NEXT_PUBLIC_API_URL=<http://localhost:3000>

# AUTH_SECRET=your-secret-key  # Uncomment when adding Auth.js

# AUTH_TRUST_HOST=true        # Uncomment when adding Auth.js

```

## 🤝 Development Guidelines

- Use TypeScript for type safety
- Follow React best practices
- Keep components modular and reusable
- Use Next.js Image optimization for product images
- Implement proper error handling
- Add loading states for async operations
- Test components with your preferred testing framework

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Auth.js](https://authjs.dev/)

## 📞 Support

For issues or questions, please contact <support@catalyxlabs.com>

## 📄 License

Proprietary - Catalyx Labs © 2024

---

Happy coding! 🎉
