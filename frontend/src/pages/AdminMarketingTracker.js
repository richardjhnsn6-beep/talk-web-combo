import React, { useState, useEffect } from 'react';

const AdminMarketingTracker = () => {
  const [marketingData, setMarketingData] = useState({
    tiktok: [],
    instagram: [],
    facebook: [],
    twitter: []
  });

  // Initialize with all 35 posts
  useEffect(() => {
    const savedData = localStorage.getItem('marketing_tracker');
    if (savedData) {
      setMarketingData(JSON.parse(savedData));
    } else {
      // Initialize default data
      setMarketingData({
        tiktok: [
          { id: 1, title: '"In the Beginning" MIStranslated Hook', posted: false, date: '', link: '', views: 0 },
          { id: 2, title: 'Testimony: "From Struggle to Scholar"', posted: false, date: '', link: '', views: 0 },
          { id: 3, title: '24/7 Radio Station Promo', posted: false, date: '', link: '', views: 0 },
          { id: 4, title: 'Book Flip-Through (Barashath)', posted: false, date: '', link: '', views: 0 },
          { id: 5, title: 'Spanish Version Promo', posted: false, date: '', link: '', views: 0 }
        ],
        instagram: [
          { id: 1, title: 'TRUE Hebrew Translation', posted: false, date: '', link: '', engagement: 0 },
          { id: 2, title: 'KNOW THYSELF - Self Discovery', posted: false, date: '', link: '', engagement: 0 },
          { id: 3, title: 'Spanish: Libro en Español', posted: false, date: '', link: '', engagement: 0 },
          { id: 4, title: 'SUBSTANTIAL SCHOLARSHIP', posted: false, date: '', link: '', engagement: 0 },
          { id: 5, title: 'What does Genesis ACTUALLY say?', posted: false, date: '', link: '', engagement: 0 },
          { id: 6, title: 'THE COMPLETE COLLECTION', posted: false, date: '', link: '', engagement: 0 },
          { id: 7, title: 'RADIO + BOOKS', posted: false, date: '', link: '', engagement: 0 },
          { id: 8, title: 'UNLOCK INNER WISDOM', posted: false, date: '', link: '', engagement: 0 },
          { id: 9, title: 'MAINSPRING BOOKS', posted: false, date: '', link: '', engagement: 0 },
          { id: 10, title: 'FOR SERIOUS STUDENTS', posted: false, date: '', link: '', engagement: 0 }
        ],
        facebook: [
          { id: 1, title: 'Discover TRUE Hebrew in Genesis', posted: false, date: '', link: '', reach: 0 },
          { id: 2, title: 'Know Thyself - Inner Wisdom', posted: false, date: '', link: '', reach: 0 },
          { id: 3, title: 'Sabiduría en español', posted: false, date: '', link: '', reach: 0 },
          { id: 4, title: '538 PAGES of biblical scholarship', posted: false, date: '', link: '', reach: 0 },
          { id: 5, title: 'What if "In the Beginning" means deeper?', posted: false, date: '', link: '', reach: 0 },
          { id: 6, title: '5 BOOKS of Hebrew translations', posted: false, date: '', link: '', reach: 0 },
          { id: 7, title: 'RJHNSN12 Radio 24/7', posted: false, date: '', link: '', reach: 0 },
          { id: 8, title: 'Know Thyself - Ancient wisdom', posted: false, date: '', link: '', reach: 0 },
          { id: 9, title: 'MainSpring Books - Hebrew accuracy', posted: false, date: '', link: '', reach: 0 },
          { id: 10, title: 'What Genesis REALLY says', posted: false, date: '', link: '', reach: 0 }
        ],
        twitter: [
          { id: 1, title: '"In the Beginning" - Hebrew truth', posted: false, date: '', link: '', impressions: 0 },
          { id: 2, title: '20-letter Hebrew alphabet', posted: false, date: '', link: '', impressions: 0 },
          { id: 3, title: '5 books - Hebrew research', posted: false, date: '', link: '', impressions: 0 },
          { id: 4, title: 'Know Thyself - Unlock wisdom', posted: false, date: '', link: '', impressions: 0 },
          { id: 5, title: 'Conócete a Ti Mismo', posted: false, date: '', link: '', impressions: 0 },
          { id: 6, title: '538 pages - Original Hebrew', posted: false, date: '', link: '', impressions: 0 },
          { id: 7, title: 'RJHNSN12 Radio + Books', posted: false, date: '', link: '', impressions: 0 },
          { id: 8, title: 'Genesis filtered vs ORIGINAL', posted: false, date: '', link: '', impressions: 0 },
          { id: 9, title: 'Ancient Hebrew names', posted: false, date: '', link: '', impressions: 0 },
          { id: 10, title: 'Knowledge within you', posted: false, date: '', link: '', impressions: 0 }
        ]
      });
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('marketing_tracker', JSON.stringify(marketingData));
  }, [marketingData]);

  const togglePosted = (platform, id) => {
    setMarketingData(prev => ({
      ...prev,
      [platform]: prev[platform].map(item =>
        item.id === id
          ? { ...item, posted: !item.posted, date: !item.posted ? new Date().toLocaleDateString() : '' }
          : item
      )
    }));
  };

  const updateLink = (platform, id, link) => {
    setMarketingData(prev => ({
      ...prev,
      [platform]: prev[platform].map(item =>
        item.id === id ? { ...item, link } : item
      )
    }));
  };

  const updateMetric = (platform, id, metric, value) => {
    setMarketingData(prev => ({
      ...prev,
      [platform]: prev[platform].map(item =>
        item.id === id ? { ...item, [metric]: parseInt(value) || 0 } : item
      )
    }));
  };

  const calculateProgress = (platform) => {
    const data = marketingData[platform];
    const posted = data.filter(item => item.posted).length;
    const total = data.length;
    const percentage = (posted / total * 100).toFixed(0);
    return { posted, total, percentage };
  };

  const calculateTotalProgress = () => {
    let totalPosted = 0;
    let totalItems = 0;
    Object.keys(marketingData).forEach(platform => {
      const { posted, total } = calculateProgress(platform);
      totalPosted += posted;
      totalItems += total;
    });
    const percentage = (totalPosted / totalItems * 100).toFixed(0);
    return { posted: totalPosted, total: totalItems, percentage };
  };

  const PlatformSection = ({ platform, title, icon, metricName }) => {
    const { posted, total, percentage } = calculateProgress(platform);
    const data = marketingData[platform];

    return (
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-700/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
          </div>
          <div className="text-right">
            <div className="text-purple-300 text-sm">Progress</div>
            <div className="text-white font-bold text-xl">{posted}/{total}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-4 mb-6">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {/* Posts List */}
        <div className="space-y-3">
          {data.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border transition-all ${
                item.posted
                  ? 'bg-green-900/20 border-green-500/50'
                  : 'bg-slate-700/30 border-slate-600/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.posted}
                  onChange={() => togglePosted(platform, item.id)}
                  className="mt-1 w-5 h-5 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-white font-semibold mb-2">{item.title}</div>
                  
                  {item.posted && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <span className="text-purple-300 text-sm">Posted:</span>
                        <span className="text-white text-sm">{item.date}</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Paste link here..."
                        value={item.link}
                        onChange={(e) => updateLink(platform, item.id, e.target.value)}
                        className="w-full bg-slate-900/50 text-white px-3 py-2 rounded border border-purple-700/30 text-sm"
                      />
                      <div className="flex gap-2 items-center">
                        <span className="text-purple-300 text-sm">{metricName}:</span>
                        <input
                          type="number"
                          value={item[metricName.toLowerCase()] || 0}
                          onChange={(e) => updateMetric(platform, item.id, metricName.toLowerCase(), e.target.value)}
                          className="w-24 bg-slate-900/50 text-white px-3 py-1 rounded border border-purple-700/30 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalProgress = calculateTotalProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">📡 Marketing Deployment Radar</h1>
          <p className="text-purple-200 text-lg">Track your social media campaigns across all platforms</p>
        </div>

        {/* Total Progress */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-12 text-center">
          <div className="text-white text-6xl font-bold mb-2">{totalProgress.percentage}%</div>
          <div className="text-white text-xl mb-4">Total Deployment Progress</div>
          <div className="text-purple-100 text-lg">
            {totalProgress.posted} of {totalProgress.total} posts deployed
          </div>
        </div>

        {/* Platform Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PlatformSection
            platform="tiktok"
            title="TikTok"
            icon="📱"
            metricName="Views"
          />
          <PlatformSection
            platform="instagram"
            title="Instagram"
            icon="📷"
            metricName="Engagement"
          />
          <PlatformSection
            platform="facebook"
            title="Facebook"
            icon="📘"
            metricName="Reach"
          />
          <PlatformSection
            platform="twitter"
            title="Twitter/X"
            icon="🐦"
            metricName="Impressions"
          />
        </div>

        {/* URLs Reference */}
        <div className="mt-12 bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-700/30">
          <h3 className="text-2xl font-bold text-white mb-4">🔗 Your URLs to Use in Posts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-purple-300 text-sm">Books Page</div>
              <div className="text-white font-mono text-sm bg-slate-900/50 p-2 rounded">
                {window.location.origin}/books
              </div>
            </div>
            <div>
              <div className="text-purple-300 text-sm">Radio Page</div>
              <div className="text-white font-mono text-sm bg-slate-900/50 p-2 rounded">
                {window.location.origin}/radio
              </div>
            </div>
            <div>
              <div className="text-purple-300 text-sm">Book of Amos</div>
              <div className="text-white font-mono text-sm bg-slate-900/50 p-2 rounded">
                {window.location.origin}/book-of-amos
              </div>
            </div>
            <div>
              <div className="text-purple-300 text-sm">Barnes & Noble</div>
              <div className="text-white font-mono text-sm bg-slate-900/50 p-2 rounded">
                [Add your B&N link]
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMarketingTracker;
