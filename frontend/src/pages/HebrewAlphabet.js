const HebrewAlphabet = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" data-testid="hebrew-alphabet-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 py-8 px-8 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 text-center" data-testid="page-title">
          Original Hebrew Alphabet
        </h1>
        <p className="text-center text-white mt-3 text-lg">
          The 20 Letters of Ancient Hebrew
        </p>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-teal-800 mb-4">
            Understanding Original Hebrew
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            This is the <strong>original Hebrew alphabet</strong> as found in the ancient scrolls and biblical texts. 
            Unlike modern Hebrew which has 22 letters, the original system contains <strong>20 letters</strong>.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg mb-4">
            <p className="text-gray-800 font-semibold mb-2">Critical Historical Truth:</p>
            <p className="text-gray-700 mb-3">
              The original Hebrew scrolls <strong>do not contain the letter "G" (Gimel)</strong> as found in modern Hebrew. 
              What modern scholars interpret as "G" was actually a <strong>"Y" sound</strong> in the original language.
            </p>
            <p className="text-gray-700 mb-3">
              <strong>These letters preserve ancient wisdom</strong> that connects to the earliest civilizations and 
              sacred knowledge. They are NOT the "Jewish Hebrew" that was formulated in the 12th century (circa 1180 AD) 
              when traditions were codified and standardized.
            </p>
            <p className="text-gray-700">
              What is taught today as "Hebrew" reflects modifications made over centuries. This alphabet represents 
              the <strong>original 20 letters</strong> as they existed in ancient times, preserving authentic biblical truth.
            </p>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            By Richard Johnson (RJHNSN12) - preserving ancient Hebrew truth through accurate transliteration and study.
          </p>
        </div>

        {/* Hebrew Alphabet Chart */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-teal-800 mb-6 text-center">
            The 20 Original Hebrew Letters
          </h2>
          
          {/* Alphabet Display - Text Based Until Photo Available */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-xl shadow-2xl border-4 border-teal-200">
              <div className="text-center mb-6">
                <p className="text-lg font-semibold text-teal-800 mb-2">
                  Original 20-Letter Hebrew Alphabet
                </p>
                <p className="text-sm text-gray-600 italic">
                  By Richard Johnson (RJHNSN12) - Transliteration System
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {[
                  { num: 1, name: 'Aleph', trans: 'aw-lef' },
                  { num: 2, name: 'Beth', trans: 'bayth' },
                  { num: 3, name: 'Daleth', trans: 'daw-leth' },
                  { num: 4, name: 'He', trans: 'hay' },
                  { num: 5, name: 'Vav', trans: 'vawv' },
                  { num: 6, name: 'Zayin', trans: 'zah-yin' },
                  { num: 7, name: 'Cheth', trans: 'khayth' },
                  { num: 8, name: 'Teth', trans: 'teth' },
                  { num: 9, name: 'Kaph', trans: 'caf' },
                  { num: 10, name: 'Lamed', trans: 'law-med' },
                  { num: 11, name: 'Mem', trans: 'mame' },
                  { num: 12, name: 'Nun', trans: 'noon' },
                  { num: 13, name: 'Samekh', trans: 'saw-mek' },
                  { num: 14, name: 'Ayin', trans: 'ah-yin' },
                  { num: 15, name: 'Pe', trans: 'fay' },
                  { num: 16, name: 'Tsade', trans: 'tsaw-d' },
                  { num: 17, name: 'Qoph', trans: 'cof' },
                  { num: 18, name: 'Resh', trans: 'raysh' },
                  { num: 19, name: 'Shin', trans: 'sheen' },
                  { num: 20, name: 'Tav', trans: 'thawv' }
                ].map(letter => (
                  <div key={letter.num} className="bg-white rounded-lg p-4 shadow-md border-2 border-teal-300 hover:shadow-lg transition-shadow">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-700 mb-1">{letter.num}</div>
                      <div className="text-xl font-bold text-gray-800 mb-1">{letter.name}</div>
                      <div className="text-sm text-gray-600 italic">{letter.trans}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-500 italic">
                Complete handwritten alphabet image coming soon
              </div>
            </div>
          </div>
        </div>

        {/* Learn More Section */}
        <div className="mt-8 bg-gradient-to-r from-teal-700 to-teal-600 rounded-lg p-8 text-white text-center shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Study Original Hebrew Truth</h3>
          <p className="text-lg mb-6">
            Explore more about ancient Hebrew, biblical transliteration, and the true meanings preserved in the original language.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a 
              href="/books" 
              className="bg-white text-teal-700 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
            >
              Read My Books
            </a>
            <a 
              href="/podcast" 
              className="bg-white text-teal-700 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
            >
              Watch Video Teachings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HebrewAlphabet;
