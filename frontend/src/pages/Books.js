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

      <div className="max-w-6xl mx-auto p-8">
        {/* Support Banner */}
        <div className="mb-8">
          <a href="/radio" className="block group">
            <img 
              src="https://static.prod-images.emergentagent.com/jobs/dae91dca-f806-499e-ba09-9fd13250539c/images/b7882843150cf3e728692580af6fe88bcc6518edefc8563689ad3c80cedcbeb5.png"
              alt="Support True Knowledge"
              className="w-full h-40 object-cover rounded-lg shadow-lg group-hover:shadow-2xl transition-all"
            />
          </a>
        </div>

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
              <p className="text-xl text-gray-600 mb-2 italic">by Richard Johnson</p>
              
              <div className="text-sm text-gray-600 mb-4 space-y-1">
                <p><span className="font-semibold">📖 Pages:</span> 538</p>
                <p><span className="font-semibold">🌍 Language:</span> Hebrew Edition</p>
                <p><span className="font-semibold">📚 Publisher:</span> Mainspring Books</p>
                <p><span className="font-semibold">📐 Dimensions:</span> 6 x 1.09 x 9 inches</p>
                <p><span className="font-semibold">💵 Price:</span> $20.99</p>
                <p><span className="font-semibold">📋 ISBN:</span> 979-8891141964</p>
              </div>
              
              <div className="flex gap-4 mb-6">
                <a 
                  href="https://www.amazon.com/a/c/r/tyelOqLX6JjGvzl0LHdjCyI3i" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  data-testid="amazon-link"
                >
                  Buy on Amazon
                </a>
                <a 
                  href="https://www.barnesandnoble.com/s/Richard+Johnson" 
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

          {/* Hebrew System Banner */}
          <div className="mt-8">
            <a href="/page-two" className="block group">
              <img 
                src="https://static.prod-images.emergentagent.com/jobs/dae91dca-f806-499e-ba09-9fd13250539c/images/0b3440b12a9bf7b882f6b7bd8658c0f354cdefe37cdba2fa7307055e6b0a9bd5.png"
                alt="Discover the 20-Letter TRUE Hebrew Alphabet"
                className="w-full h-48 object-cover rounded-lg shadow-lg group-hover:shadow-2xl transition-all"
              />
            </a>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-lg p-8 text-white text-center shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Available Now</h3>
          <p className="text-lg mb-6">
            Discover the deeper meaning of creation through meticulous Hebrew translation
          </p>
          <a 
            href="https://www.amazon.com/a/c/r/tyelOqLX6JjGvzl0LHdjCyI3i" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-white text-teal-700 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
          >
            Order on Amazon
          </a>
        </div>
      </div>
    </div>
  );
};

export default Books;
