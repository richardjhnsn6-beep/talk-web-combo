import React from 'react';
import { ExternalLink, Check } from 'lucide-react';

const Shop = () => {
  const products = [
    {
      id: 1,
      name: 'AI Chat Unlimited',
      price: '$9.99',
      billing: 'per month',
      description: 'Unlimited access to RJHNSN12 AI Assistant - Biblical Hebrew research expert powered by AI. Get instant answers about scripture, Hebrew translations, and biblical truth 24/7.',
      features: [
        'Unlimited AI conversations',
        'Biblical Hebrew expertise',
        '24/7 availability',
        'Scripture analysis',
        'Hebrew translation help'
      ],
      link: 'https://richardson0164.gumroad.com/l/xvpyprw',
      badge: 'Subscription',
      gradient: 'from-purple-600 to-blue-600'
    },
    {
      id: 2,
      name: 'Book of Amos',
      price: '$20',
      billing: 'one-time',
      description: "Richard Johnson's complete Hebrew-to-English translation of the Book of Amos with interlinear text, word-by-word analysis, and biblical commentary.",
      features: [
        'Complete translation',
        'Word-by-word analysis',
        'Biblical commentary',
        'Chapters 1-9 included',
        'Digital format (PDF)'
      ],
      link: 'https://richardson0164.gumroad.com/l/uilyf',
      badge: 'Digital Book',
      gradient: 'from-orange-600 to-red-600'
    },
    {
      id: 3,
      name: 'Book of Amos - Member Price',
      price: '$14',
      billing: 'one-time',
      description: "Richard Johnson's complete Hebrew-to-English translation of the Book of Amos with interlinear text, word-by-word analysis, and biblical commentary.",
      features: [
        'Complete translation',
        'Word-by-word analysis',
        'Biblical commentary',
        'Chapters 1-9 included',
        'Digital format (PDF)',
        '30% member discount'
      ],
      link: 'https://richardson0164.gumroad.com/l/osofkm',
      badge: 'Member Discount',
      gradient: 'from-green-600 to-teal-600'
    },
    {
      id: 4,
      name: 'Hebrew Scripture Manuscript',
      price: '$7',
      billing: 'one-time',
      description: "Hebrew scripture manuscript featuring authentic biblical text with detailed annotations and research notes from 40 years of Hebrew studies.",
      features: [
        'Authentic biblical text',
        'Detailed annotations',
        'Research notes',
        'Digital format',
        'Perfect for students'
      ],
      link: 'https://richardson0164.gumroad.com/l/samfke',
      badge: 'Manuscript',
      gradient: 'from-indigo-600 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            RJHNSN12 Shop
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            Access biblical Hebrew research, AI-powered scripture analysis, and authentic translations 
            from 40 years of dedicated study.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              {/* Badge */}
              <div className="mb-4">
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${product.gradient}`}>
                  {product.badge}
                </span>
              </div>

              {/* Product Name */}
              <h2 className="text-2xl font-bold text-white mb-2">
                {product.name}
              </h2>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{product.price}</span>
                <span className="text-gray-300 ml-2">/ {product.billing}</span>
              </div>

              {/* Description */}
              <p className="text-gray-300 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-200">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Buy Button */}
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full bg-gradient-to-r ${product.gradient} hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 text-center flex items-center justify-center gap-2`}
              >
                Buy Now
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white/5 backdrop-blur-lg border-t border-white/10 py-12">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-2xl font-bold text-white mb-4">
            Questions About Our Products?
          </h3>
          <p className="text-gray-300 mb-6">
            All products are digital and delivered instantly after purchase. 
            For questions or support, please contact us.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Shop;
