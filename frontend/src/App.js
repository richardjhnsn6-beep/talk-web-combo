import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import '@/App.css';
import HomePage from './pages/HomePage';
import PageTwo from './pages/PageTwo';
import PageThree from './pages/PageThree';
import PageFour from './pages/PageFour';
import PageFive from './pages/PageFive';
import Contact from './pages/Contact';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/page-two', label: 'Page Two' },
    { path: '/page-three', label: 'Page Three' },
    { path: '/page-four', label: 'Page Four' },
    { path: '/page-five', label: 'Page Five' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <nav className="bg-teal-700 text-white w-64 min-h-screen fixed left-0 top-0 p-6" data-testid="main-navigation">
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">rjhnsn12</h2>
        <p className="text-sm opacity-90">Biblical Truth & History</p>
      </div>
      <ul className="space-y-2">
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
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
