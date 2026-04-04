import React, { useState, useEffect, useRef } from 'react';

const AIRichard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true); // VOICE ON BY DEFAULT
  const [voiceQuality, setVoiceQuality] = useState('premium'); // 'free' or 'premium' - DEFAULT TO PREMIUM
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false); // NEW: Always-on listening
  const [isRecognitionActive, setIsRecognitionActive] = useState(false); // Track if recognition is running
  const [walkPosition, setWalkPosition] = useState(-10); // Walking animation position (starts OFF-SCREEN)
  const [walkDirection, setWalkDirection] = useState(1); // 1 = right, -1 = left
  const [hasEntered, setHasEntered] = useState(false); // Track if Richard has walked onto screen
  const [walkFrame, setWalkFrame] = useState(1); // Current walking animation frame (1-4)
  const [danceFrame, setDanceFrame] = useState(1); // Current dance animation frame (1-4)
  const [isDancing, setIsDancing] = useState(false); // Is music playing?
  
  // 💰 SUBSCRIPTION: AI Richard Chat Access (Two-tier: Basic $2 or Premium $5)
  const [hasSubscription, setHasSubscription] = useState(null); // null = checking, true/false = known
  const [subscriptionTier, setSubscriptionTier] = useState(null); // 'basic' or 'premium'
  const [showPaywall, setShowPaywall] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  // CHOOSE YOUR WALKING STYLE: 'silhouette' or 'purple' or 'photo' or 'animated'
  const walkingStyle = 'animated'; // Animated = real leg movement!
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const currentAudioRef = useRef(null); // Track current audio to prevent duplicates
  const audioLockedRef = useRef(false); // Use ref for instant updates

  // 💰 Check subscription status when component mounts
  useEffect(() => {
    const checkSubscription = async () => {
      // Check localStorage for email
      const storedEmail = localStorage.getItem('user_email');
      if (!storedEmail) {
        setHasSubscription(false);
        return;
      }
      
      setUserEmail(storedEmail);
      
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/payments/ai-richard/check-subscription?email=${encodeURIComponent(storedEmail)}`
        );
        const data = await response.json();
        setHasSubscription(data.has_subscription);
        setSubscriptionTier(data.tier); // Store tier information
      } catch (error) {
        console.error('Subscription check failed:', error);
        setHasSubscription(false);
      }
    };
    
    checkSubscription();
  }, []);

  // 💰 REMOVED BROKEN PAYPAL SDK - Using direct links instead (Working solution)

  // Check if user just subscribed (success redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('ai_richard_subscribed') === 'true') {
      const tier = urlParams.get('tier') || 'basic';
      setHasSubscription(true);
      setSubscriptionTier(tier);
      setShowPaywall(false);
      setIsOpen(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // 💰 AI SALES AGENT: Parse checkout buttons from AI responses
  const parseMessageContent = (content) => {
    // Format: [CHECKOUT_BUTTON|Button Text|product_id|frontend_url]
    const buttonRegex = /\[CHECKOUT_BUTTON\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = buttonRegex.exec(content)) !== null) {
      // Add text before button
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      // Add button
      parts.push({
        type: 'button',
        text: match[1],
        productId: match[2],
        frontendUrl: match[3]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  // 💰 Handle Stripe checkout button click
  const handleCheckoutClick = async (productId, frontendUrl) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/ai-sales/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: productId,
          origin_url: frontendUrl,
          metadata: {
            conversation_id: conversationId,
            source: 'ai_richard_chat'
          }
        })
      });
      
      const data = await response.json();
      
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Sorry, there was an error processing your request. Please try again.');
    }
  };


  // 💰 Handle AI Richard BASIC subscription purchase ($2/month)
  const handleSubscribe = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Save email to localStorage
    localStorage.setItem('user_email', userEmail);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/ai-richard/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          origin_url: window.location.origin
        })
      });
      
      const data = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Error creating subscription. Please try again.');
    }
  };

  // 💰 Handle AI Richard PREMIUM subscription purchase ($5/month)
  const handleSubscribePremium = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Save email to localStorage
    localStorage.setItem('user_email', userEmail);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/ai-richard/subscribe-premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          origin_url: window.location.origin
        })
      });
      
      const data = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Premium subscription error:', error);
      alert('Error creating premium subscription. Please try again.');
    }
  };

  // Open chat (with subscription check - ADMIN BYPASS grants PREMIUM access)
  const openChat = () => {
    // Admin bypass: Check for admin password (GRANTS PREMIUM ACCESS)
    const adminPass = localStorage.getItem('admin_ai_access');
    
    if (adminPass === 'RJHNSN12admin2026') {
      setHasSubscription(true);
      setSubscriptionTier('premium'); // Admin gets PREMIUM access for testing
      setIsOpen(true);
    } else if (hasSubscription === true) {
      setIsOpen(true);
    } else if (hasSubscription === false) {
      setShowPaywall(true);
    } else {
      setIsOpen(true); // If unknown, allow access
    }
  };

  // iOS Audio Fix: Initialize speech synthesis on first user interaction
  useEffect(() => {
    const initializeAudio = () => {
      // Initialize speech synthesis for iOS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(utterance);
        window.speechSynthesis.cancel();
        console.log('✅ iOS audio initialized');
      }
      
      // Remove listener after first interaction
      document.removeEventListener('click', initializeAudio);
      document.removeEventListener('touchstart', initializeAudio);
    };
    
    // Listen for first user interaction to initialize audio
    document.addEventListener('click', initializeAudio);
    document.addEventListener('touchstart', initializeAudio);
    
    return () => {
      document.removeEventListener('click', initializeAudio);
      document.removeEventListener('touchstart', initializeAudio);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting when opened for first time
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm Richard Johnson, biblical Hebrew researcher and web developer. I can help you with:\n\n📖 My Hebrew research and Book of Amos translation\n💬 AI Chat subscriptions\n🎵 The radio station\n💻 Professional website development\n\nWhat brings you here today?"
      }]);
    }
  }, [isOpen]);

  // Walking animation effect - RICHARD WALKS ONTO SCENE! (SLOWER)
  useEffect(() => {
    if (isOpen) return; // Don't walk when chat is open

    const walkInterval = setInterval(() => {
      setWalkPosition(prev => {
        const newPos = prev + (walkDirection * 0.3); // SLOWER: Move 0.3rem per tick (was 0.5)
        
        // Check boundaries (walk between 6rem and 80% of screen width)
        const maxPosition = (window.innerWidth * 0.8) / 16; // Convert to rem
        
        // First entrance - walk onto screen from left
        if (!hasEntered && newPos >= 6) {
          setHasEntered(true);
          return 6;
        }
        
        // After entrance, do normal back-and-forth walking
        if (hasEntered) {
          if (newPos >= maxPosition) {
            setWalkDirection(-1); // Turn around, walk left
            return maxPosition;
          } else if (newPos <= 6) {
            setWalkDirection(1); // Turn around, walk right
            return 6;
          }
        }
        
        return newPos;
      });
    }, 80); // SLOWER: Update every 80ms (was 50ms)

    return () => clearInterval(walkInterval);
  }, [isOpen, walkDirection, hasEntered]);

  // Leg animation - cycle through walking frames FASTER for snappier leg movement!
  // IMPORTANT: Reverse frame direction when walking left to prevent moonwalking!
  useEffect(() => {
    if (isOpen || walkingStyle !== 'animated') return;

    const frameInterval = setInterval(() => {
      setWalkFrame(prev => {
        if (walkDirection === 1) {
          // Walking RIGHT: frames go forward 1 -> 2 -> 3 -> 4 -> 1
          return prev >= 4 ? 1 : prev + 1;
        } else {
          // Walking LEFT: frames go backward 4 -> 3 -> 2 -> 1 -> 4
          return prev <= 1 ? 4 : prev - 1;
        }
      });
    }, 120); // FASTER leg movement: Change frame every 120ms

    return () => clearInterval(frameInterval);
  }, [isOpen, walkingStyle, walkDirection]);

  // Dance animation - cycle through dance frames when music is playing!
  useEffect(() => {
    if (isOpen || walkingStyle !== 'animated' || !isDancing) return;

    const danceInterval = setInterval(() => {
      setDanceFrame(prev => (prev >= 4 ? 1 : prev + 1)); // Cycle 1 -> 2 -> 3 -> 4 -> 1
    }, 100); // FAST dance moves: Change frame every 100ms

    return () => clearInterval(danceInterval);
  }, [isOpen, walkingStyle, isDancing]);

  // Audio detection - Detect when radio is playing music!
  useEffect(() => {
    const detectAudio = () => {
      // Check if there's any audio element playing on the page
      const audioElements = document.querySelectorAll('audio');
      let isAudioPlaying = false;

      audioElements.forEach(audio => {
        if (!audio.paused && !audio.ended && audio.currentTime > 0) {
          isAudioPlaying = true;
        }
      });

      setIsDancing(isAudioPlaying);
    };

    // Check audio status every 500ms
    const audioCheckInterval = setInterval(detectAudio, 500);

    return () => clearInterval(audioCheckInterval);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai-richard/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: conversationId,
          page_context: window.location.pathname
        })
      });

      const data = await response.json();
      
      setConversationId(data.conversation_id);
      const aiResponse = data.response;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse 
      }]);
      
      // Speak the response if voice is enabled (but skip if response is too long)
      if (voiceEnabled) {
        // CRITICAL: Don't TTS massive responses (>1000 chars) - they freeze the app
        if (aiResponse.length > 1000) {
          console.log('⚠️ Response too long for TTS - skipping voice output');
          // Show a brief notification to user
          const ttsSkipMsg = "\n\n[Note: This response is too long for voice output. I've provided the full text for you to read.]";
          // Don't actually append this - just log it
        } else {
          speakText(aiResponse);
        }
      }
    } catch (error) {
      console.error('AI Richard error:', error);
      const errorMsg = "I apologize, but I'm having trouble connecting right now. Please try again in a moment or email me directly at the contact information on the site.";
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMsg 
      }]);
      if (voiceEnabled) {
        speakText(errorMsg);
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Text-to-Speech function (FREE or PREMIUM)
  const speakText = async (text) => {
    console.log('🔊 speakText called');
    console.log('   Voice:', voiceQuality);
    console.log('   Lock:', audioLockedRef.current);
    console.log('   isSpeaking:', isSpeaking);
    
    // FORCE CLEANUP FIRST - always start fresh
    console.log('🧹 Force cleanup before speaking...');
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      } catch (e) {
        console.log('   Cleanup warning:', e);
      }
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Check lock AFTER cleanup
    if (audioLockedRef.current) {
      console.log('🔒 BLOCKED - Lock is active, forcing reset...');
      audioLockedRef.current = false; // Force reset
    }
    
    if (isSpeaking) {
      console.log('🔒 BLOCKED - isSpeaking is true, waiting 1 sec then retry...');
      setTimeout(() => speakText(text), 1000); // Retry after 1 sec
      return;
    }
    
    // Set lock and state
    audioLockedRef.current = true;
    setIsSpeaking(true);
    console.log('🔓 Lock acquired, starting audio...');
    
    // Pause radio while AI is speaking
    const radioPlayer = document.querySelector('audio');
    const wasPlaying = radioPlayer && !radioPlayer.paused;
    if (wasPlaying) {
      radioPlayer.pause();
    }
    
    try {
      console.log('🎤 FORCING PREMIUM VOICE (NOVA)'); // DEBUG
      
      // ALWAYS USE PREMIUM - NO IF STATEMENT
      console.log('✨ Calling OpenAI TTS with Nova voice');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tts/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text,
          voice: 'nova' // Female voice - FORCED
        })
      });
      
      console.log('TTS Response status:', response.status);
      
      if (!response.ok) {
        console.error('TTS API failed with status:', response.status);
        throw new Error('TTS API failed');
      }
      
      const audioBlob = await response.blob();
      console.log('Audio blob received, size:', audioBlob.size);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      currentAudioRef.current = audio;
      console.log('📢 Premium audio created and ready to play');
      
      audio.onended = () => {
        console.log('✅ Audio ended');
        setIsSpeaking(false);
        audioLockedRef.current = false;
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        if (wasPlaying && !continuousMode && radioPlayer) {
          radioPlayer.play();
        }
      };
      
      audio.onerror = (err) => {
        console.error('❌ Audio playback error:', err);
        setIsSpeaking(false);
        audioLockedRef.current = false;
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };
      
      console.log('▶️ Starting audio playback...');
      await audio.play();
      console.log('🔊 Audio playing!');
      
    } catch (error) {
      console.error('❌ VOICE ERROR:', error);
      setIsSpeaking(false);
      audioLockedRef.current = false;
      alert('Voice failed: ' + error.message);
    }
  };

  const toggleVoice = () => {
    const newVoiceState = !voiceEnabled;
    console.log(`🔊 Voice toggle: ${voiceEnabled} → ${newVoiceState}`);
    
    if (voiceEnabled) {
      // Turning off - stop any current speech
      if (voiceQuality === 'free') {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } else {
      // Turning on - show confirmation
      console.log('✅ Voice enabled! AI Richard will now speak responses.');
    }
    setVoiceEnabled(newVoiceState);
  };

  const stopSpeaking = () => {
    // Stop premium audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    // Stop free voice
    if (voiceQuality === 'free') {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;
      
      // IMPORTANT: No built-in timeout, let user speak at their pace

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        setIsRecognitionActive(false);
        
        // Auto-send the message immediately for natural voice conversation
        if (transcript.trim()) {
          // Add user message to chat
          setMessages(prev => [...prev, { role: 'user', content: transcript }]);
          setIsTyping(true);

          // Send to backend
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai-richard/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: transcript,
              conversation_id: conversationId,
              page_context: window.location.pathname
            })
          })
          .then(response => response.json())
          .then(data => {
            setConversationId(data.conversation_id);
            const aiResponse = data.response;
            
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: aiResponse 
            }]);
            
            // Speak the response if voice is enabled (but skip if response is too long)
            if (voiceEnabled && !isSpeaking) {
              console.log('📞 Calling speakText from fetch success');
              speakText(aiResponse);
            } else if (isSpeaking) {
              console.log('⚠️ Skipping speakText - already speaking');
              // Queue it instead of speaking immediately
            } else {
              // If voice not enabled but continuous mode is on, restart listening
              if (continuousMode && !isRecognitionActive) {
                setTimeout(() => {
                  try {
                    recognitionRef.current.start();
                    setIsListening(true);
                    setIsRecognitionActive(true);
                  } catch (err) {
                    console.error('Restart failed:', err);
                  }
                }, 500);
              }
            }
          })
          .catch(error => {
            console.error('AI Richard error:', error);
            const errorMsg = "I apologize, but I'm having trouble connecting right now. Please try again.";
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: errorMsg 
            }]);
            if (voiceEnabled) {
              speakText(errorMsg);
            } else {
              // Restart listening even on error if continuous mode
              if (continuousMode && !isRecognitionActive) {
                setTimeout(() => {
                  try {
                    recognitionRef.current.start();
                    setIsListening(true);
                    setIsRecognitionActive(true);
                  } catch (err) {
                    console.error('Restart failed:', err);
                  }
                }, 500);
              }
            }
          })
          .finally(() => {
            setIsTyping(false);
          });
        } else {
          // Empty transcript - restart listening immediately
          if (continuousMode && !isRecognitionActive) {
            setTimeout(() => {
              try {
                recognitionRef.current.start();
                setIsListening(true);
                setIsRecognitionActive(true);
              } catch (err) {
                console.error('Restart failed:', err);
              }
            }, 500);
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecognitionActive(false);
        
        // Auto-restart if continuous mode and error is not fatal
        if (continuousMode && event.error !== 'aborted' && !isRecognitionActive) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
              setIsListening(true);
              setIsRecognitionActive(true);
            } catch (err) {
              console.error('Failed to restart recognition:', err);
            }
          }, 1000);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Recognition ended. Continuous mode:', continuousMode);
        setIsListening(false);
        setIsRecognitionActive(false);
        
        // CRITICAL: Use a ref check instead of state to avoid stale closure
        // Check if the button is still in continuous mode
        const continuousModeActive = document.querySelector('[class*="bg-green-600"][class*="animate-pulse"]');
        
        if (continuousModeActive) {
          console.log('Auto-restarting recognition...');
          setTimeout(() => {
            try {
              recognitionRef.current.start();
              setIsListening(true);
              setIsRecognitionActive(true);
              console.log('Recognition restarted successfully');
            } catch (err) {
              console.error('Failed to restart recognition:', err);
              // Try one more time after a longer delay
              setTimeout(() => {
                try {
                  recognitionRef.current.start();
                  setIsListening(true);
                  setIsRecognitionActive(true);
                } catch (err2) {
                  console.error('Second restart attempt failed');
                  setIsRecognitionActive(false);
                }
              }, 1000);
            }
          }, 300);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [conversationId, voiceEnabled, voiceQuality]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setContinuousMode(false);
    } else {
      setInputValue(''); // Clear input before starting
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleContinuousMode = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    if (!continuousMode) {
      // Enable continuous mode
      setContinuousMode(true);
      
      // CRITICAL: Force voice output ON
      if (!voiceEnabled) {
        setVoiceEnabled(true);
      }
      
      setInputValue('');
      
      // Pause radio if playing
      const radioPlayer = document.querySelector('audio');
      if (radioPlayer && !radioPlayer.paused) {
        radioPlayer.pause();
        // Store that we paused it
        radioPlayer.dataset.pausedByAI = 'true';
      }
      
      // Small delay to ensure voiceEnabled state updates
      setTimeout(() => {
        if (!isRecognitionActive) {
          try {
            recognitionRef.current.start();
            setIsListening(true);
            setIsRecognitionActive(true);
          } catch (err) {
            console.error('Failed to start recognition:', err);
          }
        }
      }, 100);
    } else {
      // Disable continuous mode
      setContinuousMode(false);
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Resume radio if we paused it
      const radioPlayer = document.querySelector('audio');
      if (radioPlayer && radioPlayer.dataset.pausedByAI === 'true') {
        radioPlayer.play();
        delete radioPlayer.dataset.pausedByAI;
      }
    }
  };

  return (
    <>
      {/* Floating button - WALKS ONTO SCENE FROM LEFT! */}
      {!isOpen && (
        <div 
          onClick={() => openChat()}
          className="fixed z-50 cursor-pointer group transition-all duration-200 ease-linear"
          style={{ 
            bottom: window.innerWidth < 640 ? '5rem' : '1.5rem', // 20 on mobile (5rem), 6 on desktop (1.5rem)
            left: `${walkPosition}rem`,
            transform: walkDirection === -1 ? 'scaleX(-1)' : 'scaleX(1)',
            isolation: 'isolate' // Prevent background bleed
          }}
        >
          {/* Walking Figure or Photo */}
          <div className="relative">
            {walkingStyle === 'photo' ? (
              // ORIGINAL: Circular photo
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 p-1 shadow-2xl group-hover:scale-110 transition-transform duration-300 animate-bounce-subtle">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  <img 
                    src="/richard-avatar.jpg"
                    alt="Richard Johnson"
                    className="w-full h-full object-cover"
                    style={{ transform: walkDirection === -1 ? 'scaleX(-1)' : 'scaleX(1)' }}
                  />
                </div>
              </div>
            ) : (
              // NEW: Walking OR Dancing figure with REAL LEG/DANCE MOVEMENT!
              <img 
                src={
                  isDancing 
                    ? `/dance-frame-${danceFrame}.png`  // DANCING when music plays! 🕺
                    : walkingStyle === 'animated' 
                      ? `/walk-frame-${walkFrame}.png`  // Cycle through walk frames
                      : walkingStyle === 'silhouette' 
                        ? '/richard-walking-silhouette.png' 
                        : '/richard-walking-purple.png'
                }
                alt="Richard Johnson Walking"
                className={`w-32 h-32 object-contain drop-shadow-2xl group-hover:scale-110 transition-all duration-200 ease-in-out ${isDancing ? 'animate-bounce' : ''}`}
                style={{ 
                  transform: walkDirection === -1 ? 'scaleX(-1)' : 'scaleX(1)',
                  mixBlendMode: 'normal'
                }}
              />
            )}
            
            {/* Online status indicator - only show for photo style */}
            {walkingStyle === 'photo' && (
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            )}
            
            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-full bg-purple-400 opacity-0 group-hover:opacity-30 animate-ping"></div>
            
            {/* Walking footsteps animation */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1 animate-pulse">
                <span className="text-xs opacity-50">👣</span>
              </div>
            </div>
            
            {/* Welcome wave when first entering - shows for 3 seconds */}
            {!hasEntered && walkPosition > -5 && !isDancing && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                  👋 Hello!
                </div>
              </div>
            )}
            
            {/* Dancing indicator when music plays! */}
            {isDancing && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 animate-pulse">
                <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                  🎵 Dancing!
                </div>
              </div>
            )}
          </div>
          
          {/* Label */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap text-sm">
              💬 Need help? Chat with Richard
              <div className="absolute top-full right-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}

      {/* Chat window - positioned above music player on mobile */}
      {isOpen && hasSubscription === true && (
        <div className="chat-widget-container fixed bottom-20 sm:bottom-6 left-4 sm:left-6 w-[calc(100vw-2rem)] sm:w-96 h-[calc(100vh-10rem)] sm:h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200 landscape:h-[85vh] landscape:bottom-2 landscape:left-2 landscape:w-[28rem]">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white bg-white flex-shrink-0">
                <img 
                  src="/richard-avatar.jpg"
                  alt="Richard Johnson"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-white flex-1 min-w-0">
                <div className="font-bold text-sm sm:text-base truncate">Richard Johnson</div>
                <div className="text-xs opacity-90 truncate hidden sm:block">
                  Biblical Researcher & Web Developer
                  {subscriptionTier && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      subscriptionTier === 'premium' 
                        ? 'bg-yellow-400 text-yellow-900' 
                        : 'bg-purple-200 text-purple-900'
                    }`}>
                      {subscriptionTier === 'premium' ? '⭐ PREMIUM' : 'BASIC'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Voice toggle button */}
              <button 
                onClick={toggleVoice}
                className={`text-white rounded-full p-2 sm:p-2.5 transition-all ${voiceEnabled ? 'bg-green-500 shadow-lg' : 'hover:bg-white/20'}`}
                title={voiceEnabled ? "Voice ON - AI will speak" : "Voice OFF - Click to enable"}
              >
                {voiceEnabled ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              {/* Stop speaking button (only show when speaking) */}
              {isSpeaking && (
                <button 
                  onClick={stopSpeaking}
                  className="text-white bg-red-500 rounded-full p-2 transition-colors animate-pulse"
                  title="Stop speaking"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 shadow-md rounded-bl-none border border-gray-200'
                }`}>
                  {msg.role === 'assistant' ? (
                    // Parse AI responses for checkout buttons
                    <div className="text-sm space-y-2">
                      {parseMessageContent(msg.content).map((part, partIdx) => (
                        <React.Fragment key={partIdx}>
                          {part.type === 'text' ? (
                            <div className="whitespace-pre-wrap">{part.content}</div>
                          ) : (
                            // Render Stripe checkout button
                            <button
                              onClick={() => handleCheckoutClick(part.productId, part.frontendUrl)}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {part.text}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    // User messages - plain text
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-md border border-gray-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 bg-white border-t border-gray-200">
            {/* Voice is ALWAYS ON with Premium Female Voice */}
            {voiceEnabled && (
              <div className="mb-2 p-2 bg-purple-50 rounded-lg text-center border border-purple-200">
                <p className="text-sm text-purple-700 font-medium">🔊 Voice ON (Premium Female)</p>
                <p className="text-xs text-gray-600 mt-1">AI Richard speaks with Nova's voice</p>
              </div>
            )}
            {isSpeaking && (
              <div className="mb-2 flex items-center gap-2 text-sm text-blue-600 font-medium">
                {/* Animated speaker waveform */}
                <div className="flex items-center gap-1">
                  <div className="w-1 h-3 bg-blue-600 rounded animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1 h-5 bg-blue-600 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-4 bg-blue-600 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-6 bg-blue-600 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-1 h-4 bg-blue-600 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span>Richard is speaking... ({voiceQuality === 'premium' ? 'Premium' : 'Free'} voice)</span>
              </div>
            )}
            {isListening && !isSpeaking && (
              <div className="mb-2 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-red-600 font-bold">
                    {/* Animated microphone waveform */}
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-4 bg-red-600 rounded animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-1 h-6 bg-red-600 rounded animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-5 bg-red-600 rounded animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 h-7 bg-red-600 rounded animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      <div className="w-1 h-5 bg-red-600 rounded animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-lg">🎤 LISTENING - SPEAK NOW!</span>
                  </div>
                </div>
                <div className="text-xs text-red-700 mt-1 font-medium">
                  Take your time - I'm listening for your full question!
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={continuousMode ? "Listening..." : (isListening ? "Listening..." : "Type or speak your message...")}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                disabled={isTyping || isListening || continuousMode}
              />
              {!continuousMode && (
                <button
                  onClick={toggleVoiceInput}
                  disabled={isTyping}
                  className={`p-3 rounded-xl transition-all font-medium min-w-[48px] flex items-center justify-center ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={isListening ? "Stop recording" : "Start voice input"}
                >
                  {isListening ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              )}
              {!continuousMode && (
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-purple-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium min-w-[60px]"
                >
                  Send
                </button>
              )}
            </div>
            {isListening && (
              <div className="mt-2 text-center text-sm text-red-600 font-medium animate-pulse">
                🎤 Listening... Speak now
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💰 PAYWALL MODAL - Two-Tier Membership System */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 my-8">
            
            {/* Admin Access Option */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-2">🔐 Site Owner? Enter Admin Password (Grants Premium Access):</p>
              <input
                type="password"
                placeholder="Admin password"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value === 'RJHNSN12admin2026') {
                    localStorage.setItem('admin_ai_access', 'RJHNSN12admin2026');
                    setHasSubscription(true);
                    setSubscriptionTier('premium');
                    setShowPaywall(false);
                    setIsOpen(true);
                  } else if (e.key === 'Enter') {
                    alert('Incorrect admin password');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Press Enter after typing password</p>
            </div>

            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-600">
                <img 
                  src="/richard-avatar.jpg"
                  alt="Richard Johnson"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Membership</h2>
              <p className="text-gray-600 text-sm max-w-2xl mx-auto">
                Support this Hebrew truth ministry while gaining access to exclusive biblical research and AI assistance.
              </p>
            </div>

            {/* Email Input - Above pricing cards */}
            <div className="mb-6 max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Two-Tier Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              
              {/* BASIC TIER - $2/month */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Membership</h3>
                  <div className="text-4xl font-bold text-purple-600 mb-1">
                    $2<span className="text-lg">/month</span>
                  </div>
                  <p className="text-sm text-gray-600">Perfect for getting started</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">✨ Unlimited AI Richard conversations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">📖 Book of Amos Chapters 1-4</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">🎵 24/7 Radio access</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">🎤 Premium voice responses (Nova)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">🔄 Cancel anytime</span>
                  </div>
                </div>

                {/* PayPal Basic Subscription Button - Direct Link */}
                <a
                  href="https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0SD94356S2107193PNHH2AHI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 text-center"
                >
                  Subscribe to Basic - $2/month
                </a>
              </div>

              {/* PREMIUM TIER - $5/month - FEATURED */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-4 border-yellow-400 relative hover:border-yellow-500 transition-all hover:shadow-2xl">
                {/* "BEST VALUE" Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐ BEST VALUE
                  </div>
                </div>

                <div className="text-center mb-4 mt-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Membership</h3>
                  <div className="text-4xl font-bold text-orange-600 mb-1">
                    $5<span className="text-lg">/month</span>
                  </div>
                  <p className="text-sm text-gray-600">Full access to everything</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700 font-medium">✅ Everything in Basic, PLUS:</span>
                  </div>
                  <div className="flex items-start gap-2 pl-7">
                    <span className="text-sm text-gray-700">📚 Book of Amos Chapters 5-9 (early access)</span>
                  </div>
                  <div className="flex items-start gap-2 pl-7">
                    <span className="text-sm text-gray-700">📖 Complete Book of Daniel (12 chapters)</span>
                  </div>
                  <div className="flex items-start gap-2 pl-7">
                    <span className="text-sm text-gray-700">🎓 Advanced Hebrew alphabet lessons</span>
                  </div>
                  <div className="flex items-start gap-2 pl-7">
                    <span className="text-sm text-gray-700">🔍 Deep dives into mistranslations</span>
                  </div>
                  <div className="flex items-start gap-2 pl-7">
                    <span className="text-sm text-gray-700">💰 20% discount on all book purchases</span>
                  </div>
                  <div className="flex items-start gap-2 pl-7">
                    <span className="text-sm text-gray-700">⚡ Priority AI support</span>
                  </div>
                </div>

                {/* PayPal Premium Subscription Button - Direct Link */}
                <a
                  href="https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-39S03317TS707131YNHH2M6A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-700 hover:to-yellow-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 text-center"
                >
                  Subscribe to Premium - $5/month
                </a>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="text-center">
              <button
                onClick={() => setShowPaywall(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Maybe Later
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 Secure payment powered by PayPal. Cancel anytime, no questions asked.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIRichard;
