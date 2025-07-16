'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

// Sample gallery images (in a real app, these would come from your backend)
const galleryImages = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=800&fit=crop&crop=face',
    alt: 'Classic Gentleman\'s Cut',
    category: 'cuts'
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=800&fit=crop&crop=face',
    alt: 'Modern Fade Style',
    category: 'cuts'
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop',
    alt: 'Traditional Hot Towel Shave',
    category: 'shaves'
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1559833044-1b8e0e6cf898?w=600&h=800&fit=crop&crop=face',
    alt: 'Textured Crop Cut',
    category: 'cuts'
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?w=600&h=600&fit=crop',
    alt: 'Precision Beard Trim',
    category: 'shaves'
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=600&h=800&fit=crop&crop=face',
    alt: 'Executive Style',
    category: 'cuts'
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop',
    alt: 'Vintage Barber Tools',
    category: 'shop'
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop',
    alt: 'Luxury Barber Chair',
    category: 'shop'
  }
]

const categories = [
  { id: 'all', name: 'All Work' },
  { id: 'cuts', name: 'Cuts' },
  { id: 'shaves', name: 'Shaves' },
  { id: 'shop', name: 'Our Shop' }
]

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory)

  const selectedImageData = selectedImage ? galleryImages.find(img => img.id === selectedImage) : null

  const nextImage = () => {
    if (selectedImage) {
      const currentIndex = galleryImages.findIndex(img => img.id === selectedImage)
      const nextIndex = (currentIndex + 1) % galleryImages.length
      setSelectedImage(galleryImages[nextIndex].id)
    }
  }

  const prevImage = () => {
    if (selectedImage) {
      const currentIndex = galleryImages.findIndex(img => img.id === selectedImage)
      const prevIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1
      setSelectedImage(galleryImages[prevIndex].id)
    }
  }

  return (
    <section id="gallery" className="py-20 bg-slate-900/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
            Our Gallery
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            Discover the artistry and craftsmanship that defines WizCuts. Every cut tells a story of precision and style.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="group relative overflow-hidden rounded-2xl bg-slate-800/30 cursor-pointer"
                onClick={() => setSelectedImage(image.id)}
              >
                <div className="aspect-square relative">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-semibold text-lg">{image.alt}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {selectedImage && selectedImageData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-4xl max-h-[90vh] bg-slate-800 rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
                  aria-label="Close gallery"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Navigation Buttons */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Image */}
                <div className="relative max-h-[70vh]">
                  <Image
                    src={selectedImageData.src}
                    alt={selectedImageData.alt}
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                </div>

                {/* Image Info */}
                <div className="p-6 bg-slate-800">
                  <h3 className="text-xl font-semibold text-white mb-2">{selectedImageData.alt}</h3>
                  <p className="text-slate-300 capitalize">{selectedImageData.category}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
