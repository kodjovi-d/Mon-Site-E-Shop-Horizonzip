import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const selectedImage = images[selectedIndex] || images[0]

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-warm-beige rounded-xl flex items-center justify-center">
        <p className="text-gray-400">Aucune image disponible</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div
        className="relative aspect-square bg-white rounded-xl overflow-hidden cursor-zoom-in group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <img
          src={selectedImage}
          alt={`${productName} — Vue ${selectedIndex + 1}`}
          className={`w-full h-full object-cover transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}
        />

        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={20} className="text-anthracite" />
        </div>

        {images.length > 1 && (
          <>
            <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Indicateurs mobile */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 md:hidden">
          {images.map((_, idx) => (
            <div key={idx} className={`w-2 h-2 rounded-full ${idx === selectedIndex ? 'bg-cta-green' : 'bg-white/60'}`} />
          ))}
        </div>
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${idx === selectedIndex ? 'border-cta-green' : 'border-transparent hover:border-sage'}`}
            >
              <img src={image} alt={`Miniature ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
