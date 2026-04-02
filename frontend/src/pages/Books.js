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
            {/* Real Book Cover Images */}
            <div className="flex-shrink-0">
              <div className="space-y-4">
                {/* Main Cover Image */}
                <img 
                  src="https://m.media-amazon.com/images/I/71n9YqVQIlL._SY466_.jpg"
                  alt="Barashath in the Beginning by Richard Johnson - Book Cover"
                  className="w-64 rounded-lg shadow-xl hover:shadow-2xl transition-shadow"
                />
                {/* Side View - Thickness Photo */}
                <img 
                  src="https://customer-assets.emergentagent.com/job_talk-web-combo/artifacts/ju3vy9pn_IMG_2023.heic"
                  alt="Book thickness and side view"
                  className="w-64 rounded-lg shadow-lg"
                />
                <p className="text-xs text-gray-500 text-center italic">See the quality and substance - 538 pages!</p>
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

        {/* More Books by Richard Johnson */}
        <div className="mt-12 mb-8">
          <h2 className="text-3xl font-bold text-teal-800 mb-6 text-center">More Books by Richard Johnson</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Know Thyself - English */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <img 
                src="https://customer-assets.emergentagent.com/job_talk-web-combo/artifacts/bpdwmvzv_IMG_2028.png"
                alt="Know Thyself, the Knowledge within You"
                className="w-full h-96 object-contain rounded mb-4"
              />
              <h3 className="text-xl font-bold text-teal-800 mb-2">Know Thyself, the Knowledge within You</h3>
              <p className="text-base text-gray-600 mb-2">by Richard Johnson</p>
              <p className="text-sm text-gray-500 mb-4">MainSpring Books</p>
              <div className="flex gap-3">
                <a href="https://www.amazon.com/s?k=Know+Thyself+Knowledge+Within+Richard+Johnson" target="_blank" rel="noopener noreferrer" className="flex-1 bg-teal-600 text-white px-4 py-3 rounded text-center hover:bg-teal-700 font-semibold">Amazon</a>
                <a href="https://www.barnesandnoble.com/s/Richard+Johnson" target="_blank" rel="noopener noreferrer" className="flex-1 bg-teal-600 text-white px-4 py-3 rounded text-center hover:bg-teal-700 font-semibold">B&N</a>
              </div>
            </div>

            {/* Know Thyself - Spanish */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <img 
                src="https://customer-assets.emergentagent.com/job_talk-web-combo/artifacts/dh7jxt50_IMG_2032.png"
                alt="Conócete a Ti Mismo (Spanish Edition)"
                className="w-full h-96 object-contain rounded mb-4"
              />
              <h3 className="text-xl font-bold text-teal-800 mb-2">Conócete a Ti Mismo <span className="text-base">(Edición en Español 🇪🇸)</span></h3>
              <p className="text-base text-gray-600 mb-2">by Richard Johnson</p>
              <p className="text-sm text-gray-500 mb-4">MainSpring Books | Spanish Edition</p>
              <div className="flex gap-3">
                <a href="https://www.amazon.com/s?k=Conocete+Ti+Mismo+Richard+Johnson" target="_blank" rel="noopener noreferrer" className="flex-1 bg-teal-600 text-white px-4 py-3 rounded text-center hover:bg-teal-700 font-semibold">Amazon</a>
                <a href="https://www.barnesandnoble.com/s/Richard+Johnson" target="_blank" rel="noopener noreferrer" className="flex-1 bg-teal-600 text-white px-4 py-3 rounded text-center hover:bg-teal-700 font-semibold">B&N</a>
              </div>
            </div>

            {/* Yachuwshauhal */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <img 
                src="https://customer-assets.emergentagent.com/job_talk-web-combo/artifacts/c7d16spm_IMG_2029.png"
                alt="Yachuwshauhal"
                className="w-full h-96 object-contain rounded mb-4"
              />
              <h3 className="text-xl font-bold text-teal-800 mb-2">Yachuwshauhal</h3>
              <p className="text-base text-gray-600 mb-2">by Richard Johnson</p>
              <p className="text-sm text-gray-500 mb-4">MainSpring Books | ISBN: 9781958434642</p>
              <div className="flex gap-3">
                <a href="https://www.amazon.com/s?k=Yachuwshauhal+Richard+Johnson" target="_blank" rel="noopener noreferrer" className="flex-1 bg-teal-600 text-white px-4 py-3 rounded text-center hover:bg-teal-700 font-semibold">Amazon</a>
                <a href="https://www.barnesandnoble.com/s/Richard+Johnson" target="_blank" rel="noopener noreferrer" className="flex-1 bg-teal-600 text-white px-4 py-3 rounded text-center hover:bg-teal-700 font-semibold">B&N</a>
              </div>
            </div>

            {/* Malachy */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <img 
                src="https://customer-assets.emergentagent.com/job_talk-web-combo/artifacts/jspkmzir_IMG_2030.png"
                alt="Malachy"
                className="w-full h-96 object-contain rounded mb-4"
              />
              <h3 className="text-xl font-bold text-teal-800 mb-2">Malachy</h3>
              <p className="text-base text-gray-600 mb-2">by Richard Johnson</p>
              <p className="text-sm text-gray-500 mb-4">MainSpring Books</p>
              <div className="flex gap-3">
                <a href="https://www.amazon.com/s?k=Malachy+Richard+Johnson" target="_blank" rel="noopener noreferrer" className="flex-1 bg-teal-600 text-white px-4 py-3 rounded text-center hover:bg-teal-700 font-semibold">Amazon</a>
                <a href="https://www.barnesandnoble.com/s/Richard+Johnson" target="_blank" rel="noopener noreferrer" className="flex-1 bg-teal-600 text-white px-4 py-3 rounded text-center hover:bg-teal-700 font-semibold">B&N</a>
              </div>
            </div>

            {/* Yachuwshauhmayka */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <img 
                src="https://customer-assets.emergentagent.com/job_talk-web-combo/artifacts/0fsrmz7h_IMG_2031.png"
                alt="Yachuwshauhmayka"
                className="w-full h-96 object-contain rounded mb-4"
              />
              <h3 className="text-xl font-bold text-teal-800 mb-2">Yachuwshauhmayka</h3>
              <p className="text-base text-gray-600 mb-2">by Richard Johnson</p>
              <p className="text-sm text-gray-500 mb-4">MainSpring Books</p>
              <div className="flex gap-3">
                <a href="https://www.amazon.com/s?k=Yachuwshauhmayka+Richard+Johnson" target="_blank" rel="noopener noreferrer" className="flex-1 bg-teal-600 text-white px-4 py-3 rounded text-center hover:bg-teal-700 font-semibold">Amazon</a>
                <a href="https://www.barnesandnoble.com/s/Richard+Johnson" target="_blank" rel="noopener noreferrer" className="flex-1 bg-teal-600 text-white px-4 py-3 rounded text-center hover:bg-teal-700 font-semibold">B&N</a>
              </div>
            </div>

          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-lg p-8 text-white text-center shadow-xl mt-8">
          <h3 className="text-2xl font-bold mb-4">Explore Ancient Truth</h3>
          <p className="text-lg mb-6">
            Discover Richard Johnson's complete collection of Hebrew translations and biblical research
          </p>
          <a 
            href="https://www.amazon.com/s?k=Richard+Johnson+Hebrew" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-white text-teal-700 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
          >
            View All Books on Amazon
          </a>
        </div>
      </div>
    </div>
  );
};

export default Books;
