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
                <strong>Hebrew-9:26</strong> av Amar Barack hava Yachuwshuah AlaSham av qaynaan hava Naphash Abad
              </p>
              <p className="text-gray-700 mt-4">
                <strong>Translation:</strong> and the people of the beginning I am kinsmen in time of the fire el one fire of the people and the remain it of the eye of the fountain the fountain of fleshy fire of the beginning witness
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="mb-8">
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <img 
                src="https://static.prod-images.emergentagent.com/jobs/dae91dca-f806-499e-ba09-9fd13250539c/images/bdb3575a2e0272d43fd51db44e327677821fd046ea6f7756c23962cfa688a8b7.png" 
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
            <h3 className="text-xl font-semibold text-teal-700 mb-4">"Movement" - Who is Israel?</h3>
            <p className="text-gray-700 mb-4 italic">
              <strong>Rjhnsn12 Original:</strong> Rodney King, police brutality, Black lives lost - One death at a time. Hebrew documentation with Lil Wayne and Game music.
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative" style={{ paddingBottom: '56.25%' }} data-testid="video-player">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  src="https://drive.google.com/file/d/12kQtEILC5NjqQIfSANnHa6YxuZsht_aG/preview"
                  title="Movement - Who is Israel"
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
