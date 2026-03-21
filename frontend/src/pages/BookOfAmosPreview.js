import React, { useState } from 'react';

const BookOfAmosPreview = () => {
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

  // Chapter 1 - Interlinear (word-by-word alignment)
  const chapter1Interlinear = {
    verse1: {
      hebrew: ["dabar", "al", "Amac", "Ashar", "hayach", "bayn", "Naqad", "al", "Taqowa", "Ashar", "chazeh", "al", "yasharaal", "al", "yowm", "Ozayah", "Malak", "al", "Yahadah", "aw", "al", "yowm", "Yaraboam", "ban", "Yoash", "Malak", "al", "yasharaal", "shanaym", "shana", "al", "raash"],
      english: ["words", "of", "Amos", "who", "have", "among", "herdmen", "of", "Tekoa", "which", "he saw", "concerning", "Israel", "in", "days", "Uzziah", "king", "of", "Judah", "and", "in", "days", "Jeroboam", "son", "Joash", "king", "of", "Israel", "two", "years", "before", "earthquake"]
    },
    verse2: {
      hebrew: ["aw", "huw", "amar", "Yachuwshua", "al", "Tsayown", "shaagh", "aw", "al", "Yaruwshalayim", "Nathan", "qowl", "aw", "abal", "Nayah", "al", "Raah", "aw", "yabash", "rosh", "al", "Karmal"],
      english: ["and", "he", "said", "LORD", "from", "Zion", "will roar", "and", "from", "Jerusalem", "utter", "voice", "and", "mourn", "habitations", "of", "shepherds", "and", "wither", "top", "of", "Carmel"]
    },
    verse3: {
      hebrew: ["kah", "amar", "Yachuwshua", "al", "shalowsh", "pasha", "al", "Dammashaq", "aw", "al", "arba", "law", "shuwb", "cuwr", "avan", "kiy", "Duwsh", "al", "Galaad", "ad", "charuts", "dachavah", "al", "barzal"],
      english: ["Thus", "saith", "LORD", "for", "three", "transgressions", "of", "Damascus", "and", "for", "four", "not", "turn", "away", "punishment", "because", "Thresh", "the", "Gilead", "with", "threshing", "instruments", "of", "irons"]
    },
    verse4: {
      hebrew: ["Han", "ahy", "shalach", "ash", "al", "bayth", "al", "Chazaal", "Ashar", "yash", "akal", "armown", "ban", "Hadad"],
      english: ["but", "I will", "send", "a fire", "into the", "house", "of", "Hazael", "which", "shall", "devour", "palaces", "of", "Benhadad"]
    },
    verse5: {
      hebrew: ["ahy", "shabar", "gam", "barayach", "al", "Dammashaq", "aw", "Karath", "al", "yashab", "al", "baqah", "al", "Avan", "aw", "Naphash", "Ky", "Tamak", "shabat", "al", "bayth", "al", "Adan", "aw", "Am", "al", "Aram", "yash", "yatsa", "galah", "al", "qayr", "Amar", "al", "Yachuwshuah"],
      english: ["I will", "break", "also", "the bars", "of", "Damascus", "and", "cut off", "the", "inhabitants", "from the", "plain", "of", "avan", "and", "him", "that", "holdeth", "the sceptre", "from the", "house", "of", "Eden", "and", "the people", "of", "Syria", "shall", "go into", "captivity", "unto", "Kir", "said", "The", "LORD"]
    },
    verse6: {
      hebrew: ["Kah", "Amar", "al", "Yachuwshuah", "yth", "shalawsh", "pasha", "al", "Azzah", "aw", "yth", "arba", "ahy", "lah", "shuwb", "Cuwr", "Avan", "Shamal", "ky", "cham", "baw", "cuwr", "galah", "shalam", "galwth", "cagar", "cham", "cagar", "Adam"],
      english: ["This", "said", "The", "LORD", "for", "three", "transgressions", "of", "Gaza", "and", "for", "four", "I will", "not", "turn", "away", "punishment", "There of", "because", "they", "carried", "away", "captures", "the whole", "captivity", "to deliver up", "them", "up to", "Edom"]
    },
    verse7: {
      hebrew: ["Han", "ahy", "shalach", "ash", "al", "chawah", "al", "Azzah", "Asar", "Yash", "akal", "Aramwn", "shamal"],
      english: ["But", "I will", "send", "a fire", "on the", "wall", "of", "Gaza", "which", "Shall", "devour", "the palaces", "thereof"]
    },
    verse8: {
      hebrew: ["aw", "ahy", "karath", "al", "yashab", "al", "Ashawd", "aw", "Naphash", "ky", "Tamak", "shabat", "al", "Ashaqalan", "aw", "ahy", "shuwb", "yad", "al", "Aqarawn", "shaarayth", "al", "Palashatay", "yash", "abad", "Amar", "al", "Adanay", "Yachuwshuah"],
      english: ["And", "I will", "cut off", "the", "inhabitants", "from", "Ashdod", "and", "him", "that", "holdeth", "the scepter", "from", "Ashkelon", "and", "I will", "turn", "mine hand", "Against", "Eqrown", "the remnant", "of", "Philistine's", "shall", "perish", "saith", "the", "Lord", "GOD"]
    },
    verse9: {
      hebrew: ["Kah", "Amar", "al", "Yachuwshuah", "yth", "Shalawsh", "pasha", "Tsawn", "aw", "yth", "arba", "ahy", "lah", "shuwb", "cuwr", "Avan", "Shamal", "ky", "Cham", "cagar", "shalam", "galawth", "Adam", "aw", "Zakar", "lah", "ah", "barayth"],
      english: ["This", "said", "the", "LORD", "for", "three", "transgressions", "Tyrus", "and", "for", "four", "I will", "not", "turn", "away", "the punishment", "There of", "because", "they", "delivered up", "the whole", "captivity", "Edom", "and", "remembered", "not", "the brotherly", "covenant"]
    },
    verse10: {
      hebrew: ["Han", "ahy", "shalach", "ash", "al", "chawmah", "al", "Tsawn", "Asar", "yash", "akal", "Aramawn", "shamal"],
      english: ["Because", "I will", "send", "a fire", "on the", "walls", "of", "Tyrus", "which", "shall", "devour", "the palaces", "thereof"]
    },
    verse11: {
      hebrew: ["Kah", "Amar", "al", "Yachuwshuah", "yth", "shalawsh", "pasha", "al", "Adam", "aw", "yth", "arba", "ahy", "lah", "shuwb", "cuwr", "Avan", "shamal", "al", "huw", "Ashah", "radaph", "Naphash", "ah", "awd", "charab", "aw", "Asah", "shachath", "kal", "racham", "aw", "Naphash", "aph", "asah", "Taraph", "ad", "aw", "huw", "shamar", "Naphash", "abrah", "Natsach"],
      english: ["Thus", "said", "the", "Lord", "for", "three", "transgressions", "of", "Edom", "and", "for", "four", "I will", "not", "turn", "away", "The punishment", "there of", "because", "he", "did", "pursue", "his", "brother", "with", "sword", "and", "did", "cast off", "all", "pity", "And", "his", "anger", "did", "tear", "perpetually", "and", "he", "kept", "his", "wrath", "forever"]
    },
    verse12: {
      hebrew: ["Han", "ahy", "shalach", "ash", "al", "Tayman", "Asar", "yash", "akal", "al", "Aramawn", "al", "batsarah"],
      english: ["But", "I will", "send", "a fire", "upon", "Teman", "which", "should", "devour", "the", "palace", "of", "Bozrah"]
    },
    verse13: {
      hebrew: ["Kah", "Amar", "al", "Yachwshuah", "yth", "shalawsh", "pasha", "al", "ban", "al", "Amaman", "aw", "yth", "arba", "ahy", "lah", "Shuwb", "cuwr", "pasha", "Shamal", "ky", "cham", "hayach", "Baqa", "Kashashah", "awd", "harah", "al", "Galaad", "ky", "cham", "taqaph", "Rachab", "cham", "Gabawl"],
      english: ["Thus", "said", "the", "Lord", "for", "three", "transgressions", "of the", "children", "of", "Ammon", "and", "for", "four", "I will", "not", "turn", "away", "the punishment", "there of", "because", "they", "have", "ripped up", "the woman", "with", "child", "of", "Gilead", "that", "they", "might", "enlarge", "their", "border"]
    },
    verse14: {
      hebrew: ["Han", "ahy", "yatsath", "ash", "al", "Chawmah", "al", "Rabbath", "aw", "yash", "akal", "Aramawn", "shamal", "awd", "tarawah", "al", "yawm", "al", "Malchamah", "awd", "caar", "al", "yawm", "al", "cawphah"],
      english: ["But", "I will", "Kindle", "a fire", "in the", "wall", "of", "Rabbah", "and", "it shall", "devour", "the palaces", "there of", "with", "Shouting", "in the", "days", "of", "battle", "with", "Tempest", "in the", "day", "of", "Whirlwind"]
    },
    verse15: {
      hebrew: ["aw", "Cham", "Malak", "yash", "halak", "gawlah", "haw", "aw", "Naphash", "aSar", "yachad", "Amar", "al", "Yachuwshuah"],
      english: ["and", "their", "King", "Shall", "go", "captivity", "he", "and", "his", "princess", "together", "said", "the", "LORD"]
    }
  };
  
  const chapter1Bilingual = [
    { 
      verse: 1, 
      hebrew: "dabar al Amac Ashar hayach bayn Naqad al Taqowa Ashar chazeh al yasharaal al yowm Ozayah Malak al Yahadah aw al yowm Yaraboam ban Yoash Malak al yasharaal shanaym shana al raash",
      english: "The words of Amos, who was among the herdmen of Tekoa, which he saw concerning Israel in the days of Uzziah king of Judah, and in the days of Jeroboam the son of Joash king of Israel, two years before the earthquake."
    },
    { 
      verse: 2, 
      hebrew: "aw huw amar Yachuwshua al Tsayown shaagh aw al Yaruwshalayim Nathan qowl aw abal Nayah al Raah aw yabash rosh al Karmal",
      english: "And he said, The LORD will roar from Zion, and utter his voice from Jerusalem; and the habitations of the shepherds shall mourn, and the top of Carmel shall wither."
    },
    { 
      verse: 3, 
      hebrew: "kah amar Yachuwshua al shalowsh pasha al Dammashaq aw al arba law shuwb cuwr avan kiy Duwsh al Galaad ad charuts dachavah al barzal",
      english: "Thus saith the LORD; For three transgressions of Damascus, and for four, I will not turn away the punishment thereof; because they have threshed Gilead with threshing instruments of iron:"
    },
    { 
      verse: 4, 
      hebrew: "Han ahy shalach ash al bayth al Chazaal Ashar yash akal armown ban Hadad",
      english: "But I will send a fire into the house of Hazael, which shall devour the palaces of Benhadad."
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
        <div className="mb-8 p-6 bg-purple-100 rounded-lg border-2 border-purple-500">
          <h3 className="text-xl font-bold text-purple-900 mb-2">👁️ PREVIEW MODE - Author View</h3>
          <p className="text-purple-800">
            You're viewing all content without the paywall. Regular visitors will need to pay to see verses 6-15.
          </p>
        </div>

        <div className="mb-8 p-6 bg-teal-50 rounded-lg border-2 border-teal-300">
          <h3 className="text-xl font-bold text-teal-800 mb-2">📖 Word-by-Word Interlinear Format</h3>
          <p className="text-gray-700 mb-4">
            Each Hebrew word is shown with its English meaning directly below it. This is the most literal translation format.
          </p>
        </div>

        {/* Key to Understanding Section */}
        <div className="mb-8 p-6 bg-yellow-50 rounded-lg border-2 border-yellow-400">
          <h3 className="text-xl font-bold text-yellow-900 mb-3">🔑 Key to Understanding the 20-Letter Hebrew System</h3>
          <div className="space-y-3 text-gray-800">
            <p className="font-semibold text-yellow-900">Important Consonant Rules:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>The Letter "A":</strong> A's always go before every letter even though "A" is not written. This is a fundamental rule of the original Hebrew consonant structure.
              </li>
              <li>
                <strong>The Word "AL":</strong> This is one of the most important particles in Hebrew. Depending on context, "AL" can mean:
                <ul className="list-circle pl-6 mt-1">
                  <li><strong>the</strong> (definite article)</li>
                  <li><strong>of</strong> (possessive)</li>
                  <li><strong>from</strong> (directional)</li>
                  <li><strong>against</strong> (oppositional)</li>
                  <li><strong>the person</strong></li>
                  <li><strong>God</strong></li>
                </ul>
              </li>
            </ul>
            <p className="text-sm italic text-yellow-800 mt-3">
              Understanding these rules is essential to properly reading the word-by-word translation below.
            </p>
          </div>
        </div>

        {/* Historical Context Section */}
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-400">
          <h3 className="text-xl font-bold text-blue-900 mb-3">📜 Historical Context: The Transformation of Hebrew</h3>
          <div className="space-y-3 text-gray-800">
            <p className="leading-relaxed">
              <strong>The Original 20-Letter Consonantal System:</strong> Ancient Hebrew was written using only consonants. 
              The letter "A" was invisible - understood but not written. This was the pure, original form of the language.
            </p>
            <p className="leading-relaxed">
              <strong>The JEIOU Doctrine Theory by Wellhausen:</strong> Later translators and scholars recognized the 
              invisible "A" and other consonants, and converted them into a vowel point system. This became known as the 
              JEIOU doctrine - the vowel adoption theory established by Wellhausen, which dictated how the scrolls would 
              be read and understood. The consonants were transformed into vowel sounds (J-E-I-O-U), fundamentally changing 
              the original language structure.
            </p>
            <p className="leading-relaxed">
              <strong>The Impact on Sacred Names:</strong> This transformation fundamentally changed how sacred names and 
              words were pronounced. The original pronunciation of God's name was altered through this vowel system - 
              converting it into various forms (LORD, Jehovah, Yahweh) to avoid saying the actual original name. The theory 
              was that the king would hear them, because He does exist.
            </p>
            <p className="text-sm italic text-blue-800 mt-3 font-semibold">
              This work preserves the original 20-letter consonantal system before it was modified by the JEIOU doctrine and later vowel pointing traditions.
            </p>
          </div>
        </div>

        {/* ALL VERSES - No paywall in preview */}
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
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 p-6 bg-purple-100 rounded-lg border-2 border-purple-500">
          <h3 className="text-xl font-bold text-purple-900 mb-2">👁️ PREVIEW MODE</h3>
          <p className="text-purple-800">Author view - All content visible</p>
        </div>
        {chapter1PureHebrew.map((item) => (
          <div key={item.verse} className="mb-4">
            <p className="text-lg leading-relaxed">
              <span className="font-bold text-teal-700 mr-2">{item.verse}.</span>
              <span className="text-gray-800">{item.text}</span>
            </p>
          </div>
        ))}
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
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 p-6 bg-purple-100 rounded-lg border-2 border-purple-500">
          <h3 className="text-xl font-bold text-purple-900 mb-2">👁️ PREVIEW MODE</h3>
          <p className="text-purple-800">Author view - All content visible</p>
        </div>
        {chapter1Bilingual.map((item) => (
          <div key={item.verse} className="mb-6 grid md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
            {/* Hebrew Column - Left */}
            <div className="text-right md:pr-4">
              <p className="font-bold text-teal-700 mb-1">{item.verse}.</p>
              <p className="text-lg leading-relaxed text-gray-800">{item.hebrew}</p>
            </div>
            {/* English Column - Right */}
            <div className="md:pl-4">
              <p className="font-bold text-blue-700 mb-1">{item.verse}.</p>
              <p className="text-lg leading-relaxed text-gray-700">{item.english}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-teal-800 mb-4">
            The Book of Amos
          </h1>
          <p className="text-lg text-gray-600 italic mb-2">
            Presented in the Original 20-Letter Hebrew System
          </p>
          <p className="text-sm text-purple-700 font-semibold bg-purple-100 inline-block px-4 py-2 rounded-lg">
            👁️ PREVIEW MODE - All Content Visible
          </p>
        </div>

        {/* Chapter Selector */}
        <div className="mb-8 flex justify-center gap-2 flex-wrap">
          {chapters.map((chapter) => (
            <button
              key={chapter.num}
              onClick={() => setActiveChapter(chapter.num)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeChapter === chapter.num
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-white text-teal-700 border-2 border-teal-300 hover:bg-teal-50'
              }`}
            >
              Chapter {chapter.num}
            </button>
          ))}
        </div>

        {/* Chapter Title */}
        {chapters.find(ch => ch.num === activeChapter) && (
          <div className="text-center mb-8 p-6 bg-white rounded-lg border-2 border-teal-300">
            <h2 className="text-2xl font-bold text-teal-800 mb-2">
              {chapters.find(ch => ch.num === activeChapter).title}
            </h2>
            {chapters.find(ch => ch.num === activeChapter).hebrewTitle && (
              <p className="text-lg text-gray-600 italic">
                {chapters.find(ch => ch.num === activeChapter).hebrewTitle}
              </p>
            )}
          </div>
        )}

        {/* View Mode Selector */}
        <div className="mb-8 flex justify-center gap-2">
          <button
            onClick={() => setActiveSection('interlinear')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeSection === 'interlinear'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-white text-teal-700 border-2 border-teal-300 hover:bg-teal-50'
            }`}
          >
            Word-by-Word
          </button>
          <button
            onClick={() => setActiveSection('pure')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeSection === 'pure'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-white text-teal-700 border-2 border-teal-300 hover:bg-teal-50'
            }`}
          >
            Pure Hebrew
          </button>
          <button
            onClick={() => setActiveSection('bilingual')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeSection === 'bilingual'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-white text-teal-700 border-2 border-teal-300 hover:bg-teal-50'
            }`}
          >
            Bilingual
          </button>
        </div>

        {/* Content Display */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {activeSection === 'interlinear' && renderInterlinear()}
          {activeSection === 'pure' && renderPureHebrew()}
          {activeSection === 'bilingual' && renderBilingual()}
        </div>
      </div>
    </div>
  );
};

export default BookOfAmosPreview;
