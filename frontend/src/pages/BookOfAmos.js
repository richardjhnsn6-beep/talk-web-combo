import React, { useState, useEffect } from 'react';

const BookOfAmos = () => {
  const [activeSection, setActiveSection] = useState('interlinear');
  const [activeChapter, setActiveChapter] = useState(1);
  const [isUnlocked, setIsUnlocked] = useState(false); // Paywall ACTIVE - must pay to unlock
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [maxScrollDepth, setMaxScrollDepth] = useState(0);
  const [scrollMilestones, setScrollMilestones] = useState({
    25: false,
    50: false,
    75: false,
    100: false
  });

  // Check if content is unlocked (from localStorage or URL)
  useEffect(() => {
    // Track page view
    trackPageView();

    // Check for preview mode (for author to verify content)
    const urlParams = new URLSearchParams(window.location.search);
    const previewMode = urlParams.get('preview');
    if (previewMode === 'author') {
      setIsUnlocked(true);
      return;
    }

    // Check localStorage
    const unlocked = localStorage.getItem('amos_chapter1_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }

    // Check URL for payment success
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, []);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Calculate scroll percentage
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercentage = Math.round((scrollTop / scrollableHeight) * 100);
      
      // Update max scroll depth
      if (scrollPercentage > maxScrollDepth) {
        setMaxScrollDepth(scrollPercentage);
        
        // Track milestones
        const newMilestones = { ...scrollMilestones };
        let shouldTrack = false;
        
        if (scrollPercentage >= 25 && !scrollMilestones[25]) {
          newMilestones[25] = true;
          shouldTrack = true;
        }
        if (scrollPercentage >= 50 && !scrollMilestones[50]) {
          newMilestones[50] = true;
          shouldTrack = true;
        }
        if (scrollPercentage >= 75 && !scrollMilestones[75]) {
          newMilestones[75] = true;
          shouldTrack = true;
        }
        if (scrollPercentage >= 100 && !scrollMilestones[100]) {
          newMilestones[100] = true;
          shouldTrack = true;
        }
        
        if (shouldTrack) {
          setScrollMilestones(newMilestones);
          trackScrollDepth(scrollPercentage, scrollPercentage);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [maxScrollDepth, scrollMilestones]);

  const trackScrollDepth = async (scrollPercentage, maxDepth) => {
    try {
      let visitorId = localStorage.getItem('visitor_id');
      if (!visitorId) {
        visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('visitor_id', visitorId);
      }
      
      let sessionId = sessionStorage.getItem('book_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('book_session_id', sessionId);
      }

      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/book-scroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: visitorId,
          scroll_percentage: scrollPercentage,
          max_depth: maxDepth,
          session_id: sessionId
        })
      });
    } catch (error) {
      console.error('Scroll tracking error:', error);
    }
  };

  const trackPageView = async () => {
    try {
      // Generate or get visitor ID
      let visitorId = localStorage.getItem('visitor_id');
      if (!visitorId) {
        visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('visitor_id', visitorId);
      }

      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/pageview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: 'Book of Amos',
          visitor_id: visitorId,
          user_agent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const verifyPayment = async (sessionId) => {
    setIsProcessingPayment(true);
    const maxAttempts = 5;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/v1/checkout/status/${sessionId}`);
        const data = await response.json();
        
        if (data.payment_status === 'paid') {
          localStorage.setItem('amos_chapter1_unlocked', 'true');
          setIsUnlocked(true);
          setIsProcessingPayment(false);
          // Remove session_id from URL
          window.history.replaceState({}, '', '/book-of-amos');
          return;
        } else if (data.status === 'expired') {
          setIsProcessingPayment(false);
          alert('Payment session expired. Please try again.');
          return;
        }
        
        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Payment verification error:', error);
      }
    }
    
    setIsProcessingPayment(false);
    alert('Payment verification timed out. Please refresh the page or contact support.');
  };

  const handleUnlockPayment = async () => {
    try {
      const originUrl = window.location.origin;
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/v1/checkout/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_id: 'chapter1_unlock',
          origin_url: originUrl,
          metadata: {
            content: 'Book of Amos - Chapter 1 Full',
            verses: '6-15'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error initiating payment. Please try again.');
    }
  };

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
    },
    { 
      num: 5, 
      title: "Israel Punished for Oppressing the Poor",
      hebrewTitle: "yasharaAl anak al ashaq al dal"
    },
    { 
      num: 6, 
      title: "Woe to the Complacent",
      hebrewTitle: "howy Shaanan"
    },
    { 
      num: 7, 
      title: "Visions of Judgment",
      hebrewTitle: "chazown Mashaphat"
    },
    { 
      num: 8, 
      title: "The Basket of Summer Fruit",
      hebrewTitle: "kaluwb qayts"
    },
    { 
      num: 9, 
      title: "Israel's Restoration",
      hebrewTitle: "yasharaAl Shuwb"
    }
  ];

  // Sample content for Chapter 1 - Pure Hebrew (continuous text)
  const chapter1PureHebrew = [
    { verse: 1, text: "dabar al Amac Ashar hayach bayn Naqad al Taqowa Ashar chazeh al yasharaal al yowm Ozayah Malak al Yahadah aw al yowm Yaraboam ban Yoash Malak al yasharaal shanaym shana al raash" },
    { verse: 2, text: "aw huw amar Yachuwshua al Tsayown shaagh aw al Yaruwshalayim Nathan qowl aw abal Nayah al Raah aw yabash rosh al Karmal" },
    { verse: 3, text: "kah amar Yachuwshua al shalowsh pasha al Dammashaq aw al arba law shuwb al Ky dawsh al Galaad al charuwts al barzel" },
    { verse: 4, text: "aw shalach esh al bayth Chazaal aw akal armown ban Hadad" },
    { verse: 5, text: "aw shabar bariyach Dammashaq aw karath yashab al biqah Aven aw tamak shebet al bayth Adan aw galah am Aram Qiyr amar Yachuwshua" },
  ];

  // Chapter 1 - Interlinear (word-by-word alignment) - Using user's reference image
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
      hebrew: ["kah", "amar", "Yachuwshua", "al", "shalowsh", "pasha", "al", "Dammashaq", "aw", "al", "arba", "law", "shuwb", "cuwr", "avan", "Ky", "Duwsh", "al", "Galaad", "ad", "charuts", "dachavah", "al", "barzal"],
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
  
  // Chapter 2 - Interlinear (word-by-word alignment)
  const chapter2Interlinear = {
    verse1: {
      hebrew: ["Kah", "Amar", "al", "Yachuwshuah", "yth", "Shalawsh", "pasha", "al", "Mawab", "aw", "yth", "Araba", "ahy", "aLah", "Shawb", "cawr", "Avan", "al", "huw", "Asaraph", "atsam", "al", "aMalak", "Al", "Adam", "al", "Asayad"],
      english: ["Thus", "saith", "The", "LORD", "For", "three", "transgressions", "of", "Moab", "and", "For", "four", "I will", "not", "turn", "away", "the punishment", "thereof", "because", "he burned", "bones", "of the", "king", "of", "Edom", "into", "lime"]
    },
    verse2: {
      hebrew: ["han", "ahy", "shalach", "Ash", "al", "aMawb", "aw", "yash", "akal", "Aramown", "al", "qaryawTh", "aw", "aMawb", "yash", "aMaw", "awd", "Shaawn", "awd", "Tarawah", "aw", "awd", "qawl", "Shaphar"],
      english: ["but", "I will", "send", "a fire", "upon", "Moab", "and", "it shall", "devour", "the palaces", "of", "Kirioth", "and", "Moab", "shall", "die", "with", "Tumult", "with", "shouting", "and", "with", "the sound of the", "trumpet"]
    },
    verse3: {
      hebrew: ["aw", "ahy", "karath", "al", "Shaphat", "al", "qarab", "Sham", "aw", "ahy", "harag", "kal", "aSar", "al", "awd", "Naphash", "Amar", "al", "Yachuwahuah"],
      english: ["And", "I will", "cut off", "the", "Judge", "from the", "Midst", "thereof", "And", "I will", "slay", "all the", "princes", "thereof", "with", "him", "saith", "the", "LORD"]
    },
    verse4: {
      hebrew: ["Kah", "Amar", "al", "Yachuwshuah", "yth", "Shalawsh", "pasha", "al", "yachadad", "aw", "yth", "Araba", "ahy", "aLah", "Shawb", "cawr", "Avan", "shamal", "cham", "hayach", "aMaac", "Tarach", "al", "Yachuwshuah", "aw", "hayach", "aLah", "Sham", "Naphash", "chaq", "aw", "Cham", "kazab", "Nathan", "Cham", "taah", "achar", "Asar", "Cham", "Ab", "hayach", "halak"],
      english: ["Thus", "said", "the", "LORD", "for", "three", "transgressions", "of", "Judah", "and", "for", "four", "I will", "not", "turn", "away", "the punishment", "thereof", "because", "they have", "despised", "the law", "of", "the LORD", "and", "have", "not", "kept", "his", "commandments", "and", "their", "lies", "caused", "them to", "err", "after the", "which", "their", "fathers", "have", "walked"]
    },
    verse5: {
      hebrew: ["han", "ahy", "Shalac", "Ash", "al", "yachadad", "aw", "yash", "akal", "Aramawn", "al", "Shalam"],
      english: ["but", "I will", "send", "a fire", "upon", "Judah", "and", "it shall", "devour", "the palaces", "of", "Jerusalem"]
    },
    verse6: {
      hebrew: ["kah", "Amar", "al", "Yachuwshuah", "yth", "shalawsh", "pasha", "al", "yasharaA1", "aw", "yth", "Araba", "ahy", "aLah", "Shawb", "cawr", "Avan", "al", "Cham", "aMakar", "Tsaddayq", "ka", "caph", "Abyawn", "yth", "cawl", "al", "Naalaal"],
      english: ["Thus", "saith", "the", "LORD", "for", "three", "transgressions", "of", "Israel", "and", "for", "four", "I will", "not", "turn", "away", "the punishment", "thereof because", "they", "sold", "the righteous", "for", "silver", "the poor", "for", "a pair", "of", "shoes"]
    },
    verse7: {
      hebrew: ["ky", "Shaaph", "achar", "aphar", "al", "Arats", "al", "Rash", "al", "Abyawn", "aw", "Natah", "adarak", "al", "ahayv", "aw", "Kash", "aw", "Naphash", "Ab", "ahy", "yalak", "huw", "Naarah", "Chalal", "Any", "qadash", "Sham"],
      english: ["That", "pant", "after", "the dust", "of the", "earth", "on the", "head", "of the", "poor", "and", "turn aside", "the way", "of the", "Meek", "and", "a man", "and", "his", "father", "will", "go in unto", "the same", "maid", "to profane", "my", "Holy", "name"]
    },
    verse8: {
      hebrew: ["aw", "Cham", "Natah", "Cham", "yarad", "al", "bagad", "Shawm", "Chabal", "adarak", "kal", "aMazabaah", "aw", "Cham", "Shathah", "yayn", "al", "Anash", "al", "Bayth", "al", "Cham", "AlaSham"],
      english: ["And", "they", "lay", "themselves", "down", "upon", "clothes", "laid to", "pledge", "by", "every", "altar", "and", "they", "Drink", "the wine", "of", "the condemned", "in", "the house", "of", "their", "god"]
    },
    verse9: {
      hebrew: ["awd", "Shamad", "Any", "phanym", "Cham", "Amaray", "Asar", "gabahh", "hayach", "kamah", "al", "Araz", "aw", "haw", "hayach", "Chacan", "allaw", "awd", "Any", "Shamad", "Naphash", "aphray", "Maal", "Aw", "Naphash", "Sharash", "al", "Tachath"],
      english: ["yet", "destroyed", "I", "before", "them", "Amorite", "whose", "height", "was", "like", "the", "cedars", "and", "he", "was", "strong as the", "oak", "yet", "I", "destroyed", "his", "fruit", "from above", "and", "his", "roots", "from", "beneath"]
    },
    verse10: {
      hebrew: ["gam", "Any", "Alah", "attanah", "al", "Arats", "al", "aMatsaraym", "aw", "yalak", "attanah", "Araba", "Shanah", "al", "aMadAbar", "yarash", "Arats", "al", "Amaray"],
      english: ["Also", "I", "brought", "you", "from", "the land", "of", "Egypt", "and", "led", "you", "forty", "years", "through the", "wilderness", "to possess", "the land", "of the", "Amorite"]
    },
    verse11: {
      hebrew: ["aw", "Any", "qawm", "al", "Naphash", "ban", "yth", "Nabay", "aw", "al", "Naphash", "Bachawr", "yth", "Nazar", "yash", "aLah", "aph", "Zath", "hawy", "attanah", "ban", "yasharaal", "Amar", "Yachuwshuah"],
      english: ["and", "I", "raised up", "of", "your", "sons", "for", "prophets", "and", "of", "your", "young", "for", "Nazarites", "is it", "not", "even", "thus", "O", "ye", "children", "of", "Israel", "saith", "the LORD"]
    },
    verse12: {
      hebrew: ["han", "attanah", "Nazar", "yayn", "Shaqaqh", "aw", "Tsavah", "Nabay", "Naba", "aLah"],
      english: ["But", "ye gave", "the Nazarites", "wine", "to drink", "and", "commanded", "prophets", "prophecy", "not"]
    },
    verse13: {
      hebrew: ["hannah", "hayach", "awq", "Tachath", "attanah", "al", "agalah", "huw", "awq", "yash", "Tachath", "attanah", "al", "agalah", "huw", "awq", "Mala", "al", "Amayr"],
      english: ["behold", "I am", "pressed", "under", "you", "as", "a cart", "is", "pressed", "that is", "under", "you", "as", "a cart", "is", "pressed", "full", "of", "sheaves"]
    },
    verse14: {
      hebrew: ["gam", "Manawc", "yash", "Abad", "al", "qal", "aw", "Chazaq", "yash", "aLah", "Amats", "Naphash", "kaach", "aLah", "yash", "gabbawr", "aMalat", "Naphash"],
      english: ["therefore", "the flight", "shall", "perish", "from the", "swift", "and", "the strong", "shall", "not", "strengthen", "his", "force", "neither", "shall the", "mighty", "deliver", "himself"]
    },
    verse15: {
      hebrew: ["aLah", "yash", "Amad", "ky", "Taphash", "qashath", "aw", "huw", "qal", "ragal", "yash", "aLah", "aMalat", "Naphash", "aLah", "yash", "huw", "ky", "Rakab", "cawc", "aMalat", "Naphash"],
      english: ["neither", "shall", "he stand", "that", "handleth", "the bow", "and", "he that is", "swift", "of foot", "shall", "not", "deliver", "himself", "neither", "shall", "he", "that", "rideth", "the horse", "deliver", "himself"]
    },
    verse16: {
      hebrew: ["Aw", "huw", "Amamyts", "aBayn", "gabbar", "yash", "Nawc", "cawr", "Arawm", "al", "ky", "yawm", "Amar", "al", "Yachuwshuah"],
      english: ["And", "he that is", "courageous", "among the", "mighty", "shall", "flee away", "Naked", "in", "that", "day", "saith", "the", "LORD"]
    }
  };

  // Chapter 3 - Interlinear (word-by-word alignment) - PLACEHOLDER
  const chapter3Interlinear = {
    verse1: {
      hebrew: ["Shama", "Zath", "adAbar", "ky", "al", "Yachuwshuah", "Hayah", "adAbar", "al", "attanah", "havy", "ban", "al", "yasharaAl", "Kal", "aMashaphachah", "Asar", "Any", "Alah", "al", "Arats", "al", "aMatsaraym", "Amar"],
      english: ["HEAR", "this", "word", "that", "the", "LORD", "hath", "spoken", "against", "you", "O", "children", "of", "Israel", "The whole", "family", "which", "I", "brought up", "from the", "land", "of", "Egypt", "saying"]
    },
    verse2: {
      hebrew: ["attanah", "raq", "yash", "yada", "al", "kal", "aMashphachah", "al", "Arats", "al", "ahy", "paqad", "attanah", "kan", "kal", "Naphash", "Avan"],
      english: ["you", "only", "have", "I known", "of", "all the", "family", "of the", "earth", "therefore", "I will", "punish", "you", "for", "all", "your", "iniquity"]
    },
    verse3: {
      hebrew: ["halak", "Shanaym", "Yalak", "yachad", "Balaty", "Cham", "yaad"],
      english: ["Can", "two", "walk", "together", "except", "they", "be agreed"]
    },
    verse4: {
      hebrew: ["Ahy", "Aray", "ShaaG", "al", "yaar", "Asar", "huw", "hayach", "Ayn", "Taraph", "ahy", "kaphayr", "Nathan", "al", "Naphash", "Mawnah", "huw", "hayach", "aLakad", "abalaty"],
      english: ["Will", "a lion", "roar", "in", "the forest", "when", "he", "hath", "no", "prey", "Will", "a young lion", "cry out", "of", "his", "den", "he", "have", "taken", "nothing"]
    },
    verse5: {
      hebrew: ["yakal", "Tsappar", "Naphal", "phach", "al", "Arats", "ayach", "lah", "Maqash", "yash", "kan", "Naphash", "Yash", "gabar", "alah", "phach", "al", "Arats", "aw", "hayach", "laqach", "lah", "aw", "kal"],
      english: ["can", "a bird", "fall in", "a snare", "Upon the", "earth", "where", "no", "gin", "is", "for", "him", "shall", "one", "take up", "a snare", "from the", "earth", "and", "have", "taken", "nothing", "at", "all"]
    },
    verse6: {
      hebrew: ["yash", "shaphar", "Taqa", "Ayar", "aw", "Am", "Lah", "charad", "yash", "sham", "ra", "al", "Ayar", "aw", "al", "yachuwshuah", "lah", "Ashah", "yash"],
      english: ["shall", "a trumpet", "be blown", "city", "and", "the people", "not", "be afraid", "shall", "there", "be evil", "in", "a city", "and", "the", "LORD", "not", "done", "it"]
    },
    verse7: {
      hebrew: ["Ky", "al", "Adanay", "Yachuwshuah", "ahy", "Ashah", "aLah", "han", "huw", "galah", "Naphash", "abad", "Nabay"],
      english: ["Surely", "the", "LORD", "God", "will", "do", "nothing", "but", "he", "revealeth", "his", "servants", "prophets"]
    },
    verse8: {
      hebrew: ["al", "Aray", "hayach", "ShaaG", "my", "ahy", "aLah", "yara", "al", "Adanay", "Yachuwshuah", "hayach", "adaBar", "My", "yakal", "han", "Naba"],
      english: ["the", "lion", "hath", "roared", "who", "will", "not", "fear", "the", "LORD", "God", "hath", "spoken", "who", "Can", "but", "prophesy"]
    },
    verse9: {
      hebrew: ["Shama", "al", "Aramawn", "aw", "Ashadawd", "aw", "al", "Aramawn", "al", "Arats", "al", "aMatsaraym", "aw", "Amar", "acaph", "Naphash", "al", "har", "al", "Shamarwn", "aw", "raah", "Rab", "aMahawmah", "qarab", "shamal", "aw", "Ashaq", "tavak", "shamal"],
      english: ["publish", "in", "the palaces", "at", "Ashdod", "and", "in", "the palaces", "in", "the land", "of", "Egypt", "and", "say", "Assemble", "yourselves", "upon", "the mountain", "of", "Samaria", "and", "behold", "the great", "Tumults", "in the midst", "thereof", "and", "the oppressed", "in the midst", "thereof"]
    },
    verse10: {
      hebrew: ["Kan", "Cham", "yada", "aLah", "Ashah", "Nakacah", "Naam", "al", "Yachuwshuah", "My", "atsar", "Chamac", "aw", "Shad", "al", "Cham", "Aramawn"],
      english: ["For", "they", "know", "not", "to do", "right", "saith", "the", "LORD", "who", "store up", "violence", "and", "robbery", "in", "their", "palaces"]
    },
    verse11: {
      hebrew: ["al", "kan", "Amar", "al", "Adanay", "Yachuwshuah", "tsar", "Sham", "yash", "aph", "cabayb", "Arats", "aw", "huw", "yash", "yarad", "Naphash", "Az", "al", "attanah", "aw", "Naphash", "Aramawn", "yash", "bazaz"],
      english: ["Therefore", "thus", "saith", "the", "Lord", "God", "an adversary", "there", "Shall be", "even", "round about", "the land", "and", "he", "shall", "bring down", "thy", "strength", "from", "thee", "and", "thy", "palaces", "shall be", "spoiled"]
    },
    verse12: {
      hebrew: ["Raah", "Natsal", "al", "pah", "al", "Aray", "shanaym", "kara", "aw", "badal", "al", "Azan", "kan", "yash", "Ban", "al", "yasharaAl", "Natsal", "ky", "yashab", "Shamarwn", "al", "Mattah", "aw", "al", "Damamashaq", "Arash"],
      english: ["the Shepherd", "taken out", "of", "mouth", "of the", "lion", "two", "legs", "and", "a piece", "of", "an ear", "so", "shall", "the children", "of", "Isreal", "taken out", "that", "dwell in", "Samaria", "of", "a bed", "and", "in", "Damarcus", "in a couch"]
    },
    verse13: {
      hebrew: ["shama", "attanah", "aw", "awd", "al", "Bayth", "al", "Yaaqab", "Naam", "al", "Adanay", "AlaShham", "al", "Tsabaach"],
      english: ["Hear", "ye", "and", "Testify", "in the", "house", "of", "Jacob", "saith", "the", "Lord", "God", "of", "host"]
    },
    verse14: {
      hebrew: ["Ky", "yawm", "ky", "yash", "paqad", "pasha", "al", "yasharaAl", "al", "Naphash", "ahy", "gam", "paqad", "Mazabaach", "al", "Baythal", "aw", "qaran", "al", "Mazabaach", "yash", "gada", "aw", "Naphal", "Arats"],
      english: ["that in the", "the day", "that", "I shall", "visit", "transgressions", "of", "Isreal", "upon", "him", "I will", "also", "visit", "the altars", "of", "Bethel", "and", "the horns", "of", "Altar", "shall be", "cut off", "and", "fall to", "the ground"]
    },
    verse15: {
      hebrew: ["aw", "ahy", "Nakah", "charaph", "Bayth", "awd", "qayarts", "Bayth", "aw", "al", "Bayth", "al", "shan", "yash", "Bad", "aw", "Rab", "bayth", "yash", "hayach", "cawph", "Naam", "Yachuwshuah"],
      english: ["And", "I will", "smite", "the winter", "house", "with", "the summer", "house", "and", "the", "house", "of", "ivory", "shall", "perish", "and", "the great", "houses", "shall", "have", "an end", "saith", "LORD"]
    }
  };

  const chapter4Interlinear = {
    verse1: {
      hebrew: ["Shama", "Zah", "adabar", "attanah", "pharach", "al", "Bashan", "ky", "hy", "al", "har", "al", "Shamarwn", "Asar", "Ashaq", "dal", "Asar", "ratsats", "abyown", "Cham", "adabar", "amar", "Cham", "adown", "bow", "aw", "yanach", "anachnw", "Shathah"],
      english: ["Hear", "this", "word", "ye", "kine", "of", "Bashan", "that", "are", "in the", "mountain", "of", "Samaria", "which", "oppress", "the poor", "which", "Crush", "the needy", "their", "word", "say to", "their", "masters", "bring", "and", "Let", "us", "drink"]
    },
    verse2: {
      hebrew: ["al", "Adanay", "YaChuwshuah", "baal", "Shaba", "darak", "Naphash", "qadash", "han", "yowm", "yash", "bow", "al", "attahah", "han", "huw", "ahy", "Nasa", "attanah", "Nasa", "owd", "Tsannah", "aw", "Naphash", "acharyth", "owd", "cayr"],
      english: ["The", "Lord", "GOD", "hath", "sworn", "by", "his", "holiness", "that", "the days", "shall", "come", "upon", "you", "that", "he", "will", "take", "you", "away", "with", "hooks", "and", "your", "posterity", "with", "fish, hooks"]
    },
    verse3: {
      hebrew: ["aw", "yash", "yatsa", "aw", "pharats", "Kashashah", "pharach", "aw", "han", "Asar", "Nadan", "Naphash", "aw", "yash", "Shalak", "Cham", "al", "haramown", "Naam", "al", "YaChuwshuah"],
      english: ["and", "ye shall", "go out", "at", "the breaches", "every", "cow", "at", "that", "which is", "before", "her", "and", "ye shall", "cast", "them", "into the", "palaces", "saith", "the", "LORD"]
    },
    verse4: {
      hebrew: ["bow", "Baythal", "aw", "pasha", "aw", "Galgal", "Rabah", "pasha", "aw", "bow", "Naphash", "Zabach", "Kashhash", "aw", "Naphash", "MaASar", "al", "shalowsh", "yowm"],
      english: ["come to", "Beth-el", "and", "Transgress;", "at", "Gilgal", "Multiply", "Transgression", "and", "bring", "your", "a sacrifice", "every", "morning", "and", "your", "tithes", "after", "three", "years"]
    },
    verse5: {
      hebrew: ["aw", "qatar", "Zabach", "al", "Tow dah", "owd", "ChamatZ", "aw", "qara", "aw", "Shama", "habahab", "al", "kah", "attana", "howy", "attah", "ban", "al", "yasharaAI", "Naam", "al", "Adanay", "YaChuwshuah"],
      english: ["and", "offer", "a sacrifice", "of", "thanksgiving", "with", "Leaven", "and", "proclaim", "and", "publish", "the free offerings", "for", "this liketh", "you", "O", "ye", "children", "of", "Israel", "saith", "the", "Lord", "GOD"]
    },
    verse6: {
      hebrew: ["aw", "Any", "hayah", "gam", "Nathan", "attah", "Naqqayan", "al", "Shan", "kal", "Naphash", "Ayar", "aw", "Chacar", "Lacham", "kal", "Naphash", "Maqawn", "awd", "hayah", "attanah", "Lah", "shawb", "al", "Any", "Amar", "al", "Yachuwshuah"],
      english: ["And", "I", "have", "also", "given", "you", "cleanness", "of", "teeth", "and all", "your", "city", "and", "want of", "bread", "in all", "your", "places", "yet", "have", "ye", "not", "returned", "unto", "me", "saith", "the", "LORD"]
    },
    verse7: {
      hebrew: ["aw", "gam", "any", "havah", "Mana", "gasham", "al", "attah", "Asar", "Sham", "hayach", "owd", "Shalowsh", "Chadash", "qatsayr", "aw", "any", "Nathan", "yash", "Matar", "al", "achad", "ayar", "aw", "Nathan", "yash", "Lah", "Matar", "al", "achad", "Ayar", "achad", "badal", "Matar", "aw", "al", "badal", "Asar", "al", "Matar", "Lah", "yabash"],
      english: ["And", "also", "I", "have", "withholden", "the rain", "from", "you", "when", "there", "were", "yet", "three", "Months", "to the harvest", "and", "I", "caused", "it", "to rain", "upon", "one", "City", "and", "caused", "it", "not", "to rain", "upon", "another", "City", "one", "piece", "rained", "and", "the", "piece", "where", "upon", "rained", "not", "withered"]
    },
    verse8: {
      hebrew: ["kan", "Shanaym", "aw", "Shalowsh", "ayar", "Nuwa", "al", "achad", "ayar", "Shathah", "Maym", "han", "Cham", "hayach", "Lah", "Shabaa", "owd", "hayach", "attah", "Lah", "Shuwb", "al", "any", "Naam", "al", "YaChuwshuah"],
      english: ["So", "Two", "or", "Three", "Cities", "wandered", "unto", "one", "City", "to drink", "water", "but", "they", "were", "not", "Satisfied", "yet", "have", "ye", "not", "returned", "unto", "me", "saith", "the", "LORD"]
    },
    verse9: {
      hebrew: ["yash", "Nakah", "attah", "owd", "Shadaphah", "aw", "yaraqown", "Asar", "Naphash", "gannah", "aw", "Naphash", "Taan", "aTs", "aw", "Naphash", "aTs", "Rabah", "gazam", "akal", "Cham", "owd", "havah", "attah", "Lah", "Shuwb", "al", "any", "Naam", "al", "YaChuwshuah"],
      english: ["I have", "smitten", "you", "with", "blasting", "and", "mildew", "when", "your", "gardens", "and", "your", "fig", "trees", "and", "your", "trees", "increased", "the palmerworm", "devoured", "them", "yet", "have", "ye", "not", "returned", "unto", "me", "saith", "the", "LORD"]
    },
    verse10: {
      hebrew: ["yash", "Shalach", "bayn", "attah", "adabar", "al", "darak", "al", "Matsaraym", "Naphash", "bachar", "anash", "havah", "any", "garag", "owd", "Chacab", "aw", "havah", "Shabay", "Naphash", "cuwc", "aw", "Any", "havah", "Ashah", "baash"],
      english: ["I have", "sent", "among", "you", "the pestilence", "after", "the manner", "of", "Egypt", "your", "men", "men", "have", "I", "slain", "with", "the word", "and", "have", "taken away", "your", "horses", "and", "I", "have", "made", "the stink"]
    },
    verse11: {
      hebrew: ["al", "Naphash", "Machanah", "alah", "al", "Naphash", "aph", "owd", "havah", "attah", "Lah", "Shuwb", "al", "any", "Naam", "al", "YaChuwshuah", "yash", "haphak", "allah", "al", "attah", "hy", "AlaSham", "Mahapakah", "cadam", "aw", "Amarah", "aw", "attah", "hayach", "hy", "uwd", "Natsal", "al", "Asaraphah", "owd", "havah", "attah", "Lah", "Shuwb", "al", "any", "Naam", "al", "YaChuwshuah"],
      english: ["of", "your", "camps", "to come up", "unto", "your", "Nostrils", "yet", "have", "ye", "not", "returned", "unto", "me", "saith", "the", "LORD", "I have", "overthrown", "some", "of", "you", "as", "God", "overthrew", "Sodom", "and", "Gomorrah", "and", "ye", "were", "as", "firebrand", "plucked out", "of the", "burning", "yet", "have", "ye", "not", "returned", "unto", "me", "saith", "the", "LORD"]
    },
    verse12: {
      hebrew: ["al", "kan", "ahy", "aw", "aqab ky", "ahy", "ashah", "kan", "al", "attah", "kuwn", "qarah", "attah", "AlaSham", "howy", "yasharaAl"],
      english: ["Therefore", "Thus", "will I", "and", "because", "I will", "do", "this", "unto", "thee", "prepare", "to meet", "thy", "God", "O", "Israel"]
    },
    verse13: {
      hebrew: ["al", "han", "hy", "ky", "yatsar", "har", "aw", "bara", "ruwach", "aw", "Nagad", "al", "Adam", "My", "hy", "Naphash", "Shach", "ky", "ashah", "Shachar", "ayphah", "aw", "darak", "al", "bamah", "Maqowm", "al", "Arats", "al", "YaChuwshuah", "Tsabaach", "hy", "Naphash", "Sham"],
      english: ["For", "Lo", "he", "that", "formeth", "the mountains", "and", "createth", "the wind", "and", "declareth", "unto", "man", "what", "is", "his", "thought", "that", "Maketh", "the morning", "darkness", "and", "treadeth", "upon the", "high", "places", "of", "the earth", "the", "LORD", "host", "is", "his", "name"]
    }
  };

  // Chapter 5 - Interlinear (verses 1-15, partial chapter - more to be added)
  const chapter5Interlinear = {
    verse1: {
      hebrew: ["Shama", "attanah", "kah", "adabar", "Asar", "Any", "Nasa", "al", "attah", "aph", "qaynah", "hawy", "Bayth", "al", "yasharaAl"],
      english: ["Hear", "ye", "this", "word", "which", "I", "take up", "against", "you", "even", "a", "lamentation", "O", "house", "of", "Israel"]
    },
    verse2: {
      hebrew: ["Bathawlah", "yasharaAl", "hy", "Naphal", "Naphash", "lash", "lah", "awd", "qaym", "Naphash", "hy", "Natash", "al", "Naphash", "Adamah", "Sham", "hy", "Any", "qaym", "Naphash"],
      english: ["The virgin", "of Israel", "is", "fallen", "she shall", "No", "more", "rise up", "she is", "forsaken", "upon", "her", "land", "there is", "none", "to", "rise", "her", "up"]
    },
    verse3: {
      hebrew: ["kan", "Amar", "adanay", "Yachuwshuah", "al", "Ayar", "ky", "yatsa", "darak", "alaph", "yash", "Shaar", "Maah", "aw", "ky", "Asar", "yatsa", "adarak", "Maah", "yash", "Shaar", "Asar", "al", "Bayth", "al", "yasharaAl"],
      english: ["For", "this", "saith", "the Lord", "God", "the City", "that", "went out", "by", "a thousand", "shall", "leave", "hundred", "and", "which", "went forth", "by", "a hundred", "shall", "leave", "ten", "to the", "house", "of", "Israel"]
    },
    verse4: {
      hebrew: ["kan", "Amar", "al", "Yachuwshuah", "al", "Bayth", "al", "yasharaAl", "adarah", "attah", "Any", "aw", "attah", "yash", "Chayah"],
      english: ["For", "this", "saith", "the", "LORD", "unto", "the house", "of", "Israel", "Seek", "ye", "me", "and", "ye", "shall", "Live"]
    },
    verse5: {
      hebrew: ["han", "adarash", "aLah", "Baythal", "aLah", "baw", "al", "Galgal", "aw", "Abar", "aLah", "al", "Baar", "Shaba", "al", "Galgal", "yash", "ky", "yatsa", "al", "galah", "aw", "Baythal", "yash", "hayach", "Avan"],
      english: ["But", "Seek", "not", "Beth-el", "nor", "enter", "into", "Gilgal", "and", "pass", "not", "to", "Beer-sheba", "for", "Gilgal", "shall", "Surely", "go", "into", "captivity", "and", "Beth-el", "shall", "come to", "naught"]
    },
    verse6: {
      hebrew: ["adarash", "al", "Yachuwshuah", "aw", "yash", "Chayah", "pan", "huw", "Tsalaach", "kamaw", "Ash", "al", "Bayth", "al", "yawcaph", "aw", "akal", "aw", "Sham", "haya", "Ayn", "kabah", "yash", "al", "Baythal"],
      english: ["Seek", "The", "LORD", "and", "ye", "shall", "live", "lest", "he", "break out", "like", "fire", "in the", "house", "of", "Joseph", "and", "devour", "it", "and", "there be", "none", "to quench", "it in", "Beth-el"]
    },
    verse7: {
      hebrew: ["attah", "haphahk", "aMashaphaTh", "aLaanah", "aw", "yanach", "atSadagaq", "al", "Arats"],
      english: ["ye", "who", "turn", "judgment", "to", "wormwood", "and", "leave off", "righteousness", "in the", "earth"]
    },
    verse8: {
      hebrew: ["adarash", "Naphash", "ky", "Ashah", "kayamah", "aw", "Kashal", "aw", "haphak", "al", "Tsalmawath", "al", "Baqar", "aw", "yowm", "Chashak", "al", "Laylah", "aw", "qara", "al", "Maym", "al", "yam", "aw", "Shaphak", "al", "phanym", "al", "Arats", "Yachuwshuah", "Sham"],
      english: ["Seek", "him", "that", "maketh", "the seven stars", "and", "Orion", "and", "turneth", "the", "shadow of death", "into the", "morning", "and", "maketh the", "day", "dark", "with", "night", "that", "calleth", "for the", "waters", "of the", "Sea", "and", "poureth", "them out", "upon the", "face", "of the", "earth", "The", "LORD", "is his", "name"]
    },
    verse9: {
      hebrew: ["ky", "Balag", "Shad", "al", "Az", "kan", "Shad", "yash", "baw", "al", "aMabatsar"],
      english: ["That", "strengtheneth", "the spoiled", "against", "the strong", "so that", "the spoiled", "shall", "come", "against", "the fortress"]
    },
    verse10: {
      hebrew: ["Cham", "Sana", "Naphash", "ky", "yakach", "al", "Shaar", "aw", "Cham", "Taab", "Naphash", "ky", "adabar", "Tamaym"],
      english: ["They", "hate", "him", "that", "rebuketh", "in the", "gate", "and", "they", "abhor", "him", "that", "speaketh", "uprightly"]
    },
    verse11: {
      hebrew: ["yaan", "al", "kan", "Naphash", "Bashac", "hy", "al", "adal", "aw", "aw", "attah", "aLaqach", "al", "Naphash", "aMashah", "al", "Abar", "attah", "aBanah", "aBayth", "al", "gazayth", "han", "yash", "alLah", "yashab", "Cham", "attah", "havah", "nata", "Chamad", "karam", "han", "yash", "alAh", "Shathah", "yayn", "al", "Cham"],
      english: ["Forasmuch", "therefore", "as", "your", "treading", "is", "upon the", "poor", "and", "ye", "take", "from", "him", "burdens", "of", "wheat", "ye", "have", "built", "houses", "of", "hewn stone", "but", "ye", "shall", "not", "dwell", "in them", "ye have", "planted", "pleasant", "vineyards", "but", "ye shall", "not", "drink", "wine", "of", "them"]
    },
    verse12: {
      hebrew: ["al", "Any", "yada", "Naphash", "Rab", "pasha", "aw", "Naphash", "atSawm", "Chattaah", "Cham", "atSarar", "aTsaddayq", "Cham", "aLaqach", "Kaphar", "aw", "Cham", "Natah", "abyawn", "al", "Shaar", "al", "Cham", "Nakachach"],
      english: ["For", "I", "know", "your", "manifold", "Transgressions", "and", "your", "mighty", "Sins", "they", "afflict", "the just", "they", "take", "a bribe", "and", "they", "turn aside", "the poor", "in the", "gate", "from", "their", "right"]
    },
    verse13: {
      hebrew: ["kan", "al", "Sakal", "yash", "Shamar", "aDamam", "ky", "aTh", "al", "yash", "aw", "Ra", "aTh"],
      english: ["therefore", "the", "prudent", "shall", "keep", "silence", "in that", "time", "for", "it is", "an", "evil", "time"]
    },
    verse14: {
      hebrew: ["adarash", "Tab", "aw", "lah", "Ra", "ky", "attah", "yakal", "Chayah", "aw", "kan", "Yachuwshuah", "aLaSham", "al", "aTsabaah", "yash", "attah"],
      english: ["Seek", "good", "and", "not", "evil", "that", "ye", "may", "Live", "and", "so", "the", "LORD", "God", "of", "hosts", "shall be", "with", "you", "as ye", "have", "spoken"]
    },
    verse15: {
      hebrew: ["Sana", "Ra", "aw", "ahab", "Tab", "aw", "yatsag", "aMashaphaTh", "al", "Shaar", "yash", "yaka", "l", "ky", "Yachuwshuah", "aLaSham", "al", "aTsabaah", "Chanan", "al", "Shaarayth", "al", "yawcaph"],
      english: ["Hate", "the evil", "and", "love", "the good", "and", "establish", "judgment", "in the", "gate", "it may be", "that", "the", "LORD", "God", "of", "hosts", "will be", "gracious", "unto the", "remnant", "of", "Joseph"]
    },
    verse16: {
      hebrew: ["kan", "amar", "Yachuwshuah", "aLaSham", "al", "aTsabaah", "adanay", "al", "kol", "rachab", "aMacpad", "aw", "al", "kol", "chuwts", "amar", "hah", "hah", "aw", "qara", "aiykar", "al", "abal", "aw", "al", "aMacpad", "yada", "Naphash", "qaynah"],
      english: ["Therefore", "thus saith", "the", "LORD", "the God", "of", "hosts", "the Lord", "In all", "public squares", "there shall be", "wailing", "and in all", "the", "streets", "they shall", "cry", "Alas", "Alas", "and the", "husbandman", "shall be", "called to", "mourning", "and to", "wailing", "the skillful of", "lamentation"]
    },
    verse17: {
      hebrew: ["aw", "al", "kol", "karam", "aMacpad", "ky", "Abar", "al", "qarab", "amar", "Yachuwshuah"],
      english: ["And in all", "the", "vineyards", "there shall be", "wailing", "for", "I will", "pass", "through", "the midst", "of thee", "saith", "the", "LORD"]
    },
    verse18: {
      hebrew: ["howy", "awah", "al", "yowm", "Yachuwshuah", "al", "zath", "yowm", "Yachuwshuah", "chashak", "huw", "aw", "lah", "owr"],
      english: ["Woe", "unto you", "that", "desire", "the day", "of the", "LORD", "To what", "end", "is it", "for you", "The day", "of the", "LORD", "is", "darkness", "and not", "light"]
    },
    verse19: {
      hebrew: ["Asar", "nuwc", "aysh", "al", "phanym", "aryah", "aw", "pachad", "al", "dab", "aw", "baw", "al", "bayth", "aw", "camak", "yad", "al", "qayar", "aw", "nachash", "nachash"],
      english: ["As if", "a man", "did flee", "from", "a lion", "and a bear", "met", "him", "or went", "into the", "house", "and", "leaned", "his hand", "on the", "wall", "and a", "serpent", "bit", "him"]
    },
    verse20: {
      hebrew: ["lah", "chashak", "yowm", "Yachuwshuah", "aw", "lah", "owr", "aw", "Apal", "aw", "lah", "Nagahh"],
      english: ["Shall not", "the day", "of the", "LORD", "be", "darkness", "and not", "light", "Even very", "dark", "and no", "brightness", "in it"]
    },
    verse21: {
      hebrew: ["Cana", "maac", "Naphash", "chag", "aw", "lah", "reyach", "al", "Naphash", "Atsarah"],
      english: ["I", "hate", "I despise", "your", "feast days", "and I will", "not", "smell", "in your", "solemn", "assemblies"]
    },
    verse22: {
      hebrew: ["ky", "Alah", "alah", "olah", "aw", "Minchah", "lah", "ratsah", "aw", "Shalam", "Naphash", "mariy", "lah", "nabat"],
      english: ["Though", "ye offer", "me", "burnt offerings", "and your", "meat offerings", "I will", "not", "accept them", "neither", "will I", "regard", "the peace", "offerings", "of your", "fat", "beasts"]
    },
    verse23: {
      hebrew: ["cuwr", "al", "Any", "hamown", "Naphash", "shiyr", "aw", "zimrah", "Naphash", "nabal", "lah", "shama"],
      english: ["Take thou", "away", "from me", "the noise", "of thy", "songs", "for I will", "not", "hear", "the melody", "of thy", "viols"]
    },
    verse24: {
      hebrew: ["aw", "galal", "kamaw", "Maym", "aMashaphaTh", "aw", "Tsadagaq", "kamaw", "nachal", "aythan"],
      english: ["But let", "judgment", "run down", "as", "waters", "and", "righteousness", "as a", "mighty", "stream"]
    },
    verse25: {
      hebrew: ["zabach", "aw", "Minchah", "Nagash", "al", "Any", "al", "Midbar", "arbaim", "shanah", "Bayth", "yasharaAl"],
      english: ["Have ye", "offered", "unto me", "sacrifices", "and", "offerings", "in the", "wilderness", "forty", "years", "O house", "of", "Israel"]
    },
    verse26: {
      hebrew: ["aw", "Nasa", "Cakuwth", "Malak", "aw", "Kaywan", "Tsalam", "kokab", "aLaSham", "Asar", "Ashah"],
      english: ["Yea", "ye have", "borne", "the tabernacle", "of your", "Moloch", "and", "Chiun", "your", "images", "the star", "of your", "god", "which ye", "made to", "yourselves"]
    },
    verse27: {
      hebrew: ["aw", "galah", "al", "halah", "Dammashaq", "amar", "Yachuwshuah", "aLaSham", "aTsabaah", "Sham"],
      english: ["Therefore", "will I", "cause you", "to go", "into", "captivity", "beyond", "Damascus", "saith", "the", "LORD", "whose name", "is The God", "of", "hosts"]
    }
  };

  const chapter6Interlinear = {
    verse1: {
      hebrew: ["howy", "Cham", "Shaanan", "Tsayown", "aw", "batach", "al", "har", "al", "Shamarwn", "Asar", "hy", "naqab", "Rashayth", "al", "al", "bowy", "al", "bath", "al", "yasharaAl", "bow"],
      english: ["WOE", "to them", "that are", "at ease", "in", "Zion", "and", "trust", "in the", "mountain", "of", "Samaria", "which are", "named", "chief", "of the", "congregations", "to whom", "the house", "of", "Israel", "came"]
    },
    verse2: {
      hebrew: ["abar", "attah", "al", "kalnah", "aw", "raah", "aw", "al", "Sham", "yalak", "Attah", "Chamath", "al", "Rab", "az", "yarad", "Gath", "al", "Palashtay", "Tab", "Cham", "Tab", "Man", "allah", "Mamlaka", "aw", "Cham", "gabal", "Rab", "Man", "Naphash", "gabal"],
      english: ["Pass ye", "unto", "Calneh", "and", "see", "and from", "thence", "go ye", "to", "Hamath", "the", "great", "then", "go down", "to", "Gath", "of the", "Philistines", "be they", "better", "than", "these", "kingdoms", "or is", "their", "border", "greater", "than", "your", "border"]
    },
    verse3: {
      hebrew: ["attah", "ky", "shalack", "Rachag", "Nadah", "Ra", "yowm", "aw", "dan", "shabath", "al", "Chamac", "Nagash", "ky"],
      english: ["Ye", "that", "put far", "away", "the evil", "day", "and", "cause", "the seat", "of", "violence", "to come", "near"]
    },
    verse4: {
      hebrew: ["ky", "shakaab", "al", "Mattah", "al", "shan", "aw", "carach", "Cham", "al", "Cham", "aras", "aw", "akal", "kar", "al", "tsaan", "aw", "agal", "al", "tavak", "al", "Marabaq"],
      english: ["That", "lie", "upon", "beds", "of", "ivory", "and", "stretch", "themselves", "upon", "their", "couches", "and", "eat", "the lambs", "out of", "the flock", "and the", "calves", "out of", "the midst", "of the", "stall"]
    },
    verse5: {
      hebrew: ["ky", "parat", "pah", "al", "Nabal", "aw", "Chashab", "Cham", "kalay", "al", "shayr", "kamow", "ThuwThMashash"],
      english: ["That", "chant", "to the", "sound", "of the", "viol", "and", "invent", "to themselves", "instruments", "of", "music", "like", "David"]
    },
    verse6: {
      hebrew: ["ky", "shathah", "yayn", "Mazaaq", "aw", "Mashach", "Cham", "owd", "Rashayth", "Shaman", "han", "hy", "lah", "chalah", "kan", "shabar", "Dyaecaph"],
      english: ["That", "drink", "wine", "in", "bowls", "and", "anoint", "themselves", "with the", "chief", "ointments", "but they", "are", "not", "grieved", "for the", "affliction", "of", "Joseph"]
    },
    verse7: {
      hebrew: ["al", "kan", "attah", "yash", "Cham", "yarad", "galah", "owd", "Rash", "ky", "yarad", "galah", "aw", "Marazach", "al", "Cham", "ky", "carach", "Cham", "yash", "cuwr"],
      english: ["Therefore", "now", "shall they", "go", "captive", "with the", "first", "that go", "captive", "and the", "banquet", "of them", "that", "stretched", "themselves", "shall be", "removed"]
    },
    verse8: {
      hebrew: ["Adanany", "YaChwshuah", "aHyach", "shaba", "Naphash", "Naam", "al", "YaCuwshuah", "AlaSham", "al", "Tsabaah", "any", "Taab", "gaown", "al", "yaaqab", "aw", "Sana", "Naphash", "Aramown", "kan", "aHy", "cagar", "ayr", "owd", "Mala"],
      english: ["The LORD", "GOD", "hath", "sworn", "by", "himself", "saith", "the", "LORD", "the God", "of", "hosts", "I", "abhor", "the excellency", "of", "Jacob", "and", "hate", "his", "palaces", "therefore", "will I", "deliver up", "the city", "with all", "that is", "therein"]
    },
    verse9: {
      hebrew: ["aw", "yash", "hayach", "abar", "am", "Sham", "yathar", "Asar", "al", "achad", "bayth", "ky", "Cham", "yash", "Mawth"],
      english: ["And it", "shall", "come to", "pass", "if there", "remain", "ten", "men", "in", "one", "house", "that they", "shall", "die"]
    },
    verse10: {
      hebrew: ["aw", "adan", "dwd", "yash", "Nasa", "Naphash", "Nasa", "aw", "huw"],
      english: ["And a", "man's", "uncle", "shall", "take him", "up", "and he", "that", "burneth him"]
    }
  };

  const chapter7Interlinear = {
    verse1: {
      hebrew: ["kah", "raah", "Adanay", "YaChuwshuah", "han", "hy", "yatsar", "gobay", "al", "tachala", "alah", "laqash", "aw", "han", "hy", "laqash", "achar", "gazay", "al", "malak"],
      english: ["Thus", "hath", "the Lord", "GOD", "shewed", "unto me", "and behold", "he", "formed", "grasshoppers", "in the", "beginning", "of the", "shooting up", "of the", "latter", "growth", "and lo", "it was", "the latter", "growth", "after", "the king's", "mowings"]
    },
    verse2: {
      hebrew: ["aw", "hayach", "abar", "am", "kala", "alakal", "al", "Asab", "al", "Arats", "aw", "amar", "Adanay", "YaChuwshuah", "calach", "Nasa", "any", "al", "My", "quwm", "yaaqab", "ky", "qatan", "huw"],
      english: ["And it", "came to", "pass", "that when", "they had", "made an", "end", "of eating", "the grass", "of the", "land", "then I", "said", "O Lord", "GOD", "forgive", "I beseech", "thee", "by whom", "shall", "Jacob", "arise", "for he", "is", "small"]
    },
    verse3: {
      hebrew: ["nacham", "YaChuwshuah", "al", "zath", "lah", "hayach", "amar", "Adanay", "YaChuwshuah"],
      english: ["The LORD", "repented", "for", "this", "It shall", "not be", "saith", "the LORD"]
    },
    verse4: {
      hebrew: ["kah", "raah", "Adanay", "YaChuwshuah", "han", "hy", "qara", "al", "riyb", "owd", "Ash", "Adanay", "YaChuwshuah", "aw", "akal", "al", "Tahawm", "Rab", "aw", "akal", "al", "chalaq"],
      english: ["Thus", "hath", "the Lord", "GOD", "shewed", "unto me", "and behold", "the Lord", "GOD", "called", "to contend", "by", "fire", "and it", "devoured", "the great", "deep", "and did", "eat up", "a", "part"]
    },
    verse5: {
      hebrew: ["aw", "amar", "Adanay", "YaChuwshuah", "chadal", "Nasa", "any", "al", "My", "quwm", "yaaqab", "ky", "qatan", "huw"],
      english: ["Then", "said I", "O Lord", "GOD", "cease", "I beseech", "thee", "by whom", "shall", "Jacob", "arise", "for he", "is", "small"]
    },
    verse6: {
      hebrew: ["nacham", "YaChuwshuah", "al", "zath", "gam", "hyw", "lah", "hayach", "amar", "Adanay", "YaChuwshuah"],
      english: ["The LORD", "repented", "for", "this", "This", "also", "shall", "not be", "saith", "the Lord", "GOD"]
    },
    verse7: {
      hebrew: ["kah", "raah", "han", "hy", "Adanay", "natsab", "al", "chawmah", "al", "anak", "aw", "anak", "owd", "yad"],
      english: ["Thus", "he", "shewed me", "and behold", "the Lord", "stood", "upon", "a wall", "made by", "a plumbline", "with", "a plumbline", "in his", "hand"]
    },
    verse8: {
      hebrew: ["aw", "amar", "YaChuwshuah", "al", "any", "amac", "My", "attah", "raah", "aw", "amar", "anak", "aw", "amar", "Adanay", "han", "any", "cuwm", "anak", "al", "qarab", "al", "yasharaAl", "lah", "awd", "acaph", "abar", "al"],
      english: ["And the", "LORD", "said", "unto me", "Amos", "what", "seest", "thou", "And I", "said", "A plumbline", "Then", "said", "the Lord", "Behold", "I will", "set", "a plumbline", "in the", "midst", "of my", "people", "Israel", "I will", "not", "again", "pass by", "them", "any more"]
    },
    verse9: {
      hebrew: ["aw", "shamam", "bamah", "al", "yatschaq", "aw", "maqdash", "al", "yasharaAl", "yash", "charab", "aw", "quwm", "al", "bayth", "al", "yarabaam", "owd", "charab"],
      english: ["And the", "high places", "of Isaac", "shall be", "desolate", "and the", "sanctuaries", "of", "Israel", "shall be", "laid waste", "and I will", "rise", "against", "the house", "of", "Jeroboam", "with the", "sword"]
    },
    verse10: {
      hebrew: ["aw", "shalach", "amatzyah", "kohan", "al", "Baythal", "al", "yarabaam", "malak", "al", "yasharaAl", "amar", "amac", "qashar", "al", "attah", "al", "qarab", "al", "bayth", "al", "yasharaAl", "lah", "yakal", "al", "Arats", "kuwl", "al", "dabar"],
      english: ["Then", "Amaziah", "the priest", "of", "Bethel", "sent", "to", "Jeroboam", "king", "of", "Israel", "saying", "Amos", "hath", "conspired", "against", "thee", "in the", "midst", "of the", "house", "of", "Israel", "the land", "is not", "able", "to bear", "all his", "words"]
    },
    verse11: {
      hebrew: ["kah", "Amac", "amar", "yarabaam", "yash", "Muwth", "charab", "aw", "yasharaAl", "yash", "kay", "yalalc", "Nadah", "galah", "al", "ban", "yash", "al", "Tama", "adamah", "aw", "yasharaAl", "yash", "kay", "yalalc", "galah", "yatsa", "al", "Naphash", "adamah"],
      english: ["For", "thus", "Amos", "saith", "Jeroboam", "shall", "die", "by the", "sword", "and", "Israel", "shall", "surely", "be led", "away", "captive", "out of", "their own", "land"]
    },
    verse12: {
      hebrew: ["gam", "yachashahAmats", "amar", "al", "Amac", "howy", "charah", "yalak", "barach", "attanah", "yalak", "al", "arats", "al", "yachadah", "aw", "Sham", "schal", "lacham", "aw", "Naba", "Sham"],
      english: ["Also", "Amaziah", "said", "unto", "Amos", "O thou", "seer", "go", "flee thee", "away", "into the", "land", "of", "Judah", "and there", "eat", "bread", "and", "prophesy", "there"]
    },
    verse13: {
      hebrew: ["han", "Naba", "lah", "yacaph", "kal", "owd", "baad", "baythal", "kah", "yash", "Malach", "Maqadash", "aw", "yash", "al", "Mamalakah", "bayth"],
      english: ["But", "prophesy", "not", "again", "any more", "at", "Bethel", "for it", "is the", "king's", "chapel", "and it", "is the", "king's", "court"]
    },
    verse14: {
      hebrew: ["az", "anah", "Amac", "aw", "amar", "yachashahAmats", "yash", "lah", "Nabay", "lah", "yash", "Nabay", "ban", "han", "yash", "baqar", "aw", "balac", "al", "Shagam", "paray"],
      english: ["Then", "answered", "Amos", "and", "said", "to", "Amaziah", "I was", "no", "prophet", "neither", "was I", "a prophet's", "son", "but I", "was an", "herdman", "and a", "gatherer", "of", "sycamore", "fruit"]
    },
    verse15: {
      hebrew: ["aw", "al", "YaChuWshuah", "laqach", "yash", "yalak", "achar", "Tsan", "aw", "YaChuWshuah", "amar", "al", "any", "yalak", "Naba", "al", "any", "yasharaAl"],
      english: ["And the", "LORD", "took me", "as I", "followed", "the", "flock", "and the", "LORD", "said", "unto me", "Go", "prophesy", "unto my", "people", "Israel"]
    },
    verse16: {
      hebrew: ["attah", "kan", "Shama", "dabar", "al", "YaChuWshuah", "amar", "Naba", "lah", "al", "yashara", "Al", "aw", "Nataph", "lah", "dabar", "al", "bayth", "la", "yashachag"],
      english: ["Now", "therefore", "hear", "thou the", "word", "of the", "LORD", "Thou", "sayest", "Prophesy", "not", "against", "Israel", "and", "drop", "not", "thy word", "against", "the house", "of", "Isaac"]
    },
    verse17: {
      hebrew: ["kan", "kah", "amar", "YaChuWshuah", "attah", "Kashashah", "yash", "zanah", "al", "ayar", "aw", "yash", "ban", "aw", "yash", "ban", "yash", "Naphal", "daralc", "charab", "aw", "yash", "adamah", "yash", "chalaq", "chabal", "aw", "yash", "Muwth", "al", "Tama", "adamah", "aw", "yasharaAl", "yash", "kay", "yalak", "galah", "yatsa", "al", "Naphash", "adamah"],
      english: ["Therefore", "thus", "saith", "the", "LORD", "Thy", "wife", "shall be", "an harlot", "in the", "city", "and thy", "sons", "and thy", "daughters", "shall", "fall", "by the", "sword", "and thy", "land", "shall be", "divided", "by", "line", "and thou", "shalt", "die", "in a", "polluted", "land", "and", "Israel", "shall", "surely", "go into", "captivity", "out of", "his own", "land"]
    }
  };

  const chapter8Interlinear = {
    verse1: {
      hebrew: ["koh", "hayach", "Adanay", "YaChuwshuah", "ray", "hannah", "kalab", "qayts"],
      english: ["Thus", "hath", "the LORD", "GOD", "shewed", "unto me", "and behold", "a basket", "of", "summer", "fruit"]
    },
    verse2: {
      hebrew: ["aw", "hy", "amar", "Amac", "Mah", "raah", "aw", "any", "kalaq", "qayts", "az", "amar", "YaChuwshuah", "al", "any", "qats", "bow", "al", "amy", "am", "al", "yasharaAl", "al", "lah", "yaceaph", "abar", "Cham", "kal", "owd"],
      english: ["And", "he", "said", "Amos", "what", "seest", "thou", "And I", "said", "A basket", "of", "summer", "fruit", "Then", "said", "the LORD", "unto me", "The end", "is come", "upon", "my people", "of", "Israel", "I will", "not", "again", "pass by", "them", "any more"]
    },
    verse3: {
      hebrew: ["aw", "shayr", "al", "haykal", "yash", "yalal", "ky", "yowm", "amar", "Adanay", "YaChuwshuah", "Shah", "Rab", "pagar", "kal", "Maqowm", "Cham", "yash", "shah", "Cham", "yatsa", "hacah"],
      english: ["And the", "songs", "of the", "temple", "shall be", "howlings", "in that", "day", "saith", "the LORD", "GOD", "there shall be", "many", "dead bodies", "in every", "place", "they shall", "cast them", "forth", "with", "silence"]
    },
    verse4: {
      hebrew: ["Shama", "zath", "howy", "yash", "ky", "shaaph", "aby", "Nathan", "anav", "any", "al", "arats", "shabath"],
      english: ["Hear", "this", "O ye", "that", "swallow up", "the", "needy", "even to", "make", "the poor", "of the", "land", "to fail"]
    },
    verse5: {
      hebrew: ["amar", "Mathay", "Chadash", "abar", "ky", "yakał", "shabar", "aw", "shabbath", "ky", "yakal", "pathach", "bar", "karath", "ayphah", "tsuwq", "aw", "al", "al", "gadal", "aw", "avath", "Mazan", "Maramah"],
      english: ["Saying", "When will", "the new", "moon", "be gone", "that we", "may sell", "corn", "And the", "sabbath", "that we", "may", "set forth", "wheat", "making", "the ephah", "small", "and the", "shekel", "great", "and", "falsifying", "the balances", "by", "deceit"]
    },
    verse6: {
      hebrew: ["ky", "yakal", "qanah", "dal", "kacaph", "aw", "abyown", "puwk", "Naał", "gam", "aw", "shabar", "Mappal", "bar"],
      english: ["That we", "may buy", "the poor", "for", "silver", "and the", "needy", "for a", "pair of", "shoes", "yea and", "sell", "the refuse", "of the", "wheat"]
    },
    verse7: {
      hebrew: ["al", "YaChuwshuah", "hayach", "Shaba", "qaown", "yaaqab", "ky", "ahy", "Natsach", "am", "Shakach", "kal", "Maasah"],
      english: ["The LORD", "hath", "sworn", "by the", "excellency", "of", "Jacob", "Surely", "I will", "never", "forget", "any of", "their", "works"]
    },
    verse8: {
      hebrew: ["yash", "lah", "arats", "ragaz", "zath", "aw", "kal", "achach", "ky", "yashab", "Mala", "aw", "yash", "Alah", "kal", "hy", "owr", "aw", "yash", "garash", "aw", "shaqah", "hy", "darak", "yaor", "al", "Matsaraym"],
      english: ["Shall not", "the land", "tremble", "for this", "and every one", "mourn", "that", "dwelleth", "therein", "And it shall", "rise up", "wholly", "as a", "flood", "and it shall be", "cast out", "and", "drowned", "as by the", "flood", "of", "Egypt"]
    },
    verse9: {
      hebrew: ["aw", "yash", "hayach", "abar", "ky", "yowm", "amar", "Adanay", "YaChuwshuah", "ky", "ahy", "dan", "Shamash", "bow", "baad", "tsahar", "aw", "ahy", "Chashak", "arats", "owr"],
      english: ["And it shall", "come to", "pass", "in that", "day", "saith", "the Lord", "GOD", "that I will", "cause", "the sun", "to go", "down", "at", "noon", "and I will", "darken", "the", "earth", "in the", "clear", "day"]
    },
    verse10: {
      hebrew: ["aw", "ahy", "hapłak", "Naphash", "chag", "abal", "aw", "Naphash", "shayr", "al", "qaynah", "aw", "ahy", "Alah", "Saq", "al", "kal", "Mathan", "aw", "qarachah", "al", "kal", "Ru", "aw", "ahy", "Shuwym", "hy", "abal", "al", "yachavd"],
      english: ["And I will", "turn", "your", "feasts", "into", "mourning", "and all", "your", "songs", "into", "lamentation", "and I will", "bring up", "sackcloth", "upon all", "loins", "and", "baldness", "upon every", "head", "and I will", "make it", "as the", "mourning", "of an", "only son"]
    },
    verse11: {
      hebrew: ["hannah", "yown", "bow", "amar", "Adanay", "YaChuwshuah", "ky", "ahy", "shalach", "raab", "arats", "lah", "raab", "laCham", "aw", "Tsama", "kal", "Mayim", "han", "al", "Shama"],
      english: ["Behold", "the days", "come", "saith", "the Lord", "GOD", "that I will", "send", "a famine", "in the", "land", "not", "a famine", "of", "bread", "nor a", "thirst", "for", "water", "but of", "hearing", "the words", "of the", "LORD"]
    },
    verse12: {
      hebrew: ["Chaw", "ky", "shashu", "Nuw", "yom", "al", "yam", "aw", "al", "Tsaphan", "aph", "Mazarach", "Cham", "yash", "shuwit", "baqash", "dabar", "al", "YaChuwshuah", "han", "yash", "lah", "Matsa"],
      english: ["And they", "shall", "wander", "from", "sea", "to", "sea", "and from", "the", "north", "even to", "the", "east", "they shall", "run to", "and fro", "to seek", "the word", "of the", "LORD", "and shall", "not", "find it"]
    },
    verse13: {
      hebrew: ["al", "ky", "yowm", "yash", "yapha", "bathuwlah", "aw", "bachuwrr", "anash", "alaph", "kal", "Tsama"],
      english: ["In that", "day", "shall the", "fair", "virgins", "and", "young", "men", "faint", "for", "thirst"]
    },
    verse14: {
      hebrew: ["Cham", "ky", "shaba", "aShmah", "Shamarown", "aw", "amar", "Naphash", "AlaSham", "howy", "dan", "Chay", "aw", "darak", "al", "Baar", "Shaba", "Chay", "aph", "Cham", "yash", "Naphal", "aw", "lah", "quwm", "owd"],
      english: ["They that", "swear", "by the", "sin", "of", "Samaria", "and say", "Thy god", "O", "Dan", "liveth", "and", "The manner", "of", "Beersheba", "liveth", "even they", "shall", "fall", "and", "never", "rise up", "again"]
    }
  };

  const chapter9Interlinear = {
    verse1: {
      hebrew: ["raah", "Adanay", "Natsab", "al", "Mazabaach", "aw", "huw", "amar", "Nakah", "kaphatar", "al", "pathach", "ky", "caphly", "yakaal", "raash", "aw", "batsa", "Cham", "rash", "kal", "Cham", "aw", "ahy", "harag", "am", "acharyth", "Cham", "owd", "charab", "hy", "ky", "Nuwc", "al", "Cham", "yash", "lah", "Nuwc", "Nadah", "aw", "hy", "ky", "palayt", "al", "Cham", "yash", "lah", "Malat"],
      english: ["I SAW", "the Lord", "standing", "upon", "the altar", "and he", "said", "Smite", "the lintel", "of the", "door", "that the", "posts", "may", "shake", "and cut", "them", "in the", "head", "all of", "them", "and I will", "slay", "the last", "of them", "with the", "sword", "he that", "fleeth", "of them", "shall not", "flee away", "and he that", "escapeth", "of them", "shall not", "be delivered"]
    },
    verse2: {
      hebrew: ["ky", "am", "Cham", "chathar", "Shaal", "Yam", "yash", "any", "yad", "laqach", "Cham", "ky", "am", "Cham", "Alah", "Shamaym", "Sham", "aly", "yarad", "Cham", "yarad"],
      english: ["Though", "they", "dig", "into", "hell", "thence", "shall", "mine", "hand", "take them", "though", "they", "climb up", "to", "heaven", "thence", "will I", "bring them", "down"]
    },
    verse3: {
      hebrew: ["aw", "ky", "Cham", "chaba", "Cham", "rash", "karamal", "ahy", "chaphas", "Cham", "al", "Sham", "aw", "ky", "am", "Cham", "Chaba", "al", "ayn", "qaraqa", "al", "yam", "Sham", "ahy", "Tsavah", "NaClash", "aw", "hy", "yash", "Nashak", "Cham"],
      english: ["And though", "they", "hide", "themselves", "in the", "top", "of", "Carmel", "I will", "search", "and take", "them out", "thence", "and though", "they be", "hid", "from my", "sight", "in the", "bottom", "of the", "sea", "thence", "will I", "command", "the serpent", "and he", "shall", "bite", "them"]
    },
    verse4: {
      hebrew: ["aw", "ky", "am", "Cham", "yalak", "Shabay", "panaym", "Cham", "ayab", "Sham", "ahy", "Tsavah", "charab", "aw", "yash", "harag", "Cham", "aw", "ahy", "ShuwM", "any", "ayn", "al", "Cham", "al", "Ra", "aw", "lah", "al", "Towb"],
      english: ["And though", "they", "go into", "captivity", "before", "their", "enemies", "thence", "will I", "command", "the sword", "and it", "shall", "slay them", "and I will", "set", "mine eyes", "upon them", "for", "evil", "and not", "for", "good"]
    },
    verse5: {
      hebrew: ["aw", "Adanay", "YaChuwshuah", "Tsabaah", "yash", "ky", "Naga", "arats", "aw", "yash", "Muwg", "aw", "kal", "ky", "yashab", "Mala", "yash", "abal", "aw", "yash", "Alah", "kal", "kamw", "yaor", "awyash", "Shaqah", "dawak", "yaor", "al", "Matsaraym"],
      english: ["And the", "Lord", "GOD", "of hosts", "is he", "that", "toucheth", "the land", "and it", "shall", "melt", "and all", "that", "dwell", "therein", "shall", "mourn", "and it shall", "rise up", "wholly", "like a", "flood", "and shall be", "drowned", "as by the", "flood", "of", "Egypt"]
    },
    verse6: {
      hebrew: ["yash", "hy", "ky", "banah", "Naphash", "Maalah", "Shamaym", "aw", "baal", "yacada", "Naphash", "agaddah", "arats", "hy", "qara", "al", "Maym", "al", "yam", "aw", "Shaphak", "Cham", "al", "al", "panaym", "al", "arats", "al", "YaChuwshuah", "hy", "Naphash", "Sham"],
      english: ["It is he", "that", "buildeth", "his", "stories", "in", "heaven", "and hath", "founded", "his", "troop", "in the", "earth", "he that", "calleth", "for the", "waters", "of the", "sea", "and", "poureth", "them out", "upon", "the face", "of the", "earth", "The LORD", "is his", "name"]
    },
    verse7: {
      hebrew: ["hy", "attah", "lah", "ban", "al", "Kashy", "al", "ahy", "howy", "ban", "al", "yasharaAl", "anar", "al", "YaChuwshuah", "hava", "lah", "anaky", "Alah", "yasharaAl", "arats", "al", "Matsaraym", "aw", "Phalashatay", "al", "kaphatar", "aw", "Aram", "al", "qayr"],
      english: ["Are ye", "not as", "children", "of the", "Ethiopians", "unto me", "O", "children", "of", "Israel", "saith", "the", "LORD", "Have not", "I brought", "up", "Israel", "out of", "the land", "of", "Egypt", "and the", "Philistines", "from", "Caphtor", "and the", "Syrians", "from", "Kir"]
    },
    verse8: {
      hebrew: ["hannah", "ayn", "al", "Adanay", "YaChuwshuah", "hy", "al", "Chataah", "Mamlakah", "aw", "ahy", "Shamad", "al", "panaym", "Adamah", "aphac", "ky", "ahy", "lah", "kalayl", "Shamad", "al", "bayth", "al", "yaaqab", "amar", "al", "YaChuwshuah"],
      english: ["Behold", "the eyes", "of the", "Lord", "GOD", "are upon", "the", "sinful", "kingdom", "and I will", "destroy it", "from off", "the face", "of the", "earth", "saving that", "I will", "not", "utterly", "destroy", "the house", "of", "Jacob", "saith", "the", "LORD"]
    },
    verse9: {
      hebrew: ["al", "hannah", "ahy", "Tsavah", "aw", "ahy", "Nuwa", "Baythal"],
      english: ["For lo", "I will", "command", "and I will", "sift", "the house", "of", "Israel"]
    },
    verse10: {
      hebrew: ["owd", "charab", "yash", "Muwth", "kal", "Chataah", "am", "Cham", "amar", "lah", "qadam", "aw", "dabad", "al", "cham", "Ra"],
      english: ["All the", "sinners", "of my", "people", "shall", "die", "by the", "sword", "which", "say", "The evil", "shall not", "overtake", "nor", "prevent", "us"]
    },
    verse11: {
      hebrew: ["yowmy", "ky", "yowmw", "ahy", "qwmw", "cukkkh", "al", "Daviyd", "al", "Naphal", "aw", "gadar", "parats", "Cham", "aw", "harac", "quwm", "aw", "banah", "yamym", "al", "owlam"],
      english: ["In that", "day", "will I", "raise up", "the tabernacle", "of", "David", "that is", "fallen", "and close", "up the", "breaches", "thereof", "and I will", "raise up", "his", "ruins", "and I will", "build it", "as in the", "days", "of old"]
    },
    verse12: {
      hebrew: ["ky", "Cham", "yakal", "yarash", "Shaarayth", "al", "Cham", "aw", "kal", "gowy", "Cham", "asar", "hy", "qara", "any", "Sham", "amar", "YaChuwshuah", "ky", "asah", "zath"],
      english: ["That they", "may", "possess", "the remnant", "of", "Edom", "and of", "all the", "heathen", "which are", "called", "by my", "name", "saith", "the", "LORD", "that", "doeth", "this"]
    },
    verse13: {
      hebrew: ["hannah", "yowmw", "bow", "amar", "YaChuwshuah", "ky", "Cham", "arash", "yash", "Naqash", "qatsar", "aw", "darak", "al", "anab", "Naphlash", "ky", "Mashak", "zara", "aw", "har", "yash", "Nataph", "acayc", "aw", "kal", "gabah", "yash", "Mwyg"],
      english: ["Behold", "the days", "come", "saith", "the", "LORD", "that the", "plowman", "shall", "overtake", "the reaper", "and the", "treader", "of", "grapes", "him that", "soweth", "seed", "and the", "mountains", "shall", "drop", "sweet wine", "and all the", "hills", "shall", "melt"]
    },
    verse14: {
      hebrew: ["aw", "ahy", "Shuwb", "Shabwth", "al", "any", "am", "al", "yasharaAl", "al", "Cham", "Cham", "yash", "banah", "Shamam", "ayr", "aw", "yashab", "Cham", "aw", "Cham", "yash", "Nata", "karam", "aw", "Shathah", "yayn", "Sham", "al", "Cham", "yash", "gam", "asah", "gannah", "aw", "akal", "paray", "al", "Cham"],
      english: ["And I will", "bring again", "the captivity", "of my", "people", "of", "Israel", "and they", "shall", "build", "the waste", "cities", "and", "inhabit", "them", "and they", "shall", "plant", "vineyards", "and", "drink", "the wine", "thereof", "they shall", "also", "make", "gardens", "and eat", "the fruit", "of them"]
    },
    verse15: {
      hebrew: ["aw", "ahy", "Nata", "Cham", "al", "Cham", "Adamah", "aw", "Cham", "aw", "yash", "lah", "owd", "Nathash", "al", "Cham", "Adamah", "Cham", "asar", "any", "hava", "Nathan", "Cham", "amar", "al", "YaChuwshuah"],
      english: ["And I will", "plant them", "upon", "their", "land", "and they", "shall", "no more", "be pulled", "up", "out of", "their", "land", "which", "I have", "given them", "saith", "the", "LORD", "thy", "God"]
    }
  };

  // Concordance Data
  const concordanceData = [
    { hebrew: "dabar", english: "the words", strongs: "1697" },
    { hebrew: "al", english: "of", strongs: "413" },
    { hebrew: "Amats (Amos)", english: "burden bearer", strongs: "" },
    { hebrew: "Asar", english: "who, Also fire of light", strongs: "" },
    { hebrew: "hayach", english: "was", strongs: "1961" },
    { hebrew: "bayn", english: "among", strongs: "996" },
    { hebrew: "Nagad", english: "the herdmen", strongs: "5349" },
    { hebrew: "al", english: "of", strongs: "413" },
    { hebrew: "Taqowa", english: "Tekoa", strongs: "8620" },
    { hebrew: "Asar", english: "which", strongs: "834" },
    { hebrew: "Chazah", english: "he saw", strongs: "2372" },
    { hebrew: "al", english: "concerning", strongs: "5921" },
    { hebrew: "yasharaAl", english: "Israel", strongs: "3478" },
    { hebrew: "yowm", english: "in the days", strongs: "3117" },
    { hebrew: "al", english: "of", strongs: "5921" },
    { hebrew: "yachashahAzz", english: "Uzziah", strongs: "5818" },
    { hebrew: "Malak", english: "king", strongs: "4428" },
    { hebrew: "al", english: "of", strongs: "5921" },
    { hebrew: "yachadah", english: "Judah", strongs: "3062" },
    { hebrew: "aw", english: "and", strongs: "176" },
    { hebrew: "yowm al", english: "in the days, of", strongs: "413-3117" },
    { hebrew: "yarabaam", english: "Jeroboam", strongs: "3379" },
    { hebrew: "ban", english: "the son", strongs: "1121" },
    { hebrew: "al", english: "of", strongs: "5921" },
    { hebrew: "yowash", english: "Joash", strongs: "3101" },
    { hebrew: "YaChuwshuah", english: "Lord", strongs: "3068" },
    { hebrew: "Shaag", english: "roars", strongs: "7580" },
    { hebrew: "Tsaywn", english: "Zion", strongs: "6726" },
    { hebrew: "aw", english: "and", strongs: "176" },
    { hebrew: "Nathan", english: "utters", strongs: "5414" },
    { hebrew: "Naphash", english: "his", strongs: "5314" },
    { hebrew: "qowl", english: "voice", strongs: "6963" },
    { hebrew: "kah", english: "Thus", strongs: "3541" },
    { hebrew: "amar", english: "saith", strongs: "559" },
    { hebrew: "pasha", english: "Transgressions", strongs: "6145" },
    { hebrew: "mawab", english: "Moab", strongs: "4124" },
    { hebrew: "ith", english: "For", strongs: "3588" },
    { hebrew: "shalowsh", english: "three", strongs: "7651" },
    { hebrew: "arba", english: "four", strongs: "702" },
    { hebrew: "shy", english: "I will", strongs: "1571" },
    { hebrew: "Lah", english: "not", strongs: "3808" },
    { hebrew: "Shuwb", english: "Turn", strongs: "7725" },
    { hebrew: "cuwr", english: "away", strongs: "5493" },
    { hebrew: "Avan", english: "the punishment", strongs: "6008" },
    { hebrew: "huw", english: "he", strongs: "1931" },
    { hebrew: "Asaraph", english: "burned", strongs: "8313" },
    { hebrew: "atsam", english: "bones", strongs: "6106" },
    { hebrew: "Adam", english: "Adam", strongs: "120" },
    { hebrew: "Edom", english: "Edom", strongs: "123" },
    { hebrew: "Esau", english: "Esau", strongs: "6101" },
    { hebrew: "Asayad", english: "lime", strongs: "667" },
    { hebrew: "lim", english: "lime", strongs: "3772" },
    { hebrew: "Shalach", english: "send", strongs: "7971" },
    { hebrew: "fire", english: "fire", strongs: "7971" },
    { hebrew: "Shaown", english: "Tumult", strongs: "8047" },
    { hebrew: "Tarruwah", english: "shouting", strongs: "8643" },
    { hebrew: "Shaphar", english: "Trumpet", strongs: "8222" },
    { hebrew: "karath", english: "cut off", strongs: "3772" },
    { hebrew: "ShaphaTh", english: "Judge", strongs: "8199" },
    { hebrew: "qarub", english: "Midst", strongs: "7130" },
    { hebrew: "harag", english: "slay", strongs: "2026" },
    { hebrew: "kol", english: "all the", strongs: "3605" },
    { hebrew: "sham", english: "thereof", strongs: "8033" }
  ];

  // Chapter 4 - Pure Hebrew (continuous text)
  const chapter4PureHebrew = [
    {
      verse: 1,
      hebrew: "Shama Zah adabar attanah pharach al Bashan ky hy al har al Shamarwn Asar Ashaq dal Asar ratsats abyown Cham adabar amar Cham adown bow aw yanach anachnw Shathah",
      english: "Hear this word ye kine of Bashan that are in the mountain of Samaria which oppress the poor which Crush the needy their word say to their masters bring and Let us drink"
    },
    {
      verse: 2,
      hebrew: "al Adanay YaChuwshuah baal Shaba darak Naphash qadash han yowm yash bow al attahah han huw ahy Nasa attanah Nasa owd Tsannah aw Naphash acharyth owd cayr",
      english: "The Lord GOD hath sworn by his holiness that the days shall come upon you that he will take you away with hooks and your posterity with fish, hooks"
    },
    {
      verse: 3,
      hebrew: "aw yash yatsa aw pharats Kashashah pharach aw han Asar Nadan Naphash aw yash Shalak Cham al haramown Naam al YaChuwshuah",
      english: "and ye shall go out at the breaches every cow at that which is before her and ye shall cast them into the palaces saith the LORD"
    },
    {
      verse: 4,
      hebrew: "bow Baythal aw pasha aw Galgal Rabah pasha aw bow Naphash Zabach Kashhash aw Naphash MaASar al shalowsh yowm",
      english: "come to Beth-el and Transgress; at Gilgal Multiply Transgression and bring your a sacrifice every morning and your tithes after three years"
    },
    {
      verse: 5,
      hebrew: "aw qatar Zabach al Tow dah owd ChamatZ aw qara aw Shama habahab al kah attana howy attah ban al yasharaAI Naam al Adanay YaChuwshuah",
      english: "and offer a sacrifice of thanksgiving with Leaven and proclaim and publish the free offerings for this liketh you O ye children of Israel saith the Lord GOD"
    },
    {
      verse: 6,
      hebrew: "aw Any hayah gam Nathan attah Naqqayan al Shan kal Naphash Ayar aw Chacar Lacham kal Naphash Maqawn awd hayah attanah Lah shawb al Any Amar al Yachuwshuah",
      english: "And I have also given you cleanness of teeth and all your city and want of bread in all your places yet have ye not returned unto me saith the LORD"
    },
    {
      verse: 7,
      hebrew: "aw gam any havah Mana gasham al attah Asar Sham hayach owd Shalowsh Chadash qatsayr aw any Nathan yash Matar al achad ayar aw Nathan yash Lah Matar al achad Ayar achad badal Matar aw al badal Asar al Matar Lah yabash",
      english: "And also I have withholden the rain from you when there were yet three Months to the harvest and I caused it to rain upon one City and caused it not to rain upon another City one piece rained and the piece where upon rained not withered"
    },
    {
      verse: 8,
      hebrew: "kan Shanaym aw Shalowsh ayar Nuwa al achad ayar Shathah Maym han Cham hayach Lah Shabaa owd hayach attah Lah Shuwb al any Naam al YaChuwshuah",
      english: "So Two or Three Cities wandered unto one City to drink water but they were not Satisfied yet have ye not returned unto me saith the LORD"
    },
    {
      verse: 9,
      hebrew: "yash Nakah attah owd Shadaphah aw yaraqown Asar Naphash gannah aw Naphash Taan aTs aw Naphash aTs Rabah gazam akal Cham owd havah attah Lah Shuwb al any Naam al YaChuwshuah",
      english: "I have smitten you with blasting and mildew when your gardens and your fig trees and your trees increased the palmerworm devoured them yet have ye not returned unto me saith the LORD"
    },
    {
      verse: 10,
      hebrew: "yash Shalach bayn attah adabar al darak al Matsaraym Naphash bachar anash havah any garag owd Chacab aw havah Shabay Naphash cuwc aw Any havah Ashah baash al Naphash Machanah alah al Naphash aph owd havah attah Lah Shuwb al any Naam al YaChuwshuah",
      english: "I have sent among you the pestilence after the manner of Egypt your men men have I slain with the word and have taken away your horses and I have made the stink of your camps to come up unto your Nostrils yet have ye not returned unto me saith the LORD"
    },
    {
      verse: 11,
      hebrew: "yash haphak allah al attah hy AlaSham Mahapakah cadam aw Amarah aw attah hayach hy uwd Natsal al Asaraphah owd havah attah Lah Shuwb al any Naam al YaChuwshuah",
      english: "I have overthrown some of you as God overthrew Sodom and Gomorrah and ye were as firebrand plucked out of the burning yet have ye not returned unto me saith the LORD"
    },
    {
      verse: 12,
      hebrew: "al kan ahy aw aqab ky ahy ashah kan al attah kuwn qarah attah AlaSham howy yasharaAl",
      english: "Therefore Thus will I and because I will do this unto thee prepare to meet thy God O Israel"
    },
    {
      verse: 13,
      hebrew: "al han hy ky yatsar har aw bara ruwach aw Nagad al Adam My hy Naphash Shach ky ashah Shachar ayphah aw darak al bamah Maqowm al Arats al YaChuwshuah Tsabaach hy Naphash Sham",
      english: "For Lo he that formeth the mountains and createth the wind and declareth unto man what is his thought that Maketh the morning darkness and treadeth upon the high places of the earth the LORD host is his name"
    }
  ];

  // Chapter 4 - Bilingual (side-by-side format)
  const chapter4Bilingual = [
    { 
      verse: 1, 
      hebrew: "Shama Zah adabar attanah pharach al Bashan ky hy al har al Shamarwn Asar Ashaq dal Asar ratsats abyown Cham adabar amar Cham adown bow aw yanach anachnw Shathah",
      english: "Hear this word ye kine of Bashan that are in the mountain of Samaria which oppress the poor which Crush the needy their word say to their masters bring and Let us drink"
    },
    { 
      verse: 2, 
      hebrew: "al Adanay YaChuwshuah baal Shaba darak Naphash qadash han yowm yash bow al attahah han huw ahy Nasa attanah Nasa owd Tsannah aw Naphash acharyth owd cayr",
      english: "The Lord GOD hath sworn by his holiness that the days shall come upon you that he will take you away with hooks and your posterity with fish, hooks"
    },
    { 
      verse: 3, 
      hebrew: "aw yash yatsa aw pharats Kashashah pharach aw han Asar Nadan Naphash aw yash Shalak Cham al haramown Naam al YaChuwshuah",
      english: "and ye shall go out at the breaches every cow at that which is before her and ye shall cast them into the palaces saith the LORD"
    },
    { 
      verse: 4, 
      hebrew: "bow Baythal aw pasha aw Galgal Rabah pasha aw bow Naphash Zabach Kashhash aw Naphash MaASar al shalowsh yowm",
      english: "come to Beth-el and Transgress; at Gilgal Multiply Transgression and bring your a sacrifice every morning and your tithes after three years"
    },
    { 
      verse: 5, 
      hebrew: "aw qatar Zabach al Tow dah owd ChamatZ aw qara aw Shama habahab al kah attana howy attah ban al yasharaAI Naam al Adanay YaChuwshuah",
      english: "and offer a sacrifice of thanksgiving with Leaven and proclaim and publish the free offerings for this liketh you O ye children of Israel saith the Lord GOD"
    },
    { 
      verse: 6, 
      hebrew: "aw Any hayah gam Nathan attah Naqqayan al Shan kal Naphash Ayar aw Chacar Lacham kal Naphash Maqawn awd hayah attanah Lah shawb al Any Amar al Yachuwshuah",
      english: "And I have also given you cleanness of teeth and all your city and want of bread in all your places yet have ye not returned unto me saith the LORD"
    },
    { 
      verse: 7, 
      hebrew: "aw gam any havah Mana gasham al attah Asar Sham hayach owd Shalowsh Chadash qatsayr aw any Nathan yash Matar al achad ayar aw Nathan yash Lah Matar al achad Ayar achad badal Matar aw al badal Asar al Matar Lah yabash",
      english: "And also I have withholden the rain from you when there were yet three Months to the harvest and I caused it to rain upon one City and caused it not to rain upon another City one piece rained and the piece where upon rained not withered"
    },
    { 
      verse: 8, 
      hebrew: "kan Shanaym aw Shalowsh ayar Nuwa al achad ayar Shathah Maym han Cham hayach Lah Shabaa owd hayach attah Lah Shuwb al any Naam al YaChuwshuah",
      english: "So Two or Three Cities wandered unto one City to drink water but they were not Satisfied yet have ye not returned unto me saith the LORD"
    },
    { 
      verse: 9, 
      hebrew: "yash Nakah attah owd Shadaphah aw yaraqown Asar Naphash gannah aw Naphash Taan aTs aw Naphash aTs Rabah gazam akal Cham owd havah attah Lah Shuwb al any Naam al YaChuwshuah",
      english: "I have smitten you with blasting and mildew when your gardens and your fig trees and your trees increased the palmerworm devoured them yet have ye not returned unto me saith the LORD"
    },
    { 
      verse: 10, 
      hebrew: "yash Shalach bayn attah adabar al darak al Matsaraym Naphash bachar anash havah any garag owd Chacab aw havah Shabay Naphash cuwc aw Any havah Ashah baash al Naphash Machanah alah al Naphash aph owd havah attah Lah Shuwb al any Naam al YaChuwshuah",
      english: "I have sent among you the pestilence after the manner of Egypt your men men have I slain with the word and have taken away your horses and I have made the stink of your camps to come up unto your Nostrils yet have ye not returned unto me saith the LORD"
    },
    { 
      verse: 11, 
      hebrew: "yash haphak allah al attah hy AlaSham Mahapakah cadam aw Amarah aw attah hayach hy uwd Natsal al Asaraphah owd havah attah Lah Shuwb al any Naam al YaChuwshuah",
      english: "I have overthrown some of you as God overthrew Sodom and Gomorrah and ye were as firebrand plucked out of the burning yet have ye not returned unto me saith the LORD"
    },
    { 
      verse: 12, 
      hebrew: "al kan ahy aw aqab ky ahy ashah kan al attah kuwn qarah attah AlaSham howy yasharaAl",
      english: "Therefore Thus will I and because I will do this unto thee prepare to meet thy God O Israel"
    },
    { 
      verse: 13, 
      hebrew: "al han hy ky yatsar har aw bara ruwach aw Nagad al Adam My hy Naphash Shach ky ashah Shachar ayphah aw darak al bamah Maqowm al Arats al YaChuwshuah Tsabaach hy Naphash Sham",
      english: "For Lo he that formeth the mountains and createth the wind and declareth unto man what is his thought that Maketh the morning darkness and treadeth upon the high places of the earth the LORD host is his name"
    }
  ];

  // Sample content for Chapter 1 - Bilingual (old format kept for reference)
  const chapter1Bilingual = [
    { 
      verse: 1, 
      hebrew: "Dabar al Amac Ashar hayach Bayn Naqad al Taqawa Asar chazah",
      english: "The words of Amos who was among the herdsmen of Tekoa which he saw"
    },
    { 
      verse: "", 
      hebrew: "al yasharaal al yowm Ozayah Malak al Yahadah aw al yowm Yaraboam",
      english: "concerning Israel in the days of Uzziah king of Judah and in the days of Jeroboam"
    },
    { 
      verse: "", 
      hebrew: "ban Yoash Malak al yasharaal shanaym shana al raash",
      english: "the son of Joash king of Israel two years before the earthquake"
    },
    { 
      verse: 2, 
      hebrew: "aw huw amar YaChuwshuah al Tsayown sha'agh aw al Yaruwshalayim Naphash qowl aw abal Nayah Raah aw yabash rosh al Karmal",
      english: "And he said The LORD will roar from Zion and from Jerusalem utter his voice and the habitations of the shepherds shall mourn and the top of Carmel shall wither"
    },
    { 
      verse: 3, 
      hebrew: "kah amar YaChuwshuah aw shalowsh pasha al Dammashaq aw aw arba law Shawb cawr Avan al Cham hayach dawsh Galaad ad",
      english: "Thus saith the LORD; For three transgressions of Damascus, and for four, I will not turn away the punishment thereof; because they have threshed Gilead"
    },
    { 
      verse: "", 
      hebrew: "charats dachavah barazal",
      english: "with threshing instruments of iron"
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

  // Chapter 2 - Pure Hebrew (continuous text for printing)
  const chapter2PureHebrew = [
    {
      verse: 1,
      hebrew: "Kah Amar al Yachuwshuah yth Shalawsh pasha al Mawab aw yth Araba ahy aLah Shawb cawr Avan al huw Asaraph atsam al aMalak Al Adam al Asayad",
      english: "Thus saith The LORD For three transgressions of Moab and For four I will not turn away the punishment thereof because he burned bones of the king of Edom into lime"
    },
    {
      verse: 2,
      hebrew: "han ahy shalach Ash al aMawb aw yash akal Aramown al qaryawTh aw aMawb yash aMaw awd Shaawn awd Tarawah aw awd qawl Shaphar",
      english: "but I will send a fire upon Moab and it shall devour the palaces of Kirioth and Moab shall die with Tumult with shouting and with the sound of the trumpet"
    },
    {
      verse: 3,
      hebrew: "aw ahy karath al Shaphat al qarab Sham aw ahy harag kal aSar al awd Naphash Amar al Yachuwahuah",
      english: "And I will cut off the Judge from the Midst thereof And I will slay all the princes thereof with him saith the LORD"
    },
    {
      verse: 4,
      hebrew: "Kah Amar al Yachuwshuah yth Shalawsh pasha al yachadad aw yth Araba ahy aLah Shawb cawr Avan shamal cham hayach aMaac Tarach al Yachuwshuah aw hayach aLah Sham Naphash chaq aw Cham kazab Nathan Cham taah achar Asar Cham Ab hayach halak",
      english: "Thus said the LORD for three transgressions of Judah and for four I will not turn away the punishment thereof because they have despised the law of the LORD and have not kept his commandments and their lies caused them to err after the which their fathers have walked"
    },
    {
      verse: 5,
      hebrew: "han ahy Shalac Ash al yachadad aw yash akal Aramawn al Shalam",
      english: "but I will send a fire upon Judah and it shall devour the palaces of Jerusalem"
    },
    {
      verse: 6,
      hebrew: "kah Amar al Yachuwshuah yth shalawsh pasha al yasharaA1 aw yth Araba ahy aLah Shawb cawr Avan al Cham aMakar Tsaddayq ka caph Abyawn yth cawl al Naalaal",
      english: "Thus saith the LORD for three transgressions of Israel and for four I will not turn away the punishment thereof because they sold the righteous for silver the poor for a pair of shoes"
    },
    {
      verse: 7,
      hebrew: "ky Shaaph achar aphar al Arats al Rash al Abyawn aw Natah adarak al ahayv aw Kash aw Naphash Ab ahy yalak huw Naarah Chalal Any qadash Sham",
      english: "That pant after the dust of the earth on the head of the poor and turn aside the way of the Meek and a man and his father will go in unto the same maid to profane my Holy name"
    },
    {
      verse: 8,
      hebrew: "aw Cham Natah Cham yarad al bagad Shawm Chabal adarak kal aMazabaah aw Cham Shathah yayn al Anash al Bayth al Cham AlaSham",
      english: "And they lay themselves down upon clothes laid to pledge by every altar and they Drink the wine of the condemned in the house of their god"
    },
    {
      verse: 9,
      hebrew: "awd Shamad Any phanym Cham Amaray Asar gabahh hayach kamah al Araz aw haw hayach Chacan allaw awd Any Shamad Naphash aphray Maal Aw Naphash Sharash al Tachath",
      english: "yet destroyed I before them Amorite whose height was like the cedars and he was strong as the oak yet I destroyed his fruit from above and his roots from beneath"
    },
    {
      verse: 10,
      hebrew: "gam Any Alah attanah al Arats al aMatsaraym aw yalak attanah Araba Shanah al aMadAbar yarash Arats al Amaray",
      english: "Also I brought you from the land of Egypt and led you forty years through the wilderness to possess the land of the Amorite"
    },
    {
      verse: 11,
      hebrew: "aw Any qawm al Naphash ban yth Nabay aw al Naphash Bachawr yth Nazar yash aLah aph Zath hawy attanah ban yasharaal Amar Yachuwshuah",
      english: "and I raised up of your sons for prophets and of your young for Nazarites is it not even thus O ye children of Israel saith the LORD"
    },
    {
      verse: 12,
      hebrew: "han attanah Nazar yayn Shaqaqh aw Tsavah Nabay Naba aLah",
      english: "But ye gave the Nazarites wine to drink and commanded prophets prophecy not"
    },
    {
      verse: 13,
      hebrew: "hannah hayach awq Tachath attanah al agalah huw awq yash Tachath attanah al agalah huw awq Mala al Amayr",
      english: "behold I am pressed under you as a cart is pressed under you as a cart is pressed full of sheaves"
    },
    {
      verse: 14,
      hebrew: "gam Manawc yash Abad al qal aw Chazaq yash aLah Amats Naphash kaach aLah yash gabbawr aMalat Naphash",
      english: "therefore the flight shall perish from the swift and the strong shall not strengthen his force neither shall the mighty deliver himself"
    },
    {
      verse: 15,
      hebrew: "aLah yash Amad ky Taphash qashath aw huw qal ragal yash aLah aMalat Naphash aLah yash huw ky Rakab cawc aMalat Naphash",
      english: "neither shall he stand that handleth the bow and he that is swift of foot shall not deliver himself neither shall he that rideth the horse deliver himself"
    },
    {
      verse: 16,
      hebrew: "Aw huw Amamyts aBayn gabbar yash Nawc cawr Arawm al ky yawm Amar al Yachuwshuah",
      english: "And he that is courageous among the mighty shall flee away Naked in that day saith the LORD"
    }
  ];

  // Sample content for Chapter 1 - Bilingual (continued)
  const chapter1BilingualContinued = [
    { 
      verse: 1, 
      hebrew: "Dabar al Amac Ashar hayach Bayn Naqad al Taqawa Asar chazah",
      english: "The words of Amos who was among the herdsmen of Tekoa which he saw"
    },
    { 
      verse: "", 
      hebrew: "al yasharaal al yowm Ozayah Malak al Yahadah aw al yowm Yaraboam",
      english: "concerning Israel in the days of Uzziah king of Judah and in the days of Jeroboam"
    },
    { 
      verse: "", 
      hebrew: "ban Yoash Malak al yasharaal shanaym shana al raash",
      english: "the son of Joash king of Israel two years before the earthquake"
    },
    { 
      verse: 2, 
      hebrew: "aw huw amar YaChuwshuah al Tsayown sha'agh aw al Yaruwshalayim Naphash qowl aw abal Nayah Raah aw yabash rosh al Karmal",
      english: "And he said The LORD will roar from Zion and from Jerusalem utter his voice and the habitations of the shepherds shall mourn and the top of Carmel shall wither"
    },
    { 
      verse: 3, 
      hebrew: "kah amar YaChuwshuah aw shalowsh pasha al Dammashaq aw aw arba law Shawb cawr Avan al Cham hayach dawsh Galaad ad",
      english: "Thus saith the LORD; For three transgressions of Damascus, and for four, I will not turn away the punishment thereof; because they have threshed Gilead"
    },
    { 
      verse: "", 
      hebrew: "charats dachavah barazal",
      english: "with threshing instruments of iron"
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
    if (activeChapter !== 1 && activeChapter !== 2 && activeChapter !== 3 && activeChapter !== 4 && activeChapter !== 5 && activeChapter !== 6 && activeChapter !== 7 && activeChapter !== 8 && activeChapter !== 9) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Chapter {activeChapter} interlinear will be added soon.
          </p>
        </div>
      );
    }

    // Select the appropriate chapter data
    const chapterData = activeChapter === 1 ? chapter1Interlinear : 
                        activeChapter === 2 ? chapter2Interlinear :
                        activeChapter === 3 ? chapter3Interlinear :
                        activeChapter === 4 ? chapter4Interlinear :
                        activeChapter === 5 ? chapter5Interlinear :
                        activeChapter === 6 ? chapter6Interlinear :
                        activeChapter === 7 ? chapter7Interlinear :
                        activeChapter === 8 ? chapter8Interlinear :
                        chapter9Interlinear;

    return (
      <div className="max-w-5xl mx-auto">
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

        {/* Render verses based on chapter */}
        {activeChapter === 1 ? (
          <>
            {/* Chapter 1: Verses 1-5 (FREE SAMPLE) */}
            {Object.entries(chapter1Interlinear)
              .filter(([verseKey]) => {
                const verseNum = parseInt(verseKey.replace('verse', ''));
                return verseNum <= 5;
              })
              .map(([verseKey, verseData]) => {
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

            {/* PAYMENT GATE - Unlock verses 6-15 (Chapter 1 only) */}
            {!isUnlocked && !isProcessingPayment && (
              <div className="my-12 p-8 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border-2 border-green-400 text-center">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl font-bold text-green-900 mb-3">🔒 Unlock Full Chapter 1</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    You've just experienced verses 1-5 in the original 20-letter Hebrew system with word-by-word interlinear translation.
                  </p>
                  <p className="text-lg font-semibold text-gray-800 mb-6">
                    Unlock verses 6-15 to see the complete Chapter 1 in this revolutionary format!
                  </p>
                  <div className="bg-white p-6 rounded-lg mb-6 border border-green-300">
                    <p className="text-3xl font-bold text-green-700 mb-2">$4.99</p>
                    <p className="text-sm text-gray-600">One-time payment • Instant access • Verses 6-15</p>
                  </div>
                  <button
                    onClick={handleUnlockPayment}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white text-lg font-bold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-lg"
                  >
                    🔓 Unlock Now - $4.99
                  </button>
                  <p className="text-xs text-gray-500 mt-4">Secure payment via Stripe • Instant access</p>
                </div>
              </div>
            )}

            {/* Processing payment state */}
            {isProcessingPayment && (
              <div className="my-12 p-8 bg-blue-50 rounded-xl border-2 border-blue-400 text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Processing Payment...</h3>
                  <p className="text-gray-700">Verifying your payment. Please wait a moment.</p>
                </div>
              </div>
            )}

            {/* Chapter 1: Verses 6-15 (UNLOCKED CONTENT) */}
            {isUnlocked && (
              <>
                <div className="my-8 p-4 bg-green-100 rounded-lg border-2 border-green-500 text-center">
                  <p className="text-green-800 font-semibold">✅ Content Unlocked! Thank you for your support.</p>
                </div>
                
                {Object.entries(chapter1Interlinear)
                  .filter(([verseKey]) => {
                    const verseNum = parseInt(verseKey.replace('verse', ''));
                    return verseNum >= 6;
                  })
                  .map(([verseKey, verseData]) => {
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
              </>
            )}
          </>
        ) : (
          <>
            {/* Chapter 2, 3, & 4: All verses FREE */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-400 text-center">
              <p className="text-green-800 font-semibold">✨ Chapter {activeChapter} - Completely Free!</p>
            </div>
            
            {Object.entries(chapterData).map(([verseKey, verseData]) => {
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
          </>
        )}

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
          <p className="text-sm text-gray-700 text-center">
            <strong>Sample:</strong> Verses 1-5 shown in interlinear format. Full chapter has 15 verses total.
          </p>
        </div>
      </div>
    );
  };

  const renderPureHebrew = () => {
    if (activeChapter !== 1 && activeChapter !== 2 && activeChapter !== 4) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Chapter {activeChapter} Pure Hebrew content will be added soon.
          </p>
        </div>
      );
    }

    const pureHebrewData = activeChapter === 1 ? chapter1PureHebrew : activeChapter === 2 ? chapter2PureHebrew : chapter4PureHebrew;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {pureHebrewData.map((item, idx) => (
          <div key={idx} className="mb-6 p-6 bg-white rounded-lg border border-gray-200">
            {item.verse && (
              <span className="inline-block bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-3">
                Verse {item.verse}
              </span>
            )}
            <p className="text-lg leading-relaxed text-gray-800 mb-4 font-semibold" dir="rtl">
              {item.hebrew}
            </p>
            <p className="text-base leading-relaxed text-gray-600 italic border-t pt-3">
              {item.english}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderBilingual = () => {
    if (activeChapter !== 1 && activeChapter !== 4) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Chapter {activeChapter} Bilingual content will be added soon.
          </p>
        </div>
      );
    }

    const bilingualData = activeChapter === 1 ? chapter1Bilingual : chapter4Bilingual;

    return (
      <div className="max-w-6xl mx-auto">
        {bilingualData.map((item, index) => (
          <div 
            key={`${item.verse}-${index}`} 
            className={`grid md:grid-cols-2 gap-6 ${
              item.verse === "" ? "mb-0 pb-0" : "mb-6 pb-2 border-b border-gray-200"
            }`}
          >
            {/* Hebrew Column - Left */}
            <div className="order-2 md:order-1">
              <p className="text-base leading-relaxed">
                {item.verse && <span className="font-bold text-teal-700 mr-2">{item.verse}.</span>}
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

  const renderConcordance = () => {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Concordance Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Concordance</h2>
          <p className="text-gray-600">Complete Word Index & Study Guide</p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white border border-gray-300 rounded p-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Important Note</h3>
          <p className="text-gray-800 leading-relaxed">
            Keep in remembrance, all the letters and words have many more, and plenty meanings than what you see. 
            One example: <span className="font-semibold">"Asar"</span> - Sun of God, 'The fire, of light' and 'The king of Eden, witness of the fountain.'
          </p>
        </div>

        {/* Word Breakdown Section */}
        <div className="bg-white border border-gray-300 rounded p-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Word Breakdown</h3>
          <p className="text-gray-800 leading-relaxed">
            <span className="font-semibold">Shabar dabar</span> - 
            <span className="text-gray-700"> sh ab ar, d ab ar</span> - 
            meaning "the fire, of the gate, of light" and "dabar" meaning "witness d, the gate ab of light ar" which is called "The word"
          </p>
        </div>

        {/* Concordance Table */}
        <div className="bg-white border border-gray-300 rounded overflow-hidden">
          <div className="p-4 border-b border-gray-300">
            <h3 className="text-xl font-bold text-gray-900">Word Index - Chapter 1</h3>
          </div>
          
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300">
                <th className="text-left p-3 font-semibold text-gray-900">Hebrew</th>
                <th className="text-left p-3 font-semibold text-gray-900">English</th>
                <th className="text-right p-3 font-semibold text-gray-900">Strong's #</th>
              </tr>
            </thead>
            <tbody>
              {concordanceData.map((entry, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">{entry.hebrew}</td>
                  <td className="p-3 text-gray-800">{entry.english}</td>
                  <td className="p-3 text-right text-gray-600">{entry.strongs || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note about full concordance */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-gray-800">
            <span className="font-semibold">Sample:</span> This is a partial concordance for Chapter 1. 
            The complete concordance with all chapters and full word studies is available in the full book.
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
            <p className="text-xl text-gray-600 mb-2">Free Sample - Chapters 1-5</p>
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

          {/* What Makes This Special */}
          <div className="mt-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6 border-l-4 border-teal-600">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">📚 What Makes This Book Different?</h3>
            <p className="text-gray-800 leading-relaxed mb-4">
              This is NOT your average Book of Amos. This is a <span className="font-semibold text-teal-700">comprehensive biblical research tool</span> designed for serious students who want to master the scriptures.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded p-4 border border-teal-200">
                <h4 className="font-bold text-teal-800 mb-2">🔍 Original Hebrew Access</h4>
                <p className="text-gray-700 text-sm">
                  Find ANY word in the original Hebrew from the very first chapter. See the authentic 20-letter ancient Hebrew system.
                </p>
              </div>
              
              <div className="bg-white rounded p-4 border border-teal-200">
                <h4 className="font-bold text-teal-800 mb-2">↔️ Word Flow Analysis</h4>
                <p className="text-gray-700 text-sm">
                  Compare how Hebrew words flow into English. Understand the REAL meaning behind every translation.
                </p>
              </div>
              
              <div className="bg-white rounded p-4 border border-teal-200">
                <h4 className="font-bold text-teal-800 mb-2">📖 Built-in Concordance</h4>
                <p className="text-gray-700 text-sm">
                  Cross-reference every word instantly. Master patterns and shortcuts designed by decades of biblical scholarship.
                </p>
              </div>
              
              <div className="bg-white rounded p-4 border border-teal-200">
                <h4 className="font-bold text-teal-800 mb-2">✅ Verify Every Word</h4>
                <p className="text-gray-700 text-sm">
                  Don't just read - VERIFY. Check every word against the original Hebrew. Truth seekers deserve accuracy.
                </p>
              </div>
            </div>

            <p className="text-gray-800 mt-4 text-center font-semibold">
              💡 This book gives you <span className="text-teal-700">FAR MORE knowledge</span> than any standard translation. 
              It's a research library in your hands.
            </p>
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
            <button
              onClick={() => setActiveSection('concordance')}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                activeSection === 'concordance'
                  ? 'bg-teal-700 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-teal-100'
              }`}
            >
              📚 Concordance
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
            ) : activeSection === 'concordance' ? (
              <p className="text-gray-600">
                <span className="font-semibold text-teal-700">Concordance:</span> Complete word index with Hebrew roots, meanings, and references - your comprehensive study tool.
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
          {activeSection === 'interlinear' ? renderInterlinear() : 
           activeSection === 'pure-hebrew' ? renderPureHebrew() : 
           activeSection === 'concordance' ? renderConcordance() : 
           renderBilingual()}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-lg shadow-xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Master the Scriptures?
          </h3>
          <p className="text-xl mb-3">
            This sample shows you the power of word-by-word Hebrew analysis.
          </p>
          <p className="text-lg mb-6 text-teal-100">
            The complete books include <span className="font-bold">full concordances</span>, <span className="font-bold">cross-references</span>, 
            <span className="font-bold"> shortcut patterns</span>, and tools that give you knowledge far beyond any standard translation.
          </p>
          <div className="bg-teal-800 bg-opacity-50 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-sm italic">
              "These are cross-reference words for people who want to master the scriptures. Designed with shortcut patterns 
              and built-in concordance to give you far more knowledge than your average book."
            </p>
            <p className="text-xs mt-2 text-teal-200">— Richard Johnson, Biblical Scholar</p>
          </div>
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
