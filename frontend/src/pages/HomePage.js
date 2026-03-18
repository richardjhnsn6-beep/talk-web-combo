const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" data-testid="homepage">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 py-8 px-8 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 text-center" data-testid="page-title">
          Rjhnsn12 Expounding The Name of Lord God
        </h1>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="mb-8">
            <img 
              src="https://images.unsplash.com/photo-1771251059397-765d5ccbbd78?w=1200&h=500&fit=crop&q=80" 
              alt="Pyramids of Egypt at sunset"
              className="w-full h-64 object-cover rounded-lg shadow-md mb-6"
              data-testid="hero-image"
            />
          </div>

          <h2 className="text-3xl font-bold text-teal-800 mb-4" data-testid="section-title">
            Hebrew writings of the Torah Reveal's Truth
          </h2>
          
          <div className="prose max-w-none text-gray-700 leading-relaxed mb-8" data-testid="intro-text">
            <p className="text-lg mb-4">
              Hebrew translater, I write the bible in the original, weaving out the traditions, 
              giving You the first image of understanding. Website http://shm2.jimdo.com 
              Beaumont, Texas 77703 Email richardjhnsn6@gmail.com from what I will give you, 
              it will help battle against people that only want to profit. when the True Fire 
              comes he is Eternal'
            </p>
          </div>

          {/* First Video */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-teal-700 mb-4">Documentary Video</h3>
            <div className="max-w-md mx-auto">
              <div className="relative" style={{ paddingBottom: '56.25%' }} data-testid="video-player-1">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  src="https://drive.google.com/file/d/15Doqt9X6_Bli7JQ0VGQ-bZYJ7vMY9RiA/preview"
                  title="Documentary Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* Second Video - ALMalachy1 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-teal-700 mb-4">ALMalachy1</h3>
            <div className="max-w-md mx-auto">
              <div className="relative" style={{ paddingBottom: '56.25%' }} data-testid="video-player-2">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  src="https://www.youtube.com/embed/cCwKGVOaW1Y"
                  title="ALMalachy1 Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
