import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import TestConnection from './TestConnection';
import Home from './pages/Home';
import InformalLoanForm from './pages/loan/request/informal';
import FormalLoanForm from './pages/loan/request/formal';
import PastLoans from './pages/PastLoans';
import PayLoan from './pages/PayLoan';
import LoanPending from './pages/LoanPending';
import UploadPDF from './pages/uploadPDF';
import AssessMedicalNeeds from './pages/AssessMedicalNeeds';
import MedicineResults from './pages/MedicineResults';
import Dashboard from './pages/Dashboard';
import ReviewLoan from './pages/ReviewLoan';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/loan/request/informal" element={
            <ProtectedRoute>
              <InformalLoanForm />
            </ProtectedRoute>
          } />
          <Route path="/loan/request/formal" element={
            <ProtectedRoute>
              <FormalLoanForm />
            </ProtectedRoute>
          } />
          <Route path="/loan/pay" element={
            <ProtectedRoute>
              <PayLoan />
            </ProtectedRoute>
          } />
          <Route path="/loans" element={
            <ProtectedRoute>
              <PastLoans />
            </ProtectedRoute>
          } />
          <Route path="/loan/pending/:id" element={
            <ProtectedRoute>
              <LoanPending />
            </ProtectedRoute>
          } />
          <Route path="/assess-medical-needs" element={
            <ProtectedRoute>
              <AssessMedicalNeeds />
            </ProtectedRoute>
          } />
          <Route path="/medicine-results" element={
            <ProtectedRoute>
              <MedicineResults />
            </ProtectedRoute>
          } />
          <Route path="/test" element={
            <ProtectedRoute>
              <TestConnection />
            </ProtectedRoute>
          } />
          <Route path="/uploadPDF" element={
            <ProtectedRoute>
              <UploadPDF />
            </ProtectedRoute>
          } />
          
          {/* Admin Only Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute adminOnly>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/review/:id" element={
            <ProtectedRoute adminOnly>
              <ReviewLoan />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;