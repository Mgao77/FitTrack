import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { invokeFunction } from '../../lib/invokeFunction'
import type { ClaudeVisionFoodItem } from '../../types'


interface PhotoCaptureProps {
  onIdentified: (items: ClaudeVisionFoodItem[]) => void
}

export default function PhotoCapture({ onIdentified }: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setAnalyzing(true)
    setError(null)
    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const base64 = btoa(binary)
      const mediaType = (file.type as 'image/jpeg' | 'image/png' | 'image/webp') || 'image/jpeg'

      const items = await invokeFunction<ClaudeVisionFoodItem[]>('analyze-meal-photo', {
        imageBase64: base64,
        mediaType,
      })
      onIdentified(items)
    } catch (e) {
      setError('Failed to analyze photo. Please try again or add foods manually.')
    }
    setAnalyzing(false)
  }

  return (
    <div>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={analyzing}
        className="flex items-center gap-3 bg-bg-elevated border border-border
          px-4 py-3 rounded-xl w-full active:opacity-70 disabled:opacity-50"
      >
        <Camera size={20} className="text-text-secondary flex-shrink-0" />
        <span className="text-text-secondary text-sm">
          {analyzing ? 'Analyzing photo...' : 'Analyze meal photo with AI'}
        </span>
      </button>
      {error && <p className="text-accent-warning text-xs mt-2">{error}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = '' // allow re-selecting same file
        }}
      />
    </div>
  )
}
