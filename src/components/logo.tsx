'use client'

import Image from 'next/image'

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

const sizePx = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96
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
  const LogoImage = () => (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <Image
        src="/logo.png"
        alt="Beer Team Logo"
        width={sizePx[size]}
        height={sizePx[size]}
        className="object-contain"
        priority
      />
    </div>
  )

  if (!showText) {
    return <LogoImage />
  }

  if (textPosition === 'bottom') {
    return (
      <div className="flex flex-col items-center gap-2">
        <LogoImage />
        {size !== 'sm' && (
          <div className="text-center">
            <h1 className={`font-bold text-red-600 ${textSizeClasses[size]}`}>Beer Team</h1>
            <p className="text-gray-600 text-sm">Liga de Dardos</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <LogoImage />
      {size !== 'sm' && (
        <div>
          <h1 className={`font-bold text-red-600 ${textSizeClasses[size]}`}>Beer Team</h1>
          <p className="text-gray-600 text-sm">Liga de Dardos</p>
        </div>
      )}
    </div>
  )
} 