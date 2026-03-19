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
          
          {/* Alphabet Image */}
          <div className="mb-8 bg-white p-8 rounded-lg shadow-inner">
            <p className="text-center text-gray-600 mb-4 font-semibold">
              Original 20-Letter Hebrew Alphabet by RJHNSN12
            </p>
            <img 
              src="https://customer-assets.emergentagent.com/job_talk-web-combo/artifacts/hc6egzq1_IMG_1650.heic"
              alt="Original Hebrew Alphabet - 20 Letters with transliterations by Richard Johnson"
              className="w-full max-w-4xl mx-auto rounded-xl shadow-2xl border-8 border-teal-100"
              style={{
                filter: 'brightness(1.2) contrast(1.3)',
                backgroundColor: 'white'
              }}
            />
            <p className="text-center text-sm text-gray-500 mt-4 italic">
              Authentic ancient Hebrew - 20 original letters preserved before 12th-century modifications
            </p>
          </div>

          {/* Reference List */}
          <div className="bg-teal-50 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-teal-800 mb-4">The 20 Original Letters with Transliterations:</h3>
            <p className="text-gray-700 mb-4">
              <em>These are the authentic ancient letters as preserved in the original scrolls, 
              before 12th-century modifications. Each letter connects to ancient wisdom and origins.</em>
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <ul className="space-y-2">
                <li>1. Aleph - aw-lef</li>
                <li>2. Beth - bayth</li>
                <li>3. Daleth - daw-leth</li>
                <li>4. He - hay</li>
                <li>5. Vav - vawv</li>
                <li>6. Zayin - zah-yin</li>
                <li>7. Cheth - khayth</li>
                <li>8. Teth - teth</li>
                <li>9. Kaph - caf</li>
                <li>10. Lamed - law-med</li>
              </ul>
              <ul className="space-y-2">
                <li>11. Mem - mame</li>
                <li>12. Nun - noon</li>
                <li>13. Samekh - saw-mek</li>
                <li>14. Ayin - ah-yin</li>
                <li>15. Pe - fay</li>
                <li>16. Tsade - tsaw-d</li>
                <li>17. Qoph - cof</li>
                <li>18. Resh - raysh</li>
                <li>19. Shin - sheen</li>
                <li>20. Tav - thawv</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Learn More */}
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
