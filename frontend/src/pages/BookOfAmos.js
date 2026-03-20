import React, { useState } from 'react';

const BookOfAmos = () => {
  const [activeSection, setActiveSection] = useState('interlinear');
  const [activeChapter, setActiveChapter] = useState(1);

  const chapters = [
    { 
      num: 1, 
      title: "Israel's Kindmen Set for Judgment",
      hebrewTitle: "yasharaAl ach amad al ShaphaTh"
    },
    { 
      num: 2, 
      title: "Moab's Sin; Judah's Transgressions",
      hebrewTitle: "Mawd chatta yachadah pasha"
    },
    { 
      num: 3, 
      title: "Divine Judgment Upon Israel",
      hebrewTitle: ""
    },
    { 
      num: 4, 
      title: "Hear This Word of the Sun of Light",
      hebrewTitle: "Shama zath dabar al ash al owr"
    }
  ];

  // Sample content for Chapter 1 - Pure Hebrew (continuous text)
  const chapter1PureHebrew = [
    { verse: 1, text: "dabar al Amac Ashar hayach bayn Naqad al Taqowa Ashar chazeh al yasharaal al yowm Ozayah Malak al Yahadah aw al yowm Yaraboam ban Yoash Malak al yasharaal shanaym shana al raash" },
    { verse: 2, text: "aw huw amar Yachuwshua al Tsayown shaagh aw al Yaruwshalayim Nathan qowl aw abal Nayah al Raah aw yabash rosh al Karmal" },
    { verse: 3, text: "kah amar Yachuwshua al shalowsh pasha al Dammashaq aw al arba law shuwb al kiy dawsh al Galaad al charuwts al barzel" },
    { verse: 4, text: "aw shalach esh al bayth Chazaal aw akal armown ban Hadad" },
    { verse: 5, text: "aw shabar bariyach Dammashaq aw karath yashab al biqah Aven aw tamak shebet al bayth Adan aw galah am Aram Qiyr amar Yachuwshua" },
  ];

  // Chapter 1 - Interlinear (word-by-word alignment) - Using user's reference image
  const chapter1Interlinear = {
    verse1: {
      hebrew: ["dabar", "al", "Amac", "Ashar", "hayach", "bayn", "Naqad", "al", "Taqowa", "Ashar", "chazeh", "al", "yasharaal", "al", "yowm", "Ozayah", "Malak", "al", "Yahadah", "aw", "al", "yowm", "Yaraboam", "ban", "Yoash", "Malak", "al", "yasharaal", "shanaym", "shana", "al", "raash"],
      english: ["words", "of", "Amos", "who", "was", "among", "herdmen", "of", "Tekoa", "which", "he saw", "concerning", "Israel", "in", "days", "Uzziah", "king", "of", "Judah", "and", "in", "days", "Jeroboam", "son", "Joash", "king", "of", "Israel", "two", "years", "before", "earthquake"]
    },
    verse2: {
      hebrew: ["aw", "huw", "amar", "Yachuwshua", "al", "Tsayown", "shaagh", "aw", "al", "Yaruwshalayim", "Nathan", "qowl", "aw", "abal", "Nayah", "al", "Raah", "aw", "yabash", "rosh", "al", "Karmal"],
      english: ["and", "he", "said", "LORD", "from", "Zion", "will roar", "and", "from", "Jerusalem", "utter", "voice", "and", "mourn", "habitations", "of", "shepherds", "and", "wither", "top", "of", "Carmel"]
    },
    verse3: {
      hebrew: ["kah", "amar", "Yachuwshua", "al", "shalowsh", "pasha", "al", "Dammashaq", "aw", "al", "arba", "law", "shuwb", "al", "kiy", "dawsh", "al", "Galaad", "al", "charuwts", "al", "barzel"],
      english: ["Thus", "saith", "LORD", "for", "three", "transgressions", "of", "Damascus", "and", "for", "four", "not", "turn away", "punishment", "because", "threshed", "Gilead", "with", "threshing", "instruments", "of", "iron"]
    },
    verse4: {
      hebrew: ["Han", "ahy", "shalach", "ash", "al", "bayth", "al", "Chazaal", "aw", "akal", "armown", "ban", "Hadad"],
      english: ["but", "I will", "send", "a fire", "into the", "house", "of", "Hazael", "which", "shall devour", "palaces", "of", "Ben-hadad"]
    },
    verse5: {
      hebrew: ["aw", "shabar", "bariyach", "Dammashaq", "aw", "karath", "yashab", "al", "biqah", "Aven", "aw", "tamak", "shebet", "al", "bayth", "Adan", "aw", "galah", "am", "Aram", "Qiyr", "amar", "Yachuwshua"],
      english: ["will break", "bar", "of", "Damascus", "and", "cut off", "inhabitant", "from", "plain", "of Aven", "and", "him that holdeth", "sceptre", "from", "house", "of Eden", "and", "shall go", "people", "of Syria", "into captivity", "unto Kir", "saith LORD"]
    }
  };
  
  // Sample content for Chapter 1 - Bilingual (old format kept for reference)
  const chapter1Bilingual = [
    { 
      verse: 1, 
      hebrew: "dabar al Amac Ashar hayach bayn Naqad al Taqowa Ashar chazeh al yasharaal yowm al yachuwshuahzzah Malak al yachadah aw yowm al yaraboam ban al yasharaal shanaym shana rayash",
      english: "The words of Amos, who was among the herdmen of Tekoa, which he saw concerning Israel in the days of Uzziah king of Judah, and in the days of Jeroboam the son of Joash king of Israel, two years before the earthquake."
    },
    { 
      verse: 2, 
      hebrew: "aw huw amar YaChuwshuah al Tsayown sha'agh aw al Yaruwshalayim Nathon qowl aw abal Nayah Raah aw yabash rosh al Karmal",
      english: "And he said, The LORD will roar from Zion, and utter his voice from Jerusalem; and the habitations of the shepherds shall mourn, and the top of Carmel shall wither."
    },
    { 
      verse: 3, 
      hebrew: "kah amar YaChuwshuah aw shalowsh pasha al Dammashaq aw aw arba law shu[w]b kiy dawsh kharsth al yahd al Galaad",
      english: "Thus saith the LORD; For three transgressions of Damascus, and for four, I will not turn away the punishment thereof; because they have threshed Gilead with threshing instruments of iron:"
    },
    { 
      verse: 4, 
      hebrew: "aw shalach esh al bayth al Chaza'Al aw akal Armon ban al Hadad",
      english: "But I will send a fire into the house of Hazael, which shall devour the palaces of Ben-hadad."
    },
    { 
      verse: 5, 
      hebrew: "aw shabar bariyach al Dammashaq aw kareth yashab al bayth al Awan aw thamak shebeth al bayth al Adan aw galah Aram al Qiyr amar YaChuwshuah",
      english: "I will break also the bar of Damascus, and cut off the inhabitant from the plain of Aven, and him that holdeth the sceptre from the house of Eden: and the people of Syria shall go into captivity unto Kir, saith the LORD."
    },
  ];

  const renderInterlinear = () => {
    if (activeChapter !== 1) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Chapter {activeChapter} interlinear will be added soon.
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 p-6 bg-teal-50 rounded-lg border-2 border-teal-300">
          <h3 className="text-xl font-bold text-teal-800 mb-2">📖 Word-by-Word Interlinear Format</h3>
          <p className="text-gray-700">
            Each Hebrew word is shown with its English meaning directly below it. This is the most literal translation format.
          </p>
        </div>

        {/* Verses 1-5 */}
        {Object.entries(chapter1Interlinear).map(([verseKey, verseData]) => {
          const verseNum = verseKey.replace('verse', '');
          return (
            <div key={verseKey} className="mb-10 p-6 bg-white rounded-lg border border-gray-300">
              <h4 className="text-lg font-bold text-teal-700 mb-4">Verse {verseNum}</h4>
              <div className="overflow-x-auto">
                <div className="inline-flex flex-wrap gap-x-4 gap-y-6 min-w-full">
                  {verseData.hebrew.map((hWord, idx) => (
                    <div key={idx} className="text-center min-w-[80px]">
                      <div className="text-base font-semibold text-gray-800 mb-1">{hWord}</div>
                      <div className="text-sm text-teal-700">{verseData.english[idx]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
          <p className="text-sm text-gray-700 text-center">
            <strong>Sample:</strong> Verses 1-5 shown in interlinear format. Full chapter has 15 verses total.
          </p>
        </div>
      </div>
    );
  };

  const renderPureHebrew = () => {
    if (activeChapter !== 1) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Chapter {activeChapter} content will be added soon.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            This is a sample page showing Chapter 1 format.
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto">
        {chapter1PureHebrew.map((item) => (
          <div key={item.verse} className="mb-4">
            <p className="text-lg leading-relaxed">
              <span className="font-bold text-teal-700 mr-2">{item.verse}.</span>
              <span className="text-gray-800">{item.text}</span>
            </p>
          </div>
        ))}
        <div className="mt-8 p-4 bg-teal-50 rounded-lg border border-teal-200">
          <p className="text-sm text-gray-600 italic text-center">
            Sample verses shown. Full chapter contains 15 verses.
          </p>
        </div>
      </div>
    );
  };

  const renderBilingual = () => {
    if (activeChapter !== 1) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Chapter {activeChapter} content will be added soon.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            This is a sample page showing Chapter 1 format.
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto">
        {chapter1Bilingual.map((item) => (
          <div key={item.verse} className="mb-6 grid md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
            {/* Hebrew Column - Left */}
            <div className="order-2 md:order-1">
              <p className="text-base leading-relaxed">
                <span className="font-bold text-teal-700 mr-2">{item.verse}.</span>
                <span className="text-gray-800">{item.hebrew}</span>
              </p>
            </div>
            
            {/* English Column - Right */}
            <div className="order-1 md:order-2">
              <p className="text-base leading-relaxed text-gray-800">
                {item.english}
              </p>
            </div>
          </div>
        ))}
        <div className="mt-8 p-4 bg-teal-50 rounded-lg border border-teal-200">
          <p className="text-sm text-gray-600 italic text-center">
            Sample verses shown. Full chapter contains 15 verses with parallel Hebrew and English text.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-teal-800 mb-3">
              Book of Amos
            </h1>
            <p className="text-xl text-gray-600 mb-2">Free Sample - Chapters 1-4</p>
            <p className="text-lg text-teal-700 font-semibold">
              By Richard Johnson (RJHNSN12)
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-700 italic">
                "Experience the Original 20-Letter Ancient Hebrew System"
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Copyrighted & Notarized Biblical Translation • Preserving Ancient Hebrew
              </p>
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {chapters.map((chapter) => (
              <button
                key={chapter.num}
                onClick={() => setActiveChapter(chapter.num)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeChapter === chapter.num
                    ? 'bg-teal-700 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-teal-100'
                }`}
              >
                Chapter {chapter.num}
              </button>
            ))}
          </div>

          {/* Active Chapter Title */}
          <div className="text-center py-6 bg-teal-50 rounded-lg border border-teal-200">
            <h2 className="text-2xl font-bold text-teal-800">
              Chapter {activeChapter}: {chapters[activeChapter - 1].title}
            </h2>
            {chapters[activeChapter - 1].hebrewTitle && (
              <p className="text-lg text-gray-600 italic mt-2">
                {chapters[activeChapter - 1].hebrewTitle}
              </p>
            )}
          </div>
        </div>

        {/* Section Toggle */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setActiveSection('interlinear')}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                activeSection === 'interlinear'
                  ? 'bg-teal-700 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-teal-100'
              }`}
            >
              🔤 Word-by-Word
            </button>
            <button
              onClick={() => setActiveSection('pure-hebrew')}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                activeSection === 'pure-hebrew'
                  ? 'bg-teal-700 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-teal-100'
              }`}
            >
              📖 Pure Hebrew
            </button>
            <button
              onClick={() => setActiveSection('bilingual')}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                activeSection === 'bilingual'
                  ? 'bg-teal-700 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-teal-100'
              }`}
            >
              🔄 Bilingual
            </button>
          </div>

          {/* Section Description */}
          <div className="mt-6 text-center">
            {activeSection === 'interlinear' ? (
              <p className="text-gray-600">
                <span className="font-semibold text-teal-700">Word-by-Word Interlinear:</span> Each Hebrew word with its English meaning directly below - the most literal translation format.
              </p>
            ) : activeSection === 'pure-hebrew' ? (
              <p className="text-gray-600">
                <span className="font-semibold text-teal-700">Pure Hebrew Section:</span> Original 20-letter ancient Hebrew transliteration - preserving the authentic language.
              </p>
            ) : (
              <p className="text-gray-600">
                <span className="font-semibold text-teal-700">Bilingual Study:</span> Side-by-side comparison with Hebrew on the left and English on the right.
              </p>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          {activeSection === 'interlinear' ? renderInterlinear() : activeSection === 'pure-hebrew' ? renderPureHebrew() : renderBilingual()}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-lg shadow-xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">
            Love What You See?
          </h3>
          <p className="text-xl mb-6">
            This is just a sample! Get the complete books with full concordance and word studies.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://www.amazon.com/s?k=richard+johnson+barashath"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-teal-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              📚 Buy on Amazon
            </a>
            <a
              href="https://www.barnesandnoble.com/s/richard+johnson"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-teal-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              📖 Barnes & Noble
            </a>
          </div>
          <p className="text-sm mt-6 opacity-90">
            Complete books include: Genesis, Exodus, and 4 other titles • Full concordance with Strong's numbers • Decades of original scholarship
          </p>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow-xl p-8 mt-8">
          <h3 className="text-2xl font-bold text-teal-800 mb-4 text-center">
            About This Translation
          </h3>
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              <strong>RJHNSN12's Original Hebrew Translation</strong> represents decades of meticulous scholarship, presenting biblical texts in the authentic 20-letter ancient Hebrew system - predating modern 22-letter Hebrew influenced by 12th-century changes.
            </p>
            <p className="mb-4">
              <strong>Three-Part Study System:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Pure Hebrew:</strong> Original language transliteration using the 20-letter system</li>
              <li><strong>Bilingual Comparison:</strong> Side-by-side Hebrew and English for word-by-word study</li>
              <li><strong>Concordance:</strong> Complete word analysis with Strong's Concordance numbers (in full books)</li>
            </ul>
            <p className="text-center text-teal-700 font-semibold mt-6">
              Copyrighted & Notarized (2003) • Original Scholarship • Preserving Ancient Truth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookOfAmos;
