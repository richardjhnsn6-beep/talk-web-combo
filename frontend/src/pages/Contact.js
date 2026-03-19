const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" data-testid="contact-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 py-8 px-8 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 text-center" data-testid="page-title">
          Contact Rjhnsn12
        </h1>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-teal-800 mb-6" data-testid="contact-title">
            Get In Touch
          </h2>

          <div className="prose max-w-none text-gray-700">
            <div className="space-y-6">
              <div className="p-6 bg-teal-50 rounded-lg border-l-4 border-teal-600">
                <h3 className="text-xl font-semibold text-teal-800 mb-2">Email</h3>
                <p className="text-lg">
                  <a href="mailto:richardjhnsn6@gmail.com" className="text-teal-700 hover:text-teal-900" data-testid="email-link">
                    richardjhnsn6@gmail.com
                  </a>
                </p>
              </div>

              <div className="p-6 bg-teal-50 rounded-lg border-l-4 border-teal-600">
                <h3 className="text-xl font-semibold text-teal-800 mb-2">Location</h3>
                <p className="text-lg">
                  Beaumont, Texas 77703
                </p>
              </div>

              <div className="p-6 bg-teal-50 rounded-lg border-l-4 border-teal-600">
                <h3 className="text-xl font-semibold text-teal-800 mb-2">Original Website</h3>
                <p className="text-lg">
                  <a href="http://shm2.jimdo.com" target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:text-teal-900" data-testid="website-link">
                    http://shm2.jimdo.com
                  </a>
                </p>
              </div>

              <div className="p-6 bg-teal-50 rounded-lg border-l-4 border-teal-600">
                <h3 className="text-xl font-semibold text-teal-800 mb-4">Follow on Social Media</h3>
                <div className="flex flex-wrap gap-4">
                  <a 
                    href="YOUR_FACEBOOK_URL_HERE" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    📘 Facebook
                  </a>
                  <a 
                    href="YOUR_INSTAGRAM_URL_HERE" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    📷 Instagram
                  </a>
                  <a 
                    href="YOUR_TWITTER_URL_HERE" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    🐦 Twitter
                  </a>
                  <a 
                    href="YOUR_MYSPACE_URL_HERE" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    🎵 MySpace
                  </a>
                  <a 
                    href="YOUR_YOUTUBE_URL_HERE" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    ▶️ YouTube
                  </a>
                </div>
              </div>

              <div className="mt-8 p-6 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <p className="text-gray-700 italic">
                  "From what I will give you, it will help battle against people that only want to profit. 
                  When the True Fire comes he is Eternal"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
