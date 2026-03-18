const Podcast = () => {
  const episodes = [
    {
      id: 1,
      title: "Hebrew Torah Teachings - Episode 1",
      description: "Exploring the Hebrew writings of the Torah and revealing truth through ancient wisdom.",
      videoUrl: "https://www.youtube.com/embed/cCwKGVOaW1Y",
      date: "2024"
    },
    {
      id: 2,
      title: "Shaka Zulu 1816 - Historical Truth",
      description: "Understanding Shaka Zulu's coronation in 1816 and the connection to biblical prophecy from Deuteronomy 33:20-21.",
      videoUrl: "https://www.youtube.com/embed/YUXCWUjCiUE",
      date: "2024"
    },
    {
      id: 3,
      title: "Louis Farrakhan - Black People in the Bible",
      description: "Important teachings about where Black people appear in the Bible and God's love for His people.",
      videoUrl: "https://www.youtube.com/embed/09w-ZFasRvE",
      date: "2024"
    },
    {
      id: 4,
      title: "Pastor Ray Hagins - Egypt (Kemet) Ancient Wisdom",
      description: "The source of the Bible from ancient Egypt (Kemet), understanding the ancient name meaning 'black'.",
      videoUrl: "https://www.youtube.com/embed/U_2QiZV_xEU",
      date: "2024"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" data-testid="podcast-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 py-8 px-8 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 text-center" data-testid="page-title">
          Rjhnsn12 - Biblical Truth Podcast
        </h1>
        <p className="text-center text-white mt-3 text-lg">
          Teachings on Hebrew Torah, Biblical History, and Ancient Wisdom
        </p>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-teal-800 mb-4" data-testid="intro-title">
            Welcome to Our Biblical Podcast
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Explore profound teachings about Hebrew writings, biblical truth, and the connection between 
            ancient wisdom and Black heritage. Each episode brings you closer to understanding the true 
            teachings of the Torah and the presence of Black people throughout biblical history.
          </p>
        </div>

        {/* Episodes List */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-teal-800 mb-6" data-testid="episodes-title">
            Podcast Episodes
          </h2>

          {episodes.map((episode) => (
            <div 
              key={episode.id} 
              className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl transition-shadow"
              data-testid={`episode-${episode.id}`}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-teal-800">
                    Episode {episode.id}: {episode.title}
                  </h3>
                  <span className="text-sm text-gray-500">{episode.date}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {episode.description}
                </p>
              </div>

              {/* Video Player */}
              <div className="max-w-2xl mx-auto">
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                    src={episode.videoUrl}
                    title={episode.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-teal-700 to-teal-600 rounded-lg p-8 text-white text-center shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Subscribe for More Episodes</h3>
          <p className="text-lg mb-6">
            Stay updated with new teachings and biblical insights. Contact us to learn more about 
            Hebrew Torah truth and ancient wisdom.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-white text-teal-700 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
            data-testid="contact-link"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default Podcast;
