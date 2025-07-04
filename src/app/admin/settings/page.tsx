'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'

export default function AdminSettings() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login')
          return
        }
        const data = await response.json()
        
        if (data.user.role !== 'ADMIN') {
          router.push('/dashboard')
          return
        }
        
        setCurrentUser(data.user)
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuraciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header title="Configuración del Sistema" subtitle="Gestiona las configuraciones de la plataforma" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/admin" className="text-gray-700 hover:text-gray-900">
                Panel Admin
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="text-gray-400">/</span>
                <span className="ml-1 text-gray-500 md:ml-2">Configuración</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Información del Sistema */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-xl mr-2">🖥️</span>
                Información del Sistema
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Versión:</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Framework:</span>
                  <span className="font-medium">Next.js 15.3.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Base de datos:</span>
                  <span className="text-green-600 font-medium">✅ PostgreSQL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="text-green-600 font-medium">✅ Operativo</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-xl mr-2">🏆</span>
                Tipos de Competición
              </h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Cricket</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">501</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Modalidades: Individual, Parejas, Equipos
                </div>
              </div>
            </div>
          </div>

          {/* Configuraciones */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-xl mr-2">⚙️</span>
                Funcionalidades
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">🌐</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Ligas Públicas</h4>
                      <p className="text-sm text-gray-500">Visible sin autenticación</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">👥</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Registro Abierto</h4>
                      <p className="text-sm text-gray-500">Nuevos usuarios pueden registrarse</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📊</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Estadísticas</h4>
                      <p className="text-sm text-gray-500">Análisis y reportes</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-xl mr-2">🚀</span>
                Herramientas
              </h3>
              <div className="space-y-3">
                <Link 
                  href="/api/health"
                  className="block w-full text-left p-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">🩺</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Estado del Sistema</h4>
                      <p className="text-sm text-gray-500">Diagnóstico completo</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/admin"
                  className="block w-full text-left p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📊</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Panel Principal</h4>
                      <p className="text-sm text-gray-500">Volver al dashboard</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 