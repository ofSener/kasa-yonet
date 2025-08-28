'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { Trash2, Edit, MoreHorizontal } from 'lucide-react'

interface SwipeAction {
  label: string
  icon: React.ComponentType<any>
  color: string
  action: () => void
}

interface SwipeableCardProps {
  children: ReactNode
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  className?: string
}

export function SwipeableCard({ 
  children, 
  leftActions = [], 
  rightActions = [],
  className = '' 
}: SwipeableCardProps) {
  const [offsetX, setOffsetX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const currentX = e.touches[0].clientX
    const diff = currentX - startX
    
    // Limit swipe distance
    const maxSwipe = 120
    const clampedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff))
    setOffsetX(clampedDiff)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    
    // Snap to action or return to center
    const threshold = 60
    if (Math.abs(offsetX) > threshold) {
      // Show actions
      setOffsetX(offsetX > 0 ? 80 : -80)
    } else {
      // Return to center
      setOffsetX(0)
    }
  }

  const handleActionClick = (action: SwipeAction) => {
    action.action()
    setOffsetX(0) // Reset position after action
  }

  return (
    <div className="relative overflow-hidden">
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 h-full flex">
          {leftActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={`flex items-center justify-center w-20 h-full ${action.color} text-white transition-all`}
              style={{ transform: `translateX(${Math.min(0, offsetX)}px)` }}
            >
              <action.icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 h-full flex">
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={`flex items-center justify-center w-20 h-full ${action.color} text-white transition-all`}
              style={{ transform: `translateX(${Math.max(0, -offsetX)}px)` }}
            >
              <action.icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      )}

      {/* Main card */}
      <div
        ref={cardRef}
        className={`bg-white transition-transform duration-200 ease-out ${className}`}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

// Pre-configured swipeable transaction card
interface SwipeableTransactionCardProps {
  children: ReactNode
  onEdit: () => void
  onDelete: () => void
  className?: string
}

export function SwipeableTransactionCard({ 
  children, 
  onEdit, 
  onDelete, 
  className = '' 
}: SwipeableTransactionCardProps) {
  const leftActions: SwipeAction[] = [
    {
      label: 'Düzenle',
      icon: Edit,
      color: 'bg-blue-500',
      action: onEdit
    }
  ]

  const rightActions: SwipeAction[] = [
    {
      label: 'Sil',
      icon: Trash2,
      color: 'bg-red-500',
      action: onDelete
    }
  ]

  return (
    <SwipeableCard
      leftActions={leftActions}
      rightActions={rightActions}
      className={className}
    >
      {children}
    </SwipeableCard>
  )
}