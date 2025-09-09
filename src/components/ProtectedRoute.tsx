import { useAuth } from '../contexts/AuthContext'
import Navbar from './Navbar'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { isAdmin } = useAuth()

  // Block regular users from accessing admin routes
  if (adminOnly && !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is restricted to administrators only.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </>
  )
}

export default ProtectedRoute