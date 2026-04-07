import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import '@/App.css';
import HomePage from './pages/HomePage';
import PageTwo from './pages/PageTwo';
import PageThree from './pages/PageThree';
import PageFour from './pages/PageFour';
import PageFive from './pages/PageFive';
import Podcast from './pages/Podcast';
import Books from './pages/Books';
import Contact from './pages/Contact';
import HebrewAlphabet from './pages/HebrewAlphabet';
import BookOfAmos from './pages/BookOfAmos';
import AdminDashboard from './pages/AdminDashboard';
import AdminPaidMembers from './pages/AdminPaidMembers';
import AdminMarketingTracker from './pages/AdminMarketingTracker';
import Radio from './pages/Radio';
import AdminRadio from './pages/AdminRadio';
import AIChat from './pages/AIChat';
import AIChatPricing from './pages/AIChatPricing';
import AdminAIChat from './pages/AdminAIChat';
import AdminPricingConfig from './pages/AdminPricingConfig';
import InstallApp from './pages/InstallApp';
import PersistentRadioPlayer from './components/PersistentRadioPlayer';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import AdminLogin from './components/AdminLogin';
import AIRichard from './components/AIRichard';
import AIRichardPopup from './components/AIRichardPopup';
import VisitorTracker from './components/VisitorTracker';
import OrdersDashboard from './pages/OrdersDashboard';
import OrderSuccess from './pages/OrderSuccess';
import OrderCancelled from './pages/OrderCancelled';
import WakeServer from './pages/WakeServer';
import TestVoice from './pages/TestVoice';
import Shop from './pages/Shop';

