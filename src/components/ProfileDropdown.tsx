import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Home, FileText, BarChart3, LogOut, ChevronDown } from 'lucide-react'

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-200"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-110 transition-transform">
          {user?.email ? getInitials(user.email) : 'U'}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-slide-down">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                {user?.email ? getInitials(user.email) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">Signed in as</p>
                <p className="text-sm text-gray-900 font-semibold truncate">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-flex items-center mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              onClick={() => {
                navigate('/')
                setIsOpen(false)
              }}
              className="group w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-all duration-200 rounded-lg mx-2"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-100 group-hover:scale-110 transition-all">
                <Home className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
              </div>
              <span className="font-medium">Home</span>
            </button>
            <button
              onClick={() => {
                navigate('/dashboard')
                setIsOpen(false)
              }}
              className="group w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-all duration-200 rounded-lg mx-2"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-100 group-hover:scale-110 transition-all">
                <BarChart3 className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
              </div>
              <span className="font-medium">Dashboard</span>
            </button>
            <button
              onClick={() => {
                navigate('/loans')
                setIsOpen(false)
              }}
              className="group w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-all duration-200 rounded-lg mx-2"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-100 group-hover:scale-110 transition-all">
                <FileText className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
              </div>
              <span className="font-medium">My Loans</span>
            </button>
          </div>

          <div className="border-t border-gray-100 pt-2 mt-2">
            <button
              onClick={handleSignOut}
              className="group w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center transition-all duration-200 rounded-lg mx-2"
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 group-hover:scale-110 transition-all">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown