import React from 'react';
import { MemeConfig, AnimationType } from './types';

interface ControlsProps {
  config: MemeConfig;
  onChange: (newConfig: MemeConfig) => void;
  onExport: () => void;
  isExporting: boolean;
  isVip: boolean;
  onUnlockVip: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ config, onChange, onExport, isExporting, isVip, onUnlockVip }) => {
  const handleChange = <K extends keyof MemeConfig>(key: K, value: MemeConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('avatarImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 w-full max-w-md">
      <h2 className="text-xl font-semibold text-gray-800">Configuration</h2>

      {/* Avatar Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avatar</h3>
        
        <div className="flex flex-col gap-3">
          <label className="block">
            <span className="sr-only">Choose profile photo</span>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 transition-colors"
            />
          </label>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleChange('avatarShape', config.avatarShape === 'circle' ? 'square' : 'circle')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Shape: {config.avatarShape === 'circle' ? 'Circle' : 'Square'}
            </button>
            
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showAvatarBorder}
                onChange={(e) => handleChange('showAvatarBorder', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
              />
              Show Border
            </label>
          </div>
        </div>
      </div>

      {/* Bubble Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Bubble</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Main Text</label>
            <input
              type="text"
              value={config.bubbleText}
              onChange={(e) => handleChange('bubbleText', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
            />
          </div>

          <div className="flex items-center gap-2">
             <input
                type="checkbox"
                checked={config.showWidget}
                onChange={(e) => handleChange('showWidget', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
              />
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Widget Text</label>
                <input
                type="text"
                disabled={!config.showWidget}
                value={config.widgetText}
                onChange={(e) => handleChange('widgetText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 disabled:opacity-50"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.bubbleBgColor}
                onChange={(e) => handleChange('bubbleBgColor', e.target.value)}
                className="h-10 w-14 block bg-white border border-gray-300 rounded-lg p-1 cursor-pointer"
              />
              <span className="text-sm text-gray-500 font-mono">{config.bubbleBgColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Animation</h3>
            {!isVip && (
                <button 
                    onClick={onUnlockVip}
                    className="text-xs px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Unlock VIP
                </button>
            )}
        </div>
        
        <div className="space-y-2">
            <select
            value={config.animationType}
            onChange={(e) => {
                const val = e.target.value as AnimationType;
                if (val === 'slide' && !isVip) {
                    onUnlockVip();
                    return;
                }
                handleChange('animationType', val);
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
            >
            <option value="none">None (Static)</option>
            <option value="breathe">Breathe (呼吸)</option>
            <option value="wave">Wave (波浪)</option>
            <option value="bounce">Bounce (跳动)</option>
            <option value="slide" className={!isVip ? "text-gray-400" : ""}>
                Slide (滑入) {isVip ? '' : '🔒 VIP'}
            </option>
            </select>
            {!isVip && config.animationType !== 'slide' && (
                <p className="text-xs text-gray-400 pl-1">
                    Try "Slide" animation for a dynamic entry effect (VIP only).
                </p>
            )}
        </div>
      </div>

      {/* Export Button */}
      <div className="pt-4">
        <button
          onClick={onExport}
          disabled={isExporting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {isExporting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating GIF...
            </span>
          ) : 'Export GIF'}
        </button>
      </div>
    </div>
  );
};
