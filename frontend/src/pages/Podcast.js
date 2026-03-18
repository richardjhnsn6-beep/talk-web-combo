const Podcast = () => {
  const episodes = [
    {
      id: 1,
      title: "Hebrew Torah Teachings",
      description: "Exploring the Hebrew writings of the Torah and revealing truth through ancient wisdom.",
      pageLink: "/",
      videoUrl: "https://www.youtube.com/embed/cCwKGVOaW1Y"
    },
    {
      id: 2,
      title: "Shaka Zulu 1816 - Historical Truth",
      description: "Understanding Shaka Zulu's coronation in 1816 and the connection to biblical prophecy from Deuteronomy 33:20-21.",
      pageLink: "/page-two",
      videoUrl: "https://www.youtube.com/embed/YUXCWUjCiUE"
    },
    {
      id: 3,
      title: "Louis Farrakhan - Black People in the Bible",
      description: "Important teachings about where Black people appear in the Bible and God's love for His people.",
      pageLink: "/page-three",
      videoUrl: "https://www.youtube.com/embed/09w-ZFasRvE"
    },
    {
      id: 4,
      title: "Pastor Ray Hagins - Egypt (Kemet) Ancient Wisdom",
      description: "The source of the Bible from ancient Egypt (Kemet), understanding the ancient name meaning 'black'.",
      pageLink: "/page-three",
      videoUrl: "https://www.youtube.com/embed/U_2QiZV_xEU"
    },
    {
      id: 5,
      title: "Serapis Christus - The Truth Revealed",
      description: "Mix clips featuring Louis Farrakhan and Dr. Ray Hagins discussing Serapis Christus and biblical history.",
      pageLink: "/page-four",
      videoUrl: "https://drive.google.com/file/d/1jhWW95o0xKU39bABm0SOEIGeEASsABWQ/preview"
    },
    {
      id: 6,
      title: "Movement - Who is Israel?",
      description: "Rodney King, police brutality, Black lives lost. Hebrew documentation with Lil Wayne and Game music.",
      pageLink: "/page-five",
      videoUrl: "https://drive.google.com/file/d/12kQtEILC5NjqQIfSANnHa6YxuZsht_aG/preview"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" data-testid="podcast-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 py-8 px-8 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 text-center" data-testid="page-title">
          RJHNSN12 - Biblical Truth Video Podcast
        </h1>
        <p className="text-center text-white mt-3 text-lg">
          All Video Teachings in One Place
        </p>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-teal-800 mb-4" data-testid="intro-title">
            Video Podcast Hub
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Welcome to the complete collection of video teachings on Hebrew Torah, biblical truth, and the connection 
            between ancient wisdom and Black heritage. Browse all episodes below and click to watch.
          </p>
        </div>

        {/* Episodes Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {episodes.map((episode) => (
            <div 
              key={episode.id} 
              className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
              data-testid={`episode-${episode.id}`}
            >
              {/* Video Preview - Smaller */}
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={episode.videoUrl}
                  title={episode.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              {/* Episode Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-teal-800 mb-2">
                  Episode {episode.id}: {episode.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {episode.description}
                </p>
                <a 
                  href={episode.pageLink}
                  className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                  Watch Full Episode →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-teal-700 to-teal-600 rounded-lg p-8 text-white text-center shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
          <p className="text-lg mb-6">
            Have questions about these teachings? Want to learn more about Hebrew Torah truth and ancient wisdom? Get in touch.
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
