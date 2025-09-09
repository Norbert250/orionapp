import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ProfileDropdown from './ProfileDropdown'
import { Heart, Home, FileText, DollarSign, History, Menu, X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const Navbar = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!user) return null

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/loan/pay', label: 'Pay Loan', icon: DollarSign },
    { path: '/loans', label: 'History', icon: History },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-600">LoanApp</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Financial Solutions</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* User Info & Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <span className="text-sm text-gray-500">Welcome back,</span>
              <span className="ml-1 font-semibold text-gray-900">
                {user?.email?.split('@')[0]}
              </span>
            </div>
            <div className="hidden md:block">
              <ProfileDropdown />
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-2">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
              <div className="border-t border-gray-100 pt-2 mt-2">
                <ProfileDropdown />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar