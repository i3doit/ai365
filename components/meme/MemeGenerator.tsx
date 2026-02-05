'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Controls } from './Controls';
import { CanvasPreview, CanvasPreviewRef } from './CanvasPreview';
import { MemeConfig, DEFAULT_CONFIG, MemeHistoryItem } from './types';
import { supabase } from '../../src/lib/supabase';

export const MemeGenerator: React.FC = () => {
  const [config, setConfig] = useState<MemeConfig>(DEFAULT_CONFIG);
  const [isExporting, setIsExporting] = useState(false);
  const [generatedGif, setGeneratedGif] = useState<string | null>(null);
  const [history, setHistory] = useState<MemeHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isVip, setIsVip] = useState(false);
  
  const canvasRef = useRef<CanvasPreviewRef>(null);

  // Load from localStorage (Config & VIP status)
  useEffect(() => {
    const savedConfig = localStorage.getItem('memeConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to load config', e);
      }
    }

    const savedVip = localStorage.getItem('memeIsVip');
    if (savedVip === 'true') {
        setIsVip(true);
    }
    
    // Load history from Supabase
    loadHistory();
  }, []);

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem('memeConfig', JSON.stringify(config));
  }, [config]);

  // Load History from Supabase
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
        const { data, error } = await supabase
            .from('memes')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (error) throw error;
        if (data) {
            setHistory(data as MemeHistoryItem[]);
        }
    } catch (error) {
        console.error('Error loading history:', JSON.stringify(error, null, 2));
    } finally {
        setIsLoadingHistory(false);
    }
  };

  // Save to Supabase
  const saveToHistory = async () => {
    try {
        const title = config.bubbleText.slice(0, 20) || 'Untitled Meme';
        const { data, error } = await supabase
            .from('memes')
            .insert([
                { 
                    config: config, 
                    title: title,
                    // If we had user_id, we'd add it here
                }
            ])
            .select()
            .single();

        if (error) throw error;
        
        if (data) {
            setHistory(prev => [data as MemeHistoryItem, ...prev]);
            // alert('Saved to history!');
        }
    } catch (error) {
        console.error('Error saving history:', error);
        alert('Failed to save history to cloud.');
    }
  };

  // Delete from Supabase
  const deleteHistory = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm('Are you sure you want to delete this history item?')) return;
      
      try {
          const { error } = await supabase
            .from('memes')
            .delete()
            .eq('id', id);
            
          if (error) throw error;
          
          setHistory(prev => prev.filter(item => item.id !== id));
      } catch (error) {
          console.error('Error deleting history:', error);
          alert('Failed to delete history item.');
      }
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    
    // VIP Check for Slide animation
    if (config.animationType === 'slide' && !isVip) {
        handleUnlockVip();
        return;
    }

    setIsExporting(true);
    try {
      const url = await canvasRef.current.exportGif();
      setGeneratedGif(url);
      
      // Auto-save to history on successful export
      await saveToHistory();
      
    } catch (e) {
      console.error('Export failed', e);
      alert('Failed to generate GIF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleUnlockVip = () => {
      const answer = confirm('This feature requires VIP access. Would you like to upgrade to VIP for free? (Simulation)');
      if (answer) {
          setIsVip(true);
          localStorage.setItem('memeIsVip', 'true');
          alert('🎉 You are now a VIP user! All features unlocked.');
      }
  };

  const getDownloadFilename = () => {
      const text = config.bubbleText.slice(0, 10).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') || 'meme';
      const timestamp = new Date().getTime().toString().slice(-4);
      return `${text}_${timestamp}.gif`;
  };

  const loadHistoryItem = (item: MemeHistoryItem) => {
      setConfig(item.config);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 lg:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Preview */}
        <div className="flex flex-col gap-6 w-full lg:sticky lg:top-8 order-1 lg:order-none">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Dynamic Meme Tool
                </h1>
                {isVip && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-full border border-amber-200 shadow-sm flex items-center gap-1">
                        <span>👑</span> VIP Active
                    </span>
                )}
            </div>

            <CanvasPreview ref={canvasRef} config={config} />
            
            {generatedGif && (
                <div className="p-4 bg-white/80 backdrop-blur rounded-2xl border border-green-200 shadow-lg animate-fade-in">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">GIF Ready!</h3>
                    <img src={generatedGif} alt="Generated Meme" className="w-full rounded-lg mb-3 shadow-sm" />
                    <div className="flex flex-col gap-2">
                        <a 
                            href={generatedGif} 
                            download={getDownloadFilename()}
                            className="block w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white text-center rounded-lg font-medium transition-colors"
                        >
                            Download GIF
                        </a>
                        <p className="text-xs text-center text-gray-500 mt-1">
                            Tip: On mobile/WeChat, long-press the image to save.
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* Right Column: Controls & History */}
        <div className="flex flex-col gap-8 w-full order-2 lg:order-none pb-8 lg:pb-0">
          <div className="flex justify-center lg:justify-end w-full">
            <Controls 
                config={config} 
                onChange={setConfig} 
                onExport={handleExport}
                isExporting={isExporting}
                isVip={isVip}
                onUnlockVip={handleUnlockVip}
            />
          </div>

          {/* History Section */}
          <div className="w-full max-w-md ml-auto bg-white/60 backdrop-blur-md rounded-3xl shadow-lg border border-white/50 p-6">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">History</h2>
                  <button 
                    onClick={loadHistory}
                    className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                    title="Refresh History"
                  >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                  </button>
              </div>
              
              {isLoadingHistory ? (
                  <div className="text-center py-8 text-gray-500">Loading history...</div>
              ) : history.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                      No history yet. Create your first meme!
                  </div>
              ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {history.map((item) => (
                          <div 
                            key={item.id}
                            onClick={() => loadHistoryItem(item)}
                            className="group relative bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
                          >
                              {/* Thumbnail */}
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                                  {item.config.avatarImage ? (
                                      <img src={item.config.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : 'No IMG'}
                              </div>
                              
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-800 truncate text-sm">{item.title}</h4>
                                  <p className="text-xs text-gray-500 truncate">
                                      {new Date(item.created_at).toLocaleString()}
                                  </p>
                              </div>

                              {/* Delete Button */}
                              <button
                                onClick={(e) => deleteHistory(item.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete"
                              >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