const Navigation = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: '🛒 Shop' },
    { path: '/page-two', label: 'Page Two' },
    { path: '/page-three', label: 'Page Three' },
    { path: '/page-four', label: 'Page Four' },
    { path: '/page-five', label: 'Page Five' },
    { path: '/podcast', label: 'Podcast' },
    { path: '/radio', label: '🎙️ Radio' },
    { path: '/ai-chat', label: '🤖 AI Chat' },
    { path: '/install', label: '📱 Install App' },
    { path: '/books', label: 'Books' },
    { path: '/hebrew-alphabet', label: 'Hebrew Alphabet' },
    { path: '/book-of-amos', label: 'Amos Sample' },
    { path: '/contact', label: 'Contact' }
  ];

  const adminItems = [
    { path: '/admin', label: '🔐 Admin Dashboard' },
    { path: '/admin/radio', label: '📻 Manage Radio' },
    { path: '/admin/orders', label: '💼 Orders' }
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <nav 
      className={`bg-teal-700 text-white w-64 fixed left-0 top-0 bottom-0 p-6 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
      data-testid="main-navigation"
    >
      {/* Scrollable content wrapper */}
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">rjhnsn12</h2>
          <p className="text-sm opacity-90">Biblical Truth & History</p>
        </div>
      <ul className="space-y-2 mb-8">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={handleLinkClick}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`block px-4 py-2 rounded transition-colors ${
                location.pathname === item.path
                  ? 'bg-teal-800 font-semibold'
                  : 'hover:bg-teal-600'
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Admin Quick Access - MOVED UP BEFORE "Bearing of Truth" */}
      <div className="border-2 border-orange-400 rounded-lg p-3 mb-6 bg-orange-900/30">
        <h3 className="text-lg font-bold mb-3 text-orange-300">🔐 ADMIN</h3>
        <ul className="space-y-2">
          {adminItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={handleLinkClick}
                className={`block px-4 py-3 rounded transition-colors text-sm font-semibold ${
                  location.pathname === item.path
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-700 hover:bg-orange-600 text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bearing of the Truth Section */}
      <div className="border-t border-teal-600 pt-6 mt-6 pb-20">
        <h3 className="text-lg font-bold mb-4" data-testid="bearing-truth-title">Bearing of the Truth</h3>
        <div className="text-xs leading-relaxed mb-4 opacity-90">
          <p className="mb-2">Meaning; most of all, it's up to you, to look carefully and read with the spirit of wisdom.</p>
          <p className="mb-2 font-semibold">Gen 9:26 And he said blessed be the lord God of shem; and Canaan shall be his servant.</p>
          <p className="mb-2 italic">Hebrew-9:26 av chw amar barak hava Yachwshah Alasham av Kanaan yash hava abad.</p>
        </div>
        <div className="bg-teal-800 rounded p-3 mb-3">
          <img 
            src="https://static.prod-images.emergentagent.com/jobs/dae91dca-f806-499e-ba09-9fd13250539c/images/bdb3575a2e0272d43fd51db44e327677821fd046ea6f7756c23962cfa688a8b7.png" 
            alt="Ham, Shem, and Japheth - Three sons of Noah"
            className="w-full h-32 object-cover rounded mb-2"
            data-testid="noah-sidebar-image"
          />
          <p className="text-xs text-center font-semibold" data-testid="sons-names">
            HAM, SHEM, AND JAPHETH
          </p>
        </div>
      </div>
      {/* End Bearing of Truth */}
      
      </div>
      {/* End scrollable wrapper */}
    </nav>
  );
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="App" data-testid="app-container">
      <BrowserRouter>
        {/* Visitor Tracker - sends heartbeat every 30 seconds */}
        <VisitorTracker />
        
        {/* AI Richard Auto-Popup - Engages visitors after 10 seconds */}
        <AIRichardPopup />
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-4 left-4 z-50 md:hidden bg-teal-700 text-white p-3 rounded-lg shadow-lg hover:bg-teal-800 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <Navigation isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
        
        <div className="md:ml-64">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/page-two" element={<PageTwo />} />
            <Route path="/page-three" element={<PageThree />} />
            <Route path="/page-four" element={<PageFour />} />
            <Route path="/page-five" element={<PageFive />} />
            <Route path="/podcast" element={<Podcast />} />
            <Route path="/radio" element={<Radio />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/ai-chat/pricing" element={<AIChatPricing />} />
            <Route path="/install" element={<InstallApp />} />
            <Route path="/books" element={<Books />} />
            <Route path="/hebrew-alphabet" element={<HebrewAlphabet />} />
            <Route path="/book-of-amos" element={<BookOfAmos />} />
            
            {/* Protected Admin Routes - Password Required */}
            <Route path="/admin" element={<AdminLogin><AdminDashboard /></AdminLogin>} />
            <Route path="/admin/paid-members" element={<AdminLogin><AdminPaidMembers /></AdminLogin>} />
            <Route path="/admin/marketing-tracker" element={<AdminLogin><AdminMarketingTracker /></AdminLogin>} />
            <Route path="/admin/radio" element={<AdminLogin><AdminRadio /></AdminLogin>} />
            <Route path="/admin/ai-chat" element={<AdminLogin><AdminAIChat /></AdminLogin>} />
            <Route path="/admin/pricing" element={<AdminLogin><AdminPricingConfig /></AdminLogin>} />
            <Route path="/admin/orders" element={<AdminLogin><OrdersDashboard /></AdminLogin>} />
            
            {/* Order Confirmation Pages */}
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/order-cancelled" element={<OrderCancelled />} />
            <Route path="/test-voice" element={<TestVoice />} />
            
            {/* Wake Server - Mobile-friendly wake-up button */}
            <Route path="/wake" element={<WakeServer />} />
            
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
        
        {/* Persistent Radio Player - Shows on all pages except admin */}
        <PersistentRadioPlayer />
        
        {/* AI RICHARD - 24/7 Business Assistant (handles all chat functionality) */}
        <AIRichard />
        
        {/* PWA Install Prompt - Shows on mobile devices */}
        <PWAInstallPrompt />
      </BrowserRouter>
    </div>
  );
}

export default App;
