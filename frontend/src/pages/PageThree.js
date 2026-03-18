const PageThree = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" data-testid="page-three">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 py-8 px-8 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 text-center" data-testid="page-title">
          Rjhnsn12 - Biblical Truth & History
        </h1>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Louis Farrakhan Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-teal-800 mb-6" data-testid="farrakhan-title">
              Mr. Louis Farrakhan - Where are Black People in the Bible?
            </h2>

            <div className="prose max-w-none text-gray-700 mb-6" data-testid="farrakhan-text">
              <div className="space-y-3 text-lg">
                <p className="pl-4 border-l-4 border-teal-600">
                  <strong>{'{1}'}</strong> There are some very important facts on Mr Louis Farrakhan speeches 
                  where are the black people in the bible.
                </p>
                
                <p className="pl-4 border-l-4 border-teal-600">
                  <strong>{'{2}'}</strong> as black people you don't believe that God really loves you,
                </p>
                
                <p className="pl-4 border-l-4 border-teal-600">
                  <strong>{'{3}'}</strong> And when the pasters's preach; you mean to tell me that the 
                  prophet's couldn't see the end of time?
                </p>
                
                <p className="pl-4 border-l-4 border-teal-600">
                  <strong>{'{4}'}</strong> If they saw this! And wrote about it, then they saw you in her 
                  midst; a destroyed people, but where is it in the book?
                </p>
                
                <p className="pl-4 border-l-4 border-teal-600">
                  <strong>{'{5}'}</strong> See Rab, if you can't show me where God is concerned with me. 
                  And my condition and my condition of my people, what the heck! do I need him for.
                </p>
              </div>
            </div>

            {/* Farrakhan Video */}
            <div className="mb-8">
              <div className="max-w-md mx-auto">
                <div className="relative" style={{ paddingBottom: '56.25%' }} data-testid="video-player-farrakhan">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                    src="https://www.youtube.com/embed/09w-ZFasRvE"
                    title="Louis Farrakhan Speech"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          {/* Pastor Ray Hagins Section */}
          <div className="mt-12 pt-12 border-t-2 border-teal-200">
            <h2 className="text-3xl font-bold text-teal-800 mb-6" data-testid="hagins-title">
              Pastor Ray Hagins - Ancient Wisdom
            </h2>

            <div className="prose max-w-none text-gray-700 mb-6" data-testid="hagins-text">
              <div className="space-y-3 text-lg">
                <p className="pl-4 border-l-4 border-teal-600">
                  <strong>{'{1}'}</strong> Everything you think you know, about whatever you think you know, 
                  is in this circumstance of awareness.
                </p>
                
                <p className="pl-4 border-l-4 border-teal-600">
                  <strong>{'{2}'}</strong> Egypt {'{ Kemet }'}. The source of the bible.
                </p>
                
                <p className="pl-4 border-l-4 border-teal-600">
                  <strong>{'{3}'}</strong> The Ancient name of Egypt was keme[t] means black.
                </p>
              </div>

              <div className="mt-6 p-6 bg-teal-50 rounded-lg border-l-4 border-teal-600">
                <p className="text-gray-800 italic">
                  <strong>Rjhnsn:</strong> Before I give my answers on what the true wisdom of understanding 
                  most of all, these Great men are walking kings no one has or even can step into their shoes, 
                  they are my kinsmen we can not ever stop learning.
                </p>
                <p className="text-gray-800 italic mt-4">
                  When I read the Autobiography of Malcom x writer Alex Haley the hold book was very lively, 
                  and most factual, and real. It brought me to my state of mind on the topic of religion.
                </p>
                <p className="text-gray-800 italic mt-4">
                  When I read about the honorable Elijah stared into the bible with tears of agony of soul. 
                  There is a key, to open this book but right now I have not that key.
                </p>
              </div>
            </div>

            {/* Pastor Ray Hagins Video */}
            <div className="mb-8 mt-6">
              <div className="max-w-md mx-auto">
                <div className="relative" style={{ paddingBottom: '56.25%' }} data-testid="video-player-hagins">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                    src="https://www.youtube.com/embed/U_2QiZV_xEU"
                    title="Pastor Ray Hagins Teaching"
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
    </div>
  );
};

export default PageThree;
