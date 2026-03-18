const PageTwo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" data-testid="page-two">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 py-8 px-8 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 text-center" data-testid="page-title">
          Rjhnsn12 - Shaka Zulu 1816
        </h1>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-teal-800 mb-6" data-testid="shaka-title">
            1816 was shaka year of coronation - Deu 33:20-21 in the bible
          </h2>

          <p className="text-lg text-gray-700 mb-6" data-testid="intro-text">
            Acknowledging the source Tetragramation name of God and jehovah.
          </p>

          {/* Video */}
          <div className="mb-8">
            <div className="max-w-sm mx-auto">
              <div className="relative" style={{ paddingBottom: '56.25%' }} data-testid="video-player">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  src="https://www.youtube.com/embed/YUXCWUjCiUE"
                  title="Shaka Zulu History"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* Second Video - Google Drive */}
          <div className="mb-8 mt-8">
            <h3 className="text-xl font-semibold text-teal-700 mb-4">Video 1 (Check if this is correct for Shaka Zulu)</h3>
            <div className="max-w-sm mx-auto">
              <div className="relative" style={{ paddingBottom: '56.25%' }} data-testid="video-player-2">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  src="https://drive.google.com/file/d/0B73CQ06mcqAYOEhrdVp2Tm51YXc/preview"
                  title="Shaka Zulu Video - To Review"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* Content Points */}
          <div className="prose max-w-none text-gray-700" data-testid="content-text">
            <div className="space-y-4 text-lg">
              <p className="pl-4 border-l-4 border-teal-600">
                <strong>{'{1}'}</strong> Shaka is of the tribe Gad of Israel.
              </p>
              
              <p className="pl-4 border-l-4 border-teal-600">
                <strong>{'{2}'}</strong> Shaka Zulu was not the enemy of the state, 
                Deu 33:20- remember' 21 Blessed he that Enlargeth Gad :he Dwelleth as a Lion, 
                and Teareth the arm with the crown of the head.
              </p>
              
              <p className="pl-4 border-l-4 border-teal-600">
                <strong>{'{3}'}</strong> For the wars that Shaka started conquering Other, 
                African nations. was already in Affect before his Birth for the enemie's had won for now;
              </p>
              
              <p className="pl-4 border-l-4 border-teal-600">
                <strong>{'{4}'}</strong> Deu 33:21 And he provided the first part for himself, 
                Because there, in a portion of the lawgiver, was he seated and he came with the heads 
                of the People, he executed the judgments with Israel.
              </p>
              
              <p className="pl-4 border-l-4 border-teal-600">
                <strong>{'{5}'}</strong> Shaka took what the elders promise to give him, 
                a portion of the First victory your reward Spoil, and booty.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageTwo;
