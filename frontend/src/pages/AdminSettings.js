import React, { useState, useEffect } from 'react';

const AdminSettings = () => {
  const [otherWebsiteUrl, setOtherWebsiteUrl] = useState('');
  const [otherWebsiteName, setOtherWebsiteName] = useState('Other Website');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedUrl = localStorage.getItem('other_website_url') || '';
    const savedName = localStorage.getItem('other_website_name') || 'Other Website';
    setOtherWebsiteUrl(savedUrl);
    setOtherWebsiteName(savedName);
  }, []);

  const handleSave = () => {
    localStorage.setItem('other_website_url', otherWebsiteUrl);
    localStorage.setItem('other_website_name', otherWebsiteName);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <a
            href="/admin"
            className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-lg text-white px-6 py-3 rounded-lg border border-purple-700/30 hover:bg-slate-700/50 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin Dashboard
          </a>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">⚙️ Site Settings</h1>
          <p className="text-purple-200 text-lg">Manage your website links and settings</p>
        </div>

        {/* Settings Form */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-700/30">
          <h2 className="text-2xl font-bold text-white mb-6">🔗 Other Website Link</h2>
          
          <div className="space-y-6">
            {/* Website Name */}
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">
                Button Name (What visitors see)
              </label>
              <input
                type="text"
                value={otherWebsiteName}
                onChange={(e) => setOtherWebsiteName(e.target.value)}
                placeholder="e.g., Book of Amos Site, Old Website, Hebrew Studies"
                className="w-full bg-slate-900/50 text-white px-4 py-3 rounded-lg border border-purple-700/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-purple-300 text-xs mt-2">
                This appears on the button (e.g., "🌐 Book of Amos Site")
              </p>
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">
                Website URL (Paste your link here)
              </label>
              <input
                type="url"
                value={otherWebsiteUrl}
                onChange={(e) => setOtherWebsiteUrl(e.target.value)}
                placeholder="https://your-other-website.com"
                className="w-full bg-slate-900/50 text-white px-4 py-3 rounded-lg border border-purple-700/30 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
              <p className="text-purple-300 text-xs mt-2">
                Paste the full URL (including https://)
              </p>
            </div>

            {/* Preview */}
            {otherWebsiteUrl && (
              <div className="bg-slate-900/50 p-4 rounded-lg border border-green-500/30">
                <p className="text-green-300 text-sm mb-2">✅ Preview:</p>
                <a
                  href={otherWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  🌐 {otherWebsiteName}
                </a>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              💾 Save Settings
            </button>

            {/* Success Message */}
            {saved && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-200 text-center">
                ✅ Settings saved! Visit your Contact page to see the updated link.
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <h3 className="text-white font-bold mb-3">📋 How to Use:</h3>
            <ol className="text-blue-200 space-y-2 text-sm">
              <li>1. Enter a name for the button (e.g., "Book of Amos Site")</li>
              <li>2. Paste your website URL in the field above</li>
              <li>3. Click "Save Settings"</li>
              <li>4. Go to your Contact page (/contact) - the link will appear there!</li>
              <li>5. Tell AI Richard: "Guide customers to the link page to see the other site"</li>
            </ol>
          </div>

          {/* Current Settings Display */}
          <div className="mt-6 bg-slate-900/50 rounded-lg p-6 border border-purple-700/30">
            <h3 className="text-white font-bold mb-3">📊 Current Settings:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-300">Button Name:</span>
                <span className="text-white font-mono">{otherWebsiteName || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">URL:</span>
                <span className="text-white font-mono text-xs break-all">{otherWebsiteUrl || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Where It Appears */}
        <div className="mt-8 bg-gradient-to-r from-teal-600/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-8 border border-teal-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">👀 Where This Link Appears:</h2>
          <ul className="text-purple-200 space-y-2">
            <li>✅ Contact page (/contact) - under "Follow on Social Media"</li>
            <li>✅ Visitors click the button → Opens your other website</li>
            <li>✅ AI Richard can guide people to the Contact page to find this link</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
