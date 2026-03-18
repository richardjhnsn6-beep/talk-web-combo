const PageFour = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" data-testid="page-four">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 py-8 px-8 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 text-center" data-testid="page-title">
          Rjhnsn12 - Biblical Revelations
        </h1>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-teal-800 mb-6 text-center" data-testid="section-title">
            Serapis Christus - Origins of Christ Imagery
          </h2>

          <div className="mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_talk-web-combo/artifacts/1uu7xig3_IMG_1623.jpeg" 
              alt="Serapis Christus sitting with crown and cup"
              className="w-full max-w-md mx-auto h-auto object-contain rounded-lg shadow-md mb-6"
              data-testid="serapis-image"
            />
            <p className="text-center text-gray-600 italic">
              Serapis Christus - Ancient Greco-Egyptian deity and the origins of religious imagery
            </p>
          </div>

          {/* First Video - BBC Video at Top */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-teal-700 mb-4 text-center">Serapis Christus - Historical Evidence</h3>
            <p className="text-gray-700 mb-4 italic text-center">
              <strong>Rjhnsn12 Original:</strong> Preserved documentary (BBC takedown) - Serapis and religious origins
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative" style={{ paddingBottom: '56.25%' }} data-testid="video-player-1">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  src="https://drive.google.com/file/d/1j6i0LqRejSL6KkWIDeJXRqUPMjUOIasq/preview"
                  title="Serapis Historical Evidence"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* Second Video - Dr. Ray Hagins at Bottom */}
          <div className="mb-8 mt-8">
            <h3 className="text-xl font-semibold text-teal-700 mb-4 text-center">Dr. Ray Hagins - Serapis Christus Documentary</h3>
            <p className="text-gray-700 mb-4 italic text-center">
              <strong>Edited by Rjhnsn12:</strong> Clipped and assembled with music and documentation showing the origins of Christ imagery
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative" style={{ paddingBottom: '56.25%' }} data-testid="video-player-2">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  src="https://www.youtube.com/embed/c_4QOETjPCk"
                  title="Serapis Christus Documentary"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          <div className="prose max-w-none text-gray-700 text-center">
            <p className="text-lg italic">
              Exploring the path of truth through ancient wisdom and biblical understanding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageFour;
