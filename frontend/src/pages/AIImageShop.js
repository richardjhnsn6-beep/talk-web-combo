import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AIImageShop = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // PLACEHOLDER PRODUCTS - You'll replace these with your actual AI-generated images
  const products = [
    {
      id: 1,
      title: "Garden of Eden",
      description: "Beautiful AI-generated biblical scene of the Garden of Eden with lush vegetation and divine light",
      category: "biblical_scenes",
      price: 7,
      imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", // PLACEHOLDER
      paypalLink: "https://www.paypal.com/ncp/payment/YOUR_LINK_HERE" // UPDATE with your PayPal button link
    },
    {
      id: 2,
      title: "Moses Parting the Red Sea",
      description: "Dramatic AI artwork showing Moses parting the Red Sea with divine power",
      category: "biblical_scenes",
      price: 10,
      imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80", // PLACEHOLDER
      paypalLink: "https://www.paypal.com/ncp/payment/YOUR_LINK_HERE"
    },
    {
      id: 3,
      title: "Hebrew Alphabet Poster",
      description: "Educational poster featuring the Hebrew alphabet with beautiful calligraphy",
      category: "educational",
      price: 12,
      imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80", // PLACEHOLDER
      paypalLink: "https://www.paypal.com/ncp/payment/YOUR_LINK_HERE"
    },
    {
      id: 4,
      title: "The Last Supper",
      description: "AI-reimagined biblical scene of the Last Supper with Jesus and his disciples",
      category: "biblical_scenes",
      price: 15,
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // PLACEHOLDER
      paypalLink: "https://www.paypal.com/ncp/payment/YOUR_LINK_HERE"
    },
    {
      id: 5,
      title: "David and Goliath",
      description: "Epic AI artwork depicting the biblical battle between David and Goliath",
      category: "biblical_scenes",
      price: 10,
      imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", // PLACEHOLDER
      paypalLink: "https://www.paypal.com/ncp/payment/YOUR_LINK_HERE"
    },
    {
      id: 6,
      title: "Psalm 23 Artwork",
      description: "Beautiful visual representation of Psalm 23 with peaceful shepherd imagery",
      category: "scripture_art",
      price: 8,
      imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80", // PLACEHOLDER
      paypalLink: "https://www.paypal.com/ncp/payment/YOUR_LINK_HERE"
    },
    {
      id: 7,
      title: "Godly Woman Teaching Child",
      description: "Warm AI-generated scene of a godly woman teaching Hebrew to a young child",
      category: "educational",
      price: 12,
      imageUrl: "https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=800&q=80", // PLACEHOLDER
      paypalLink: "https://www.paypal.com/ncp/payment/YOUR_LINK_HERE"
    },
    {
      id: 8,
      title: "Noah's Ark",
      description: "Majestic AI artwork of Noah's Ark with animals entering two by two",
      category: "biblical_scenes",
      price: 10,
      imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", // PLACEHOLDER
      paypalLink: "https://www.paypal.com/ncp/payment/YOUR_LINK_HERE"
    },
    {
      id: 9,
      title: "Proverbs 31 Woman",
      description: "Inspiring AI portrait representing the Proverbs 31 woman in biblical virtue",
      category: "scripture_art",
      price: 9,
      imageUrl: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80", // PLACEHOLDER
      paypalLink: "https://www.paypal.com/ncp/payment/YOUR_LINK_HERE"
    },
    {
      id: 10,
      title: "Book of Amos Illustration",
      description: "Artistic representation of themes from the Book of Amos with prophetic imagery",
      category: "scripture_art",
      price: 10,
      imageUrl: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&q=80", // PLACEHOLDER
      paypalLink: "https://www.paypal.com/ncp/payment/YOUR_LINK_HERE"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Images', icon: '🖼️' },
    { id: 'biblical_scenes', name: 'Biblical Scenes', icon: '⛪' },
    { id: 'scripture_art', name: 'Scripture Art', icon: '📖' },
    { id: 'educational', name: 'Educational', icon: '🎓' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 text-center">
              🎨 Biblical AI Art Gallery
            </h1>
            <p className="text-xl text-purple-200 text-center max-w-3xl mx-auto">
              High-quality AI-generated biblical artwork for your home, church, or study
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <span>✅</span>
                <span>Instant Download</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <span>🖨️</span>
                <span>Print Quality</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <span>💳</span>
                <span>Secure PayPal</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:border-purple-400 transition-all hover:shadow-2xl hover:shadow-purple-500/50"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden bg-black/30">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                  ${product.price}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-3">
                  {product.title}
                </h3>
                <p className="text-purple-200 mb-6 leading-relaxed">
                  {product.description}
                </p>

                {/* Buy Button */}
                <a
                  href={product.paypalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 px-6 rounded-xl text-center transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  💳 Buy Now with PayPal - ${product.price}
                </a>

                <p className="text-xs text-white/60 text-center mt-3">
                  Instant download after payment • High resolution • Print ready
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            📋 How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-xl font-bold text-white mb-2">Choose Your Art</h3>
              <p className="text-purple-200">
                Browse our collection of AI-generated biblical artwork
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-xl font-bold text-white mb-2">Secure Payment</h3>
              <p className="text-purple-200">
                Pay safely with PayPal - we never see your card details
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Download</h3>
              <p className="text-purple-200">
                Get your high-resolution image within 24 hours via email
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Need Help Section - AI Richard Integration */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            🤖 Need Help Choosing?
          </h2>
          <p className="text-xl text-white mb-6">
            Chat with AI Richard! He can help you find the perfect biblical artwork for your needs.
          </p>
          <p className="text-white/90 text-lg">
            Click the AI Richard chat widget in the bottom corner →
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">📧 Delivery & Usage Rights</h3>
          <ul className="text-purple-200 space-y-2">
            <li>✅ <strong>Delivery:</strong> Images sent via email within 24 hours of payment</li>
            <li>✅ <strong>Quality:</strong> High-resolution PNG/JPG files (3000x3000px minimum)</li>
            <li>✅ <strong>Usage:</strong> Personal use, church presentations, Bible studies, prints</li>
            <li>✅ <strong>Printing:</strong> Print-ready quality for posters, canvas, framing</li>
            <li>⚠️ <strong>Not for:</strong> Commercial resale or redistribution</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIImageShop;
