# nextn

This project is a Next.js application for truck management. It allows users to add and manage transactions (including departure, arrival, and price details), view income dashboards, and add new trucks to the system.

## Version

0.1.0

## Prerequisites

Before you begin, ensure you have met the following requirements:
* Node.js (Check `package.json` for specific version requirements if any, otherwise latest LTS is recommended)
* npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd nextn
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   # yarn install
   ```

## Available Scripts

In the project directory, you can run the following commands:

### `npm run dev` or `yarn dev`
Runs the app in development mode on port 9002.
Open [http://localhost:9002](http://localhost:9002) to view it in the browser.
The page will reload if you make edits.

### `npm run genkit:dev` or `yarn genkit:dev`
Starts the Genkit development server using `src/ai/dev.ts`.

### `npm run genkit:watch` or `yarn genkit:watch`
Starts the Genkit development server with watch mode, recompiling `src/ai/dev.ts` on changes.

### `npm run build` or `yarn build`
Builds the app for production to the `.next` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run start` or `yarn start`
Starts the production server. Before running this, make sure you have built the project using `npm run build`.

### `npm run lint` or `yarn lint`
Runs Next.js's built-in ESLint configuration to lint the project files.

### `npm run typecheck` or `yarn typecheck`
Runs the TypeScript compiler to check for type errors in the project.

## Technologies Used

This project utilizes a variety of modern web development technologies, including:

*   **Framework:** Next.js
*   **AI Integration:** Genkit (with Google AI)
*   **UI Components:** Radix UI, Shadcn/UI (implied by `components.json` and `tailwind.config.ts`)
*   **Styling:** Tailwind CSS
*   **State Management/Data Fetching:** React Query, TanStack Query Firebase
*   **Forms:** React Hook Form, Zod (for validation)
*   **Database:** MongoDB, Mongoose
*   **Authentication/Backend:** Firebase
*   **Date Handling:** date-fns
*   **Icons:** Lucide React
*   **Charting:** Recharts
*   **Language:** TypeScript

## Project Structure

The project follows a standard Next.js application structure:

```
.
├── .gitignore
├── components.json
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tsconfig.json
├── data/
│   └── deliveries.json
├── docs/
│   └── blueprint.md
├── public/ (implicitly, Next.js standard, though not listed in provided files)
├── src/
│   ├── ai/
│   │   ├── dev.ts
│   │   ├── genkit.ts
│   │   └── flows/
│   │       └── suggest-price-per-kg.ts
│   ├── app/  (Next.js App Router)
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx (Homepage)
│   │   ├── api/ (API Routes)
│   │   │   ├── deliveries/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── vehicles/
│   │   │       └── route.ts
│   │   ├── log-delivery/
│   │   │   └── page.tsx
│   │   └── vehicles/
│   │       ├── page.tsx
│   │       └── new/
│   │           └── page.tsx
│   ├── components/ (React Components)
│   │   ├── DeliveryDashboard.tsx
│   │   ├── DeliveryForm.tsx
│   │   ├── Navbar.tsx
│   │   ├── SummaryCard.tsx
│   │   └── ui/ (Shadcn/UI components)
│   │       ├── accordion.tsx
│   │       ├── ... (other UI components)
│   ├── hooks/ (Custom React Hooks)
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── useLocalStorage.ts
│   ├── lib/ (Utility functions, libraries)
│   │   ├── mongodb.ts
│   │   └── utils.ts
│   ├── models/ (Database models/schemas)
│   │   ├── Delivery.ts
│   │   └── vehicle.ts
│   └── types/ (TypeScript type definitions)
│       ├── delivery.ts
│       └── vehicle.ts
```

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a Pull Request.

## License

This project is private. (Or specify a license like MIT if applicable)

---
*This README was auto-generated and can be further customized.*
