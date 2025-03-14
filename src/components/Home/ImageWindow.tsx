import { useState, useEffect } from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ImageWindowProps {
  srcList: string[]
  title: string
  className?: string
  width?: number
  height?: number
  onClose: () => void
}

export function ImageWindow({
  srcList,
  title,
  className,
  width = 300,
  height = 200,
  onClose,
}: ImageWindowProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({
    x: 20,
    y: window.innerHeight - height - 52,
  })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setPosition({
      x: window.innerWidth - width - 20, // 20px padding from right edge
      y: window.innerHeight - height - 52,
    })
  }, [height, width])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  useEffect(() => {
    if (srcList) {
      setCurrentIndex(0)
    }
  }, [srcList])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()

    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleImageError = () => {
    if (currentIndex < srcList.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      console.error("All images failed to load")
      onClose()
    }
  }

  return (
    <div
      className={cn(
        "fixed z-50 shadow-lg rounded-md overflow-hidden border border-border bg-background",
        isDragging && "select-none",
        className
      )}
      style={{
        top: position.y,
        left: position.x,
        width: width,
        height: height + 32,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="h-8 bg-muted flex items-center justify-between px-2 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="text-xs font-medium truncate">{title}</div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="relative w-full h-full">
        <img
          src={srcList[currentIndex] || "https://placehold.co/300x200"}
          onError={handleImageError}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
