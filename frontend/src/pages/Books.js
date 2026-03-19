const Books = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" data-testid="books-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 py-8 px-8 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 text-center" data-testid="page-title">
          Books by Richard Johnson
        </h1>
        <p className="text-center text-white mt-3 text-lg">
          Hebrew Translations and Biblical Truth
        </p>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* Book Feature */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
            {/* Book Cover Placeholder */}
            <div className="flex-shrink-0">
              <div className="w-48 h-64 bg-gradient-to-br from-teal-800 to-teal-600 rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-center p-4">
                  <h3 className="text-yellow-300 font-bold text-xl mb-2">BARASHATH</h3>
                  <p className="text-white text-sm">In the BEGINNING</p>
                  <div className="mt-4 text-yellow-200 text-xs">
                    <p>Richard Johnson</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Info */}
            <div className="flex-grow">
              <h2 className="text-3xl font-bold text-teal-800 mb-2">
                Barashath in the Beginning
              </h2>
              <p className="text-xl text-gray-600 mb-4 italic">by Richard Johnson</p>
              
              <div className="flex gap-4 mb-6">
                <a 
                  href="https://www.amazon.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  data-testid="amazon-link"
                >
                  Buy on Amazon
                </a>
                <a 
                  href="https://www.barnesandnoble.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  data-testid="bn-link"
                >
                  Barnes & Noble
                </a>
              </div>
            </div>
          </div>

          {/* Blog Content */}
          <div className="prose max-w-none">
            <h3 className="text-2xl font-bold text-teal-800 mb-4">
              When the First Word Is Not What You Were Told—What Else Have You Missed?
            </h3>

            <p className="text-gray-700 leading-relaxed mb-4">
              What if the opening words of creation—words you think you already know—have been quietly 
              misunderstood for centuries?
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              <em>Barashath in the Beginning</em> by Richard Johnson dares to ask that question—and then 
              refuses to let it go. At the heart of this book is a bold premise: that meaning was embedded 
              in the earliest language of creation with an intentional depth that later translations 
              softened, simplified, or obscured. Johnson draws readers directly into the raw linguistic 
              terrain of the ancient text, where every word carries weight, structure, and consequence. 
              Here, creation is not merely spoken—it is constructed, ordered, and revealed through language itself.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              The atmosphere of <em>Barashath in the Beginning</em> is deliberate and reverent, yet 
              intellectually restless. The text moves with the gravity of scripture but the curiosity of 
              a scholar unwilling to accept surface answers. Readers encounter unfamiliar spellings, 
              phonetic structures, and transliterations that slow the reading experience—by design. This 
              book asks you to pause, to look again, to question what you have been taught to skim past.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              For spiritually curious readers, this work offers a deeper engagement with Genesis that feels 
              both ancient and startlingly fresh. For thinkers, linguists, and truth-seekers, it presents 
              a disciplined challenge: What happens when we return to the source, not the summary?
            </p>

            <div className="bg-teal-50 p-6 rounded-lg border-l-4 border-teal-600 my-6">
              <p className="text-gray-800 font-semibold">
                A meticulous, transliterated presentation of Genesis that invites readers to slow down 
                and engage closely with the structure and language of the biblical text.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">
              Richard Johnson's voice is steady and unflinching. He does not sensationalize the text; 
              he trusts it. By preserving structure, repetition, and linguistic form, he invites readers 
              into a closer encounter with the original cadence of creation—one that feels less interpreted 
              and more encountered. This is not a book that tells you what to believe. It is a book that 
              asks whether you are willing to re-examine belief itself.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4 font-semibold text-lg text-teal-800">
              If the first words were misunderstood, what might that change about everything that follows?
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-lg p-8 text-white text-center shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Available Now</h3>
          <p className="text-lg mb-6">
            Discover the deeper meaning of creation through meticulous Hebrew translation
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a 
              href="https://www.amazon.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-teal-700 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
            >
              Order on Amazon
            </a>
            <a 
              href="https://www.barnesandnoble.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-teal-700 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
            >
              Order on Barnes & Noble
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Books;
