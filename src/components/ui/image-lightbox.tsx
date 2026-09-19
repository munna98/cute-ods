'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'

interface ImageLightboxProps {
  src: string
  alt?: string
  className?: string
}

export function ImageLightbox({
  src,
  alt = 'Image preview',
  className = 'w-14 h-14 rounded-xl',
}: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`relative group overflow-hidden border border-border bg-card cursor-pointer shadow-2xs shrink-0 transition-transform active:scale-95 ${className}`}
        title="Click to view enlarged photo"
      >
        {/* eslint-disable-next-html-element-suppression */}
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-80 duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[90vh] bg-card rounded-3xl p-3 border border-border shadow-2xl overflow-hidden animate-in zoom-in-95"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-card/90 border border-border text-foreground hover:bg-muted transition-colors cursor-pointer shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* eslint-disable-next-html-element-suppression */}
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </>
  )
}
