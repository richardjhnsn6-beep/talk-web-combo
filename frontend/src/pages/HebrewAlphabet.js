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
            <p className="text-gray-800 font-semibold mb-2">Important Note:</p>
            <p className="text-gray-700">
              The original Hebrew scrolls <strong>do not contain the letter "G" (Gimel)</strong> as found in modern Hebrew. 
              What modern scholars interpret as "G" was actually a <strong>"Y" sound</strong> in the original language. 
              This is one of many changes that occurred as Hebrew evolved over centuries.
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
          <div className="mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_talk-web-combo/artifacts/hc6egzq1_IMG_1650.heic"
              alt="Original Hebrew Alphabet - 20 Letters with transliterations"
              className="w-full max-w-3xl mx-auto rounded-lg shadow-lg border-4 border-teal-200"
            />
          </div>

          {/* Reference List */}
          <div className="bg-teal-50 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-teal-800 mb-4">Letters Included:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <ul className="space-y-2">
                <li>1. Aleph (א) - aw-lef</li>
                <li>2. Beth (ב) - bayth</li>
                <li>3. Daleth (ד) - daw-leth</li>
                <li>4. He (ה) - hay</li>
                <li>5. Vav (ו) - vawv</li>
                <li>6. Zayin (ז) - zah-yin</li>
                <li>7. Cheth (ח) - khayth</li>
                <li>8. Teth (ט) - teth</li>
                <li>9. Kaph (כ) - caf</li>
                <li>10. Lamed (ל) - law-med</li>
              </ul>
              <ul className="space-y-2">
                <li>11. Mem (מ) - mame</li>
                <li>12. Nun (נ) - noon</li>
                <li>13. Samekh (ס) - saw-mek</li>
                <li>14. Ayin (ע) - ah-yin</li>
                <li>15. Pe (פ) - fay</li>
                <li>16. Tsade (צ) - tsaw-d</li>
                <li>17. Qoph (ק) - cof</li>
                <li>18. Resh (ר) - raysh</li>
                <li>19. Shin (ש) - sheen</li>
                <li>20. Tav (ת) - thawv</li>
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
