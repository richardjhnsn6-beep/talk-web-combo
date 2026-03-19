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
          
          {/* Alphabet Display - List Format */}
          <div className="mb-8">
            <div className="bg-white p-8 rounded-xl shadow-xl border-4 border-teal-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-teal-800 mb-2">
                  The 20 Original Hebrew Letters
                </h3>
                <p className="text-sm text-gray-600 italic mb-4">
                  By Richard Johnson (RJHNSN12) - Transliteration System
                </p>
                
                {/* Handwritten Alphabet Image */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_talk-web-combo/artifacts/0uubll0f_IMG_1650.heic"
                    alt="Original Hebrew Alphabet - Handwritten by Richard Johnson"
                    className="w-full max-w-3xl mx-auto rounded-lg shadow-lg border-2 border-teal-300"
                    style={{ filter: 'brightness(1.2) contrast(1.2)' }}
                  />
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Original handwritten Hebrew alphabet (Note: Some browsers may not display this image format)
                  </p>
                </div>
              </div>
              
              <div className="max-w-3xl mx-auto bg-teal-50 rounded-lg p-6">
                <p className="text-center text-sm text-gray-600 mb-4 font-semibold">
                  Letter Reference List:
                </p>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                  <div className="space-y-3">
                    <div className="text-lg"><span className="font-bold text-teal-700">1.</span> Aleph <span className="text-gray-600 italic">- aw-lef</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">2.</span> Beth <span className="text-gray-600 italic">- bayth</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">3.</span> Daleth <span className="text-gray-600 italic">- daw-leth</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">4.</span> He <span className="text-gray-600 italic">- hay</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">5.</span> Vav <span className="text-gray-600 italic">- vawv</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">6.</span> Zayin <span className="text-gray-600 italic">- zah-yin</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">7.</span> Cheth <span className="text-gray-600 italic">- khayth</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">8.</span> Teth <span className="text-gray-600 italic">- teth</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">9.</span> Kaph <span className="text-gray-600 italic">- caf</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">10.</span> Lamed <span className="text-gray-600 italic">- law-med</span></div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-lg"><span className="font-bold text-teal-700">11.</span> Mem <span className="text-gray-600 italic">- mame</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">12.</span> Nun <span className="text-gray-600 italic">- noon</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">13.</span> Samekh <span className="text-gray-600 italic">- saw-mek</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">14.</span> Ayin <span className="text-gray-600 italic">- ah-yin</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">15.</span> Pe <span className="text-gray-600 italic">- fay</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">16.</span> Tsade <span className="text-gray-600 italic">- tsaw-d</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">17.</span> Qoph <span className="text-gray-600 italic">- cof</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">18.</span> Resh <span className="text-gray-600 italic">- raysh</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">19.</span> Shin <span className="text-gray-600 italic">- sheen</span></div>
                    <div className="text-lg"><span className="font-bold text-teal-700">20.</span> Tav <span className="text-gray-600 italic">- thawv</span></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-500 italic">
                Authentic ancient Hebrew - preserved before 12th-century modifications
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
