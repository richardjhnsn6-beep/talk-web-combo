import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import '@/App.css';
import HomePage from './pages/HomePage';
import PageTwo from './pages/PageTwo';
import PageThree from './pages/PageThree';
import PageFour from './pages/PageFour';
import PageFive from './pages/PageFive';
import Podcast from './pages/Podcast';
import Contact from './pages/Contact';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/page-two', label: 'Page Two' },
    { path: '/page-three', label: 'Page Three' },
    { path: '/page-four', label: 'Page Four' },
    { path: '/page-five', label: 'Page Five' },
    { path: '/podcast', label: 'Podcast' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <nav className="bg-teal-700 text-white w-64 min-h-screen fixed left-0 top-0 p-6 overflow-y-auto" data-testid="main-navigation">
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">rjhnsn12</h2>
        <p className="text-sm opacity-90">Biblical Truth & History</p>
      </div>
      <ul className="space-y-2 mb-8">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
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

      {/* Bearing of the Truth Section */}
      <div className="border-t border-teal-600 pt-6 mt-6">
        <h3 className="text-lg font-bold mb-4" data-testid="bearing-truth-title">Bearing of the Truth</h3>
        <div className="text-xs leading-relaxed mb-4 opacity-90">
          <p className="mb-2">Meaning; most of all, it's up to you, to look carefully and read with the spirit of wisdom.</p>
          <p className="mb-2 font-semibold">Gen 9:26 And he said blessed be the lord God of shem; and Canaan shall be his servant.</p>
          <p className="mb-2 italic">Hebrew-9:26 av chw amar barak hava Yachwshah Alasham av Kanaan yash hava abad.</p>
        </div>
        <div className="bg-teal-800 rounded p-3 mb-3">
          <img 
            src="https://images.unsplash.com/photo-1739997698837-8267626ffe92?w=300&h=250&fit=crop" 
            alt="Ham, Shem, and Japheth - Three sons of Noah"
            className="w-full h-32 object-cover rounded mb-2"
            data-testid="noah-sidebar-image"
          />
          <p className="text-xs text-center font-semibold" data-testid="sons-names">
            HAM, SHEM, AND JAPHETH
          </p>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <div className="App" data-testid="app-container">
      <BrowserRouter>
        <Navigation />
        <div className="ml-64">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/page-two" element={<PageTwo />} />
            <Route path="/page-three" element={<PageThree />} />
            <Route path="/page-four" element={<PageFour />} />
            <Route path="/page-five" element={<PageFive />} />
            <Route path="/podcast" element={<Podcast />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
