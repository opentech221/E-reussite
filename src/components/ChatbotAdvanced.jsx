import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, Sparkles, ThumbsUp, ThumbsDown, BookOpen, Calculator, Globe, PenTool, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { user, sendChatMessage } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
      const welcomeMessage = {
        id: 'welcome',
        sender: 'bot',
        text: `Bonjour ${userName} ! 👋 Je suis votre assistant pédagogique personnel. Comment puis-je vous aider dans vos révisions aujourd'hui ?`,
        timestamp: new Date().toISOString()
      };
      
      setMessages([welcomeMessage]);
      setSuggestions([
        "Comment réviser efficacement ?",
        "Aide-moi en mathématiques",
        "Conseils pour le BFEM",
        "Techniques de mémorisation"
      ]);
    }
  }, [isOpen, user, messages.length]);

  const handleSendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setSuggestions([]);

    try {
      const response = await sendChatMessage(messageText, {
        currentPage: window.location.pathname,
        timestamp: new Date().toISOString()
      });

      if (response) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: response.response,
          timestamp: new Date().toISOString(),
          conversationId: response.conversationId,
          helpful: null
        };

        setMessages(prev => [...prev, botMessage]);
        setSuggestions(response.suggestions || []);
      }
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Désolé, je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    const quickActions = {
      'math_help': "J'ai besoin d'aide en mathématiques",
      'french_help': "Comment améliorer mon français ?",
      'study_tips': "Quelles sont les meilleures techniques d'étude ?",
      'exam_prep': "Comment me préparer efficacement aux examens ?",
      'motivation': "J'ai besoin de motivation pour étudier"
    };

    if (quickActions[action]) {
      handleSendMessage(quickActions[action]);
    }
  };

  const handleFeedback = async (messageId, isHelpful, conversationId) => {
    try {
      // Update message locally
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, helpful: isHelpful } : msg
      ));

      // Send feedback to backend
      if (conversationId) {
        // This would send feedback to the chatbot for learning
        console.log('Feedback sent:', { conversationId, isHelpful });
      }

      toast({
        title: isHelpful ? "Merci ! 😊" : "Merci pour votre retour 🤖",
        description: isHelpful 
          ? "Votre retour m'aide à m'améliorer !"
          : "Je vais m'efforcer de mieux vous aider la prochaine fois."
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-24 right-4 sm:right-8 w-[calc(100%-2rem)] sm:w-96 h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 z-50"
      >
        {/* Header */}
        <header className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Assistant IA</h3>
              <p className="text-xs text-slate-600">Toujours là pour vous aider</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </header>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50/30 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
              )}
              
              <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : ''}`}>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white text-slate-800 rounded-bl-none shadow-sm border'
                }`}>
                  {msg.text}
                </div>
                
                {/* Feedback buttons for bot messages */}
                {msg.sender === 'bot' && !msg.isError && (
                  <div className="flex items-center gap-2 mt-2 ml-1">
                    <span className="text-xs text-slate-500">Utile ?</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 ${msg.helpful === true ? 'text-green-600' : 'text-slate-400'}`}
                      onClick={() => handleFeedback(msg.id, true, msg.conversationId)}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 ${msg.helpful === false ? 'text-red-600' : 'text-slate-400'}`}
                      onClick={() => handleFeedback(msg.id, false, msg.conversationId)}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-300 text-white flex items-center justify-center flex-shrink-0 order-3">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                <Bot size={16} />
              </div>
              <div className="max-w-[80%] p-3 rounded-2xl bg-white text-slate-800 rounded-bl-none shadow-sm border">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && !isLoading && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 text-center">Suggestions :</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3 bg-white hover:bg-slate-50 border-slate-200"
                    onClick={() => handleSendMessage(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 text-center">Actions rapides :</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 flex-col gap-1 bg-white hover:bg-blue-50 border-blue-200"
                  onClick={() => handleQuickAction('math_help')}
                >
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span className="text-xs">Maths</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 flex-col gap-1 bg-white hover:bg-green-50 border-green-200"
                  onClick={() => handleQuickAction('french_help')}
                >
                  <PenTool className="w-4 h-4 text-green-600" />
                  <span className="text-xs">Français</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 flex-col gap-1 bg-white hover:bg-purple-50 border-purple-200"
                  onClick={() => handleQuickAction('study_tips')}
                >
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span className="text-xs">Méthodes</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 flex-col gap-1 bg-white hover:bg-orange-50 border-orange-200"
                  onClick={() => handleQuickAction('exam_prep')}
                >
                  <Star className="w-4 h-4 text-orange-600" />
                  <span className="text-xs">Examens</span>
                </Button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="p-4 border-t bg-white rounded-b-2xl"
        >
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 border-slate-200 focus:border-primary"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="px-4 bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

export default Chatbot;