# Loan Application Frontend

A React TypeScript web application for loan requests, built for both formal and informal sector workers.

## Features

- **Home Screen**: Navigation to loan request and payment options
- **Sector Selection**: Choose between formal and informal sector loan applications
- **Loan Request Forms**: 
  - Informal sector: Asset uploads, bank account verification, permissions
  - Formal sector: Additional requirements for bank statements and salary payslips
- **Asset Uploader**: Multi-image upload with simulated value checking and license requirements
- **Document Management**: Upload and manage various document types
- **Loan Status Tracking**: Timeline view of application progress
- **Payment System**: View and pay active loans
- **Loan History**: View past loan applications and details

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **React Query** for data fetching and caching
- **Axios** for API requests
- **Vite** for build tooling

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

## Installation

1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── forms/
│   │   ├── InformalLoanForm.tsx
│   │   ├── FormalLoanForm.tsx
│   │   └── GuarantorFields.tsx
│   └── ui/
│       ├── AssetUploader.tsx
│       ├── DocumentUploader.tsx
│       ├── Modal.tsx
│       ├── PermissionToggle.tsx
│       └── SectorSelectModal.tsx
├── pages/
│   ├── Home.tsx
│   ├── PayLoan.tsx
│   ├── LoanPending.tsx
│   ├── PastLoans.tsx
│   └── loan/
│       └── request/
│           ├── informal.tsx
│           └── formal.tsx
├── api/
│   ├── axios.ts
│   ├── submitform.ts
│   └── message.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

## API Integration

The application connects to a backend API running at `http://localhost:5000/api` with the following endpoints:

- `POST /api/submitform` - Submit loan application
- `POST /api/message` - Send messages

## Form Validation

The application includes comprehensive form validation:

- Minimum 3 asset images required
- Future repayment dates only
- Required guarantor information (2 guarantors)
- File type and size validation
- Sector-specific document requirements

## Mock Features

Some features are simulated for demonstration:

- Asset value checking
- File upload processing
- Loan status timeline
- Payment processing
- SMS/Call log permissions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.