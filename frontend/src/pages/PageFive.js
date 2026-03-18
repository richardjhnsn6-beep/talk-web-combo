const PageFive = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" data-testid="page-five">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 py-8 px-8 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 text-center" data-testid="page-title">
          Rjhnsn12 - Bearing of the Truth
        </h1>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-teal-800 mb-6" data-testid="section-title">
            Bearing of the Truth
          </h2>

          <div className="prose max-w-none text-gray-700 mb-8" data-testid="intro-text">
            <p className="text-lg mb-4">
              Meaning; most of all, it's up to you, to look carefully and read with the spirit of wisdom.
            </p>

            <div className="bg-teal-50 p-6 rounded-lg border-l-4 border-teal-600 mb-6">
              <p className="font-semibold text-teal-900 mb-2">
                Gen 9:26 And he said blessed be the lord God of shem; and Canaan shall be his servant.
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Hebrew-9:26</strong> av chw amar barak hava Yachwshah Alasham av Kanaan yash hava abad.Rjhnsn
              </p>
              <p className="text-gray-700 italic mt-4">
                <strong>Translation:</strong> and of cUshn people light that cometh of the light of truth, 
                brother that cometh of one I am the true time, of the fire of kinsmen El one fire of the people.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="mb-8">
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <img 
                src="https://images.unsplash.com/photo-1739997698837-8267626ffe92?w=600&h=400&fit=crop" 
                alt="Ham, Shem, and Japheth"
                className="w-full max-w-2xl mx-auto h-64 object-cover rounded-lg shadow-md mb-4"
                data-testid="noah-image"
              />
              <p className="text-sm font-semibold text-gray-700" data-testid="image-caption">
                HAM, SHEM, AND JAPHETH
              </p>
            </div>
          </div>

          {/* Video */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-teal-700 mb-4">Documentary Video</h3>
            <div className="max-w-2xl mx-auto">
              <div className="relative" style={{ paddingBottom: '56.25%' }} data-testid="video-player">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  src="https://www.youtube.com/embed/wjROjaPR9OK"
                  title="Bearing of the Truth Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* Second Video - Google Drive - To Review */}
          <div className="mb-8 mt-8">
            <h3 className="text-xl font-semibold text-teal-700 mb-4">Video 2 (Check what this video is about)</h3>
            <div className="max-w-2xl mx-auto">
              <div className="relative" style={{ paddingBottom: '56.25%' }} data-testid="video-player-2">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  src="https://drive.google.com/file/d/1T20YnaVNVUt385EO4HPZU1clNSLcImhm/preview"
                  title="Video To Review"
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

export default PageFive;
