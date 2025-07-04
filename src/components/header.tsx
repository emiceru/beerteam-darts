'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import Logo from '@/components/logo'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface HeaderProps {
  title?: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setIsLoggedIn(true)
          setUser(data.user)
        }
      } catch {
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleDashboard = () => {
    if (user?.role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignorar error
    }
    setIsLoggedIn(false)
    setUser(null)
    router.push('/')
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const navigationItems = [
    { name: 'Inicio', href: '/', icon: '🏠' },
    { name: 'Competiciones Públicas', href: '/public', icon: '🏆' },
  ]

  const userNavigationItems = user?.role === 'ADMIN' 
    ? [
        { name: 'Panel Admin', href: '/admin', icon: '⚙️' },
        { name: 'Gestionar Ligas', href: '/admin/leagues/create', icon: '🎯' },
        { name: 'Gestionar Partidos', href: '/admin/matches', icon: '⚽' },
        { name: 'Enlaces de Inscripción', href: '/admin/join-links', icon: '🔗' },
      ]
    : [
        { name: 'Mi Dashboard', href: '/dashboard', icon: '📊' },
      ]

  return (
    <header className="bg-gradient-to-r from-fuchsia-600 to-pink-600 shadow-lg">
      {/* Header fucsia Beer Team */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <Logo size="md" showText={false} />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white">
                  {title || 'Beer Team'}
                </h1>
                <p className="text-xs text-fuchsia-100">
                  {subtitle || 'Liga de Dardos'}
                </p>
              </div>
            </Link>
          </div>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-fuchsia-800 text-white'
                    : 'text-fuchsia-100 hover:text-white hover:bg-fuchsia-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Menú de usuario */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : isLoggedIn && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 bg-fuchsia-800 hover:bg-fuchsia-900 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium">
                      {user.role === 'ADMIN' ? 'Administrador' : 'Jugador'}
                    </p>
                    <p className="text-xs text-fuchsia-200 truncate max-w-32">
                      {user.name}
                    </p>
                  </div>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                    {userNavigationItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                    <hr className="my-2" />
                    <button
                      onClick={logout}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <span>🚪</span>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-fuchsia-100 hover:text-white text-sm font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-fuchsia-600 hover:bg-fuchsia-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Menú móvil toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:text-fuchsia-200 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-fuchsia-800 rounded-lg mt-2 mb-4">
            <div className="px-4 py-3 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-fuchsia-900 text-white'
                      : 'text-fuchsia-100 hover:text-white hover:bg-fuchsia-900'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}

              {isLoggedIn && user && (
                <>
                  <hr className="border-fuchsia-700 my-3" />
                  <div className="text-fuchsia-200 text-xs px-3 mb-2">
                    {user.role === 'ADMIN' ? 'Panel de Administrador' : 'Panel de Usuario'}
                  </div>
                  {userNavigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-fuchsia-100 hover:text-white hover:bg-fuchsia-900 transition-colors"
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 