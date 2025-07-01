import Link from 'next/link';
import { Target, Trophy, Users, ArrowRight, Star, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-beer-cream via-white to-beer-cream/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-beer-red/5 to-beer-gold/5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNEQzE0M0MiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="flex justify-center items-center mb-8">
              <div className="bg-gradient-to-r from-beer-red to-beer-gold p-4 rounded-full shadow-beer-lg">
                <Target className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-beer-red to-beer-gold bg-clip-text text-transparent">
                Beer Team
              </span>
              <br />
              <span className="text-gray-800">Darts League</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              La plataforma definitiva para gestionar tus ligas de dardos. 
              Crea torneos, gestiona participantes y compite con estilo.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/auth/register"
                className="bg-gradient-to-r from-beer-red to-beer-red/80 hover:from-beer-red/90 hover:to-beer-red/70 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-beer-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                Comenzar Ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link 
                href="/leagues"
                className="bg-white/80 backdrop-blur hover:bg-white text-gray-800 px-8 py-4 rounded-full font-semibold text-lg border border-gray-200 hover:border-beer-gold/50 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                Explorar Ligas
                <Trophy className="w-5 h-5 text-beer-gold" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-beer-red">500+</div>
                <div className="text-gray-600">Jugadores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-beer-red">50+</div>
                <div className="text-gray-600">Ligas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-beer-red">1000+</div>
                <div className="text-gray-600">Partidos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-beer-red">95%</div>
                <div className="text-gray-600">Satisfacción</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Beer Team Darts?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas profesionales diseñadas específicamente para jugadores de dardos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-beer-cream/30 to-white shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-beer-red to-beer-gold p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestión Completa</h3>
              <p className="text-gray-600">
                Administra ligas, participantes, calendarios y resultados desde una sola plataforma
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-beer-cream/30 to-white shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-beer-red to-beer-gold p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Comunidad Activa</h3>
              <p className="text-gray-600">
                Conecta con otros jugadores, forma equipos y participa en múltiples ligas
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-beer-cream/30 to-white shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-beer-red to-beer-gold p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tiempo Real</h3>
              <p className="text-gray-600">
                Estadísticas en vivo, notificaciones push y actualizaciones instantáneas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-beer-cream/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Empezar es muy fácil
            </h2>
            <p className="text-xl text-gray-600">
              En solo 3 pasos estarás listo para competir
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-beer-red text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Regístrate</h3>
              <p className="text-gray-600">
                Crea tu cuenta gratuita en menos de 1 minuto
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-beer-red text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Únete a una Liga</h3>
              <p className="text-gray-600">
                Explora ligas disponibles o crea la tuya propia
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-beer-red text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">¡A Competir!</h3>
              <p className="text-gray-600">
                Disfruta jugando y sigue tus estadísticas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-beer-red to-beer-red/90">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para dominar los dardos?
          </h2>
          <p className="text-xl text-beer-cream mb-8">
            Únete a la comunidad de jugadores más activa de España
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register"
              className="bg-white text-beer-red px-8 py-4 rounded-full font-semibold text-lg hover:bg-beer-cream transition-colors duration-300 flex items-center justify-center gap-2"
            >
              Registrarse Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link 
              href="/join/ejemplo-501-2024"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-beer-red transition-all duration-300 flex items-center justify-center gap-2"
            >
              Probar Liga Demo
              <Star className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-beer-red to-beer-gold p-2 rounded-full">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Beer Team Darts</span>
              </div>
              <p className="text-gray-400 max-w-md">
                La plataforma líder para gestionar ligas de dardos. 
                Creada por jugadores, para jugadores.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/leagues" className="hover:text-beer-gold transition-colors">Ligas</Link></li>
                <li><Link href="/auth/login" className="hover:text-beer-gold transition-colors">Iniciar Sesión</Link></li>
                <li><Link href="/auth/register" className="hover:text-beer-gold transition-colors">Registro</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:info@beerteam.com" className="hover:text-beer-gold transition-colors">Contacto</a></li>
                <li><Link href="/help" className="hover:text-beer-gold transition-colors">Ayuda</Link></li>
                <li><Link href="/privacy" className="hover:text-beer-gold transition-colors">Privacidad</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Beer Team Darts League Manager. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
