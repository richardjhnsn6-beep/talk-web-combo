import React, { useState, useEffect, useRef } from 'react';

const AIRichard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceQuality, setVoiceQuality] = useState('free'); // 'free' or 'premium'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false); // NEW: Always-on listening
  const [isRecognitionActive, setIsRecognitionActive] = useState(false); // Track if recognition is running
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

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
      
      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speakText(aiResponse);
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
    setIsSpeaking(true);
    
    // Pause radio while AI is speaking
    const radioPlayer = document.querySelector('audio');
    const wasPlaying = radioPlayer && !radioPlayer.paused;
    if (wasPlaying) {
      radioPlayer.pause();
    }
    
    try {
      if (voiceQuality === 'premium') {
        // PREMIUM: OpenAI TTS
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tts/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: text,
            voice: 'onyx' // Deep, authoritative male voice - best fit for Richard Johnson
          })
        });
        
        if (!response.ok) {
          throw new Error('TTS API failed');
        }
        
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // Resume radio if it was playing and not in continuous mode
          if (wasPlaying && !continuousMode && radioPlayer) {
            radioPlayer.play();
          }
          // Restart listening if continuous mode is on
          if (continuousMode && recognitionRef.current && !isRecognitionActive) {
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
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // Resume radio on error
          if (wasPlaying && !continuousMode && radioPlayer) {
            radioPlayer.play();
          }
          // Restart listening even on error
          if (continuousMode && recognitionRef.current) {
            setTimeout(() => {
              recognitionRef.current.start();
              setIsListening(true);
            }, 500);
          }
        };
        
        await audio.play();
        
      } else {
        // FREE: Browser TTS
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          utterance.onend = () => {
            setIsSpeaking(false);
            // Resume radio if it was playing and not in continuous mode
            if (wasPlaying && !continuousMode && radioPlayer) {
              radioPlayer.play();
            }
            // Restart listening if continuous mode is on
            if (continuousMode && recognitionRef.current) {
              setTimeout(() => {
                recognitionRef.current.start();
                setIsListening(true);
              }, 500);
            }
          };
          utterance.onerror = () => {
            setIsSpeaking(false);
            // Resume radio on error
            if (wasPlaying && !continuousMode && radioPlayer) {
              radioPlayer.play();
            }
            // Restart listening even on error
            if (continuousMode && recognitionRef.current) {
              setTimeout(() => {
                recognitionRef.current.start();
                setIsListening(true);
              }, 500);
            }
          };
          
          window.speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(false);
          // Resume radio if speech synthesis not available
          if (wasPlaying && radioPlayer) {
            radioPlayer.play();
          }
        }
      }
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
      // Resume radio on error
      if (wasPlaying && !continuousMode && radioPlayer) {
        radioPlayer.play();
      }
      // Restart listening even on error
      if (continuousMode && recognitionRef.current) {
        setTimeout(() => {
          recognitionRef.current.start();
          setIsListening(true);
        }, 500);
      }
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      // Turning off - stop any current speech
      if (voiceQuality === 'free') {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const stopSpeaking = () => {
    if (voiceQuality === 'free') {
      window.speechSynthesis.cancel();
    }
    // For premium, audio will stop when component unmounts or new audio plays
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
            
            // Speak the response if voice is enabled
            if (voiceEnabled) {
              speakText(aiResponse);
            } else {
              // If voice not enabled but continuous mode is on, restart listening
              if (continuousMode) {
                setTimeout(() => {
                  recognitionRef.current.start();
                  setIsListening(true);
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
      {/* Floating button - Always visible - MOVED TO BOTTOM-LEFT */}
      {!isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 cursor-pointer group"
        >
          {/* Avatar circle */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 p-1 shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                <img 
                  src="/richard-avatar.jpg"
                  alt="Richard Johnson"
                  className="w-full h-full object-cover"
                />
                />
              </div>
            </div>
            
            {/* Online status indicator */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            
            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-full bg-purple-400 opacity-0 group-hover:opacity-30 animate-ping"></div>
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

      {/* Chat window - MOVED TO BOTTOM-LEFT */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white bg-white">
                <img 
                  src="/richard-avatar.jpg"
                  alt="Richard Johnson"
                  className="w-full h-full object-cover"
                />
                />
              </div>
              <div className="text-white">
                <div className="font-bold">Richard Johnson</div>
                <div className="text-xs opacity-90">Biblical Researcher & Web Developer</div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Voice toggle button */}
            <button 
              onClick={toggleVoice}
              className={`text-white rounded-full p-2 transition-colors ${voiceEnabled ? 'bg-green-500' : 'hover:bg-white/20'}`}
              title={voiceEnabled ? "Voice ON - AI will speak" : "Voice OFF - Click to enable"}
            >
              {voiceEnabled ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
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
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              </button>
            )}
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
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
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
            {/* Voice status indicator with quality selector */}
            {voiceEnabled && (
              <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium mb-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Voice enabled - Choose your preference:
                </div>
                {/* Voice quality buttons */}
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setVoiceQuality('free')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      voiceQuality === 'free'
                        ? 'bg-gray-700 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    🤖 Free Voice
                    <div className="text-xs opacity-75 mt-0.5">Robotic (No cost)</div>
                  </button>
                  <button
                    onClick={() => setVoiceQuality('premium')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      voiceQuality === 'premium'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    🎙️ Premium Voice
                    <div className="text-xs opacity-75 mt-0.5">Natural (Tiny cost)</div>
                  </button>
                </div>
                {/* Continuous Mode Toggle */}
                <button
                  onClick={toggleContinuousMode}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    continuousMode
                      ? 'bg-green-600 text-white shadow-md animate-pulse'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md'
                  }`}
                >
                  {continuousMode ? (
                    <>🎤 Always-On Mode (Active) - Click to Stop</>
                  ) : (
                    <>🔄 Enable Always-On Voice (Full Conversation)</>
                  )}
                </button>
                {continuousMode && (
                  <div className="text-xs text-center mt-2 space-y-1 bg-white p-2 rounded border border-blue-200">
                    <div className="text-blue-600 font-bold mb-1">
                      💬 Always-On Voice Mode Active!
                    </div>
                    <div className="text-gray-700 text-left space-y-1">
                      <div>✅ <strong>Speak naturally</strong> - Just talk when you see red waves</div>
                      <div>⏱️ <strong>Wait 4-5 seconds</strong> after speaking for AI to respond</div>
                      <div>🔇 <strong>Let AI finish speaking</strong> before you talk again</div>
                      <div>📻 <strong>Radio is paused</strong> for clear conversation</div>
                    </div>
                    <div className="text-orange-600 font-medium mt-2 text-center">
                      ⚠️ Don't interrupt while AI is speaking!
                    </div>
                  </div>
                )}
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
              <div className="mb-2 flex items-center gap-2 text-sm text-red-600 font-medium">
                {/* Animated microphone waveform */}
                <div className="flex items-center gap-1">
                  <div className="w-1 h-4 bg-red-600 rounded animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1 h-6 bg-red-600 rounded animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-5 bg-red-600 rounded animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-7 bg-red-600 rounded animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-1 h-5 bg-red-600 rounded animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span>🎤 Listening... Speak now!</span>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={continuousMode ? "Listening..." : (isListening ? "Listening..." : "Type or speak your message...")}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isTyping || isListening || continuousMode}
              />
              {!continuousMode && (
                <button
                  onClick={toggleVoiceInput}
                  disabled={isTyping}
                  className={`p-3 rounded-xl transition-all font-medium ${
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
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
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
    </>
  );
};

export default AIRichard;
