'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  textPosition?: 'right' | 'bottom'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
}

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl', 
  lg: 'text-2xl',
  xl: 'text-4xl'
}

export default function Logo({ 
  size = 'md', 
  showText = true, 
  textPosition = 'right',
  className = '' 
}: LogoProps) {
  const LogoSvg = () => (
    <svg viewBox="0 0 512 512" className={`${sizeClasses[size]} ${className}`}>
      {/* Fondo del escudo */}
      <path d="M256 50 L400 150 L400 400 L256 462 L112 400 L112 150 Z" fill="#000" stroke="#FFD700" strokeWidth="6"/>
      
      {/* Diana de dardos */}
      <circle cx="256" cy="220" r="140" fill="#000"/>
      <circle cx="256" cy="220" r="130" fill="#FFD700" stroke="#000" strokeWidth="3"/>
      <circle cx="256" cy="220" r="110" fill="#FFF8DC"/>
      <circle cx="256" cy="220" r="90" fill="#000"/>
      <circle cx="256" cy="220" r="70" fill="#FFF8DC"/>
      <circle cx="256" cy="220" r="50" fill="#000"/>
      <circle cx="256" cy="220" r="30" fill="#FFD700"/>
      <circle cx="256" cy="220" r="15" fill="#DC143C"/>
      
      {/* Líneas divisorias de la diana */}
      <g stroke="#000" strokeWidth="2" opacity="0.4">
        <line x1="256" y1="80" x2="256" y2="360"/>
        <line x1="116" y1="220" x2="396" y2="220"/>
        <line x1="157" y1="121" x2="355" y2="319"/>
        <line x1="355" y1="121" x2="157" y2="319"/>
      </g>
      
      {/* Jarra de cerveza */}
      <g transform="translate(256, 220)">
        {/* Cuerpo de la jarra */}
        <path d="M-25 -40 L-25 20 Q-25 30 -15 30 L15 30 Q25 30 25 20 L25 -40 Q25 -50 15 -50 L-15 -50 Q-25 -50 -25 -40 Z" fill="#FFA500" stroke="#000" strokeWidth="2"/>
        
        {/* Espuma */}
        <ellipse cx="0" cy="-45" rx="20" ry="8" fill="#FFF8DC"/>
        <circle cx="-8" cy="-50" r="4" fill="#FFF8DC"/>
        <circle cx="5" cy="-52" r="3" fill="#FFF8DC"/>
        <circle cx="12" cy="-48" r="3" fill="#FFF8DC"/>
        
        {/* Asa */}
        <path d="M25 -20 Q35 -20 35 -5 Q35 10 25 10" fill="none" stroke="#000" strokeWidth="3"/>
        
        {/* Lazo rojo decorativo */}
        <path d="M-20 -30 Q-30 -35 -25 -25 Q-20 -20 -15 -25 Q-10 -30 -15 -35 Q-20 -40 -25 -35 Q-30 -30 -20 -30" fill="#DC143C"/>
        <circle cx="-20" cy="-30" r="3" fill="#8B0000"/>
      </g>
      
      {/* Dardo atravesando */}
      <g transform="rotate(45 256 220)">
        {/* Punta del dardo */}
        <polygon points="180,220 200,215 200,225" fill="#C0C0C0"/>
        {/* Cuerpo del dardo */}
        <rect x="200" y="217" width="60" height="6" fill="#8B4513"/>
        {/* Plumas */}
        <polygon points="260,210 280,205 285,220 280,235 260,230" fill="#228B22"/>
        <polygon points="260,212 280,220 260,228" fill="#32CD32"/>
      </g>
      
      {/* Banner "BEER TEAM" */}
      <path d="M140 380 L372 380 Q382 380 382 390 L382 410 Q382 420 372 420 L140 420 Q130 420 130 410 L130 390 Q130 380 140 380 Z" fill="#FFD700" stroke="#000" strokeWidth="3"/>
      
      {/* Texto "BEER TEAM" */}
      {size !== 'sm' && (
        <text x="256" y="405" textAnchor="middle" fill="#000" fontFamily="Arial Black, sans-serif" fontSize="18" fontWeight="bold">BEER TEAM</text>
      )}
      
      {/* Estrellas decorativas */}
      <polygon points="100,395 102,401 108,401 103,405 105,411 100,407 95,411 97,405 92,401 98,401" fill="#DC143C"/>
      <polygon points="412,395 414,401 420,401 415,405 417,411 412,407 407,411 409,405 404,401 410,401" fill="#DC143C"/>
      
      {/* Escudo pequeño en el banner */}
      <g transform="translate(256, 440)">
        <path d="M0 -10 L8 -5 L8 5 L0 10 L-8 5 L-8 -5 Z" fill="#DC143C" stroke="#000" strokeWidth="1"/>
        <path d="M-4 -2 L0 -5 L4 -2 L2 2 L-2 2 Z" fill="#FFD700"/>
      </g>
    </svg>
  )

  if (!showText) {
    return <LogoSvg />
  }

  if (textPosition === 'bottom') {
    return (
      <div className="flex flex-col items-center gap-2">
        <LogoSvg />
        <div className="text-center">
          <h1 className={`font-bold text-red-600 ${textSizeClasses[size]}`}>Beer Team</h1>
          {size !== 'sm' && (
            <p className="text-gray-600 text-sm">Liga de Dardos</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <LogoSvg />
      <div>
        <h1 className={`font-bold text-red-600 ${textSizeClasses[size]}`}>Beer Team</h1>
        {size !== 'sm' && (
          <p className="text-gray-600 text-sm">Liga de Dardos</p>
        )}
      </div>
    </div>
  )
} 