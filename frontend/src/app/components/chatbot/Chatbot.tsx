import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  message: string;
  created_at?: string;
}
const STORAGE_KEY = 'phosphatestock_conversation_id';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll au dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  // Initialisation et chargement de l'historique
  useEffect(() => {
    async function initConversation() {
      try {
        const storedId = localStorage.getItem(STORAGE_KEY);
        
        if (storedId) {
          try {
            // Vérifie que la conversation existe toujours et charge l'historique
            const res = await api.get(`/chatbot/conversation/${storedId}/history`);
            if (res.data && res.data.success) {
              setConversationId(Number(storedId));
              setMessages(res.data.data);
              return;
            }
          } catch (e) {
            // Si 403/404 (conversation supprimée ou compte différent), on nettoie
            localStorage.removeItem(STORAGE_KEY);
          }
        }
        
        // Création d'une nouvelle conversation
        const createRes = await api.post('/chatbot/conversation', {
          title: 'Nouvelle discussion',
        });
        const newId = createRes.data.data.id;
        localStorage.setItem(STORAGE_KEY, newId.toString());
        setConversationId(newId);
        
      } catch (err) {
        console.error('Erreur init chatbot:', err);
      }
    }
    
    initConversation();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !conversationId) return;
    
    const textToSend = inputText.trim();
    setInputText('');
    setError(null);
    setIsLoading(true);

    // Ajout optimiste du message utilisateur
    const tempMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      message: textToSend,
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      // 2. Envoi du message
      const res = await api.post(`/chatbot/conversation/${conversationId}/message`, {
        message: textToSend,
      });

      // L'API renvoie l'historique complet dans res.data.data.history
      if (res.data.success && res.data.data.history) {
        setMessages(res.data.data.history);
      } else {
        throw new Error("Format de réponse inattendu");
      }
    } catch (err: any) {
      console.error('Erreur API Chatbot:', err);
      setError("Impossible de contacter l'assistant. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-xl transition-all duration-300 z-50 flex items-center justify-center hover:scale-105"
          aria-label="Ouvrir l'assistant"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Fenêtre de discussion */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[85vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-emerald-700 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Assistant Phosphate</h3>
                <p className="text-[11px] text-emerald-100">En ligne</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-emerald-600 rounded-md transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Zone des messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 gap-3 opacity-80">
                <Bot size={40} className="text-emerald-600/50" />
                <p className="text-sm font-medium">Bonjour ! Posez-moi vos questions sur l'état des stocks ou les alertes.</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.sender === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div
                  className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm border ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-sm border-emerald-800'
                      : 'bg-white text-slate-700 rounded-tl-sm border-slate-200'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-700">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-2 p-3 bg-white rounded-2xl rounded-tl-sm border border-slate-200 text-slate-500 shadow-sm text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="animate-pulse">L'assistant réfléchit...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex gap-2 items-center p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 mx-auto w-full">
                <AlertCircle size={16} className="flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez votre message..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm disabled:opacity-50 disabled:hover:bg-emerald-700 transition-colors"
                aria-label="Envoyer"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
