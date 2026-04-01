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
      hebrew: ["al", "Adanay", "YaChuwshuah", "baal", "Shaba", "darak", "Naphash", "qadash", "han", "yowm", "yash", "bow", "al", "attahah", "baa", "huw", "ahy", "Nasa", "attanah", "Nasa", "owd", "Tsannah", "aw", "Naphash", "acharyth", "owd", "cayr"],
      english: ["The", "Lord", "GOD", "hath", "sworn", "by", "his", "holiness", "that lo,", "the days", "shall", "come", "upon", "you", "that", "he", "will", "take", "you", "away", "with", "hooks", "and", "your", "posterity", "with", "fish, hooks"]
    },
    verse3: {
      hebrew: ["aw", "yash", "yatsa", "aw", "pharats", "Kashashah", "pharach", "aw", "han", "Asar", "Nadan", "Naphash", "aw", "yash", "Shalak", "Cham", "al", "haramown", "Naam", "al", "YaChuwshuah"],
      english: ["and", "ye shall", "go out", "at", "the breaches", "every", "cow", "at", "that", "which is", "before", "her", "and", "ye shall", "cast", "them", "into the", "palaces", "saith", "the", "LORD"]
    },
    verse4: {
      hebrew: ["bow", "Baythal", "aw", "pasha", "aw", "Galgal"],
      english: ["come to", "Beth-el", "and", "Transgress;", "at", "Gilgal"]
    }
  };

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
    if (activeChapter !== 1 && activeChapter !== 2 && activeChapter !== 3 && activeChapter !== 4) {
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
                        chapter4Interlinear;

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
    if (activeChapter !== 1 && activeChapter !== 2) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Chapter {activeChapter} Pure Hebrew content will be added soon.
          </p>
        </div>
      );
    }

    const pureHebrewData = activeChapter === 1 ? chapter1PureHebrew : chapter2PureHebrew;

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
    if (activeChapter !== 1) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Chapter {activeChapter} content will be added soon.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            This is a sample page showing Chapter 1 format.
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto">
        {chapter1Bilingual.map((item, index) => (
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-teal-800 mb-3">
              Book of Amos
            </h1>
            <p className="text-xl text-gray-600 mb-2">Free Sample - Chapters 1-4</p>
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
            ) : (
              <p className="text-gray-600">
                <span className="font-semibold text-teal-700">Bilingual Study:</span> Side-by-side comparison with Hebrew on the left and English on the right.
              </p>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          {activeSection === 'interlinear' ? renderInterlinear() : activeSection === 'pure-hebrew' ? renderPureHebrew() : renderBilingual()}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-lg shadow-xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">
            Love What You See?
          </h3>
          <p className="text-xl mb-6">
            This is just a sample! Get the complete books with full concordance and word studies.
          </p>
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
