'use client';
import Link from 'next/link';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

const tools: Tool[] = [
  {
    id: 'meme',
    title: 'Dynamic Meme Tool',
    description: 'Create animated memes with custom text, effects, and styles. Export as GIF.',
    icon: '🎨',
    href: '/meme',
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
  },
  {
    id: 'goals',
    title: 'Goal Tracker',
    description: 'Track your personal goals, assign value scores, and monitor your progress.',
    icon: '🎯',
    href: '/goals',
    color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  },
  {
    id: 'red-packet',
    title: 'Red Packet Codes',
    description: 'Share and copy red packet codes. Limited copies per code.',
    icon: '🧧',
    href: '/red-packet',
    color: 'bg-gradient-to-br from-red-500 to-orange-600',
  },
  {
    id: 'hk-order',
    title: '香港代购服务',
    description: '提交香港代购订单，登录后可管理订单状态。',
    icon: '🛍️',
    href: '/hk-order',
    color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <header className="pt-20 pb-12 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
          AI365
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          A curated hub of AI productivity tools by Aidoudou.
        </p>
      </header>

      {/* Grid Section */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link 
              key={tool.id} 
              href={tool.href}
              className="group relative flex flex-col bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Background Decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 ${tool.color}`} />
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg ${tool.color} text-white`}>
                {tool.icon}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {tool.title}
              </h2>
              
              <p className="text-gray-500 leading-relaxed">
                {tool.description}
              </p>
              
              <div className="mt-auto pt-6 flex items-center text-sm font-medium text-gray-400 group-hover:text-blue-500 transition-colors">
                Open Tool 
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
          
          {/* Placeholder for future tools */}
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-3xl p-6 border-2 border-dashed border-gray-200 text-gray-400 min-h-[200px]">
            <span className="text-2xl mb-2">🚀</span>
            <span className="font-medium">More coming soon...</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm text-center text-sm text-gray-500">
        <div className="space-y-2">
          <p>© {new Date().getFullYear() > 2026 ? `2026-${new Date().getFullYear()}` : new Date().getFullYear()} 艾兜兜儿 版权所有 · AI365</p>
          <p>
            <button
              onClick={() => navigator.clipboard.writeText('857023577')}
              className="hover:text-blue-600 transition-colors"
            >
              AI 提效工具官方 QQ 群：857023577 (点击复制)
            </button>
          </p>
          <div className="flex justify-center gap-4 flex-wrap px-4">
            <a href="https://t.zsxq.com/7tSuP）" target="_blank" className="hover:text-blue-600 transition-colors">技术支持：艾兜兜儿</a>
            <span>|</span>
            <a href="https://t.zsxq.com/XNHXs）" target="_blank" className="hover:text-blue-600 transition-colors">DeepSeek 实战提效赚小钱</a>
            <span>|</span>
            <a href="https://t.zsxq.com/uqG2N）" target="_blank" className="hover:text-blue-600 transition-colors">AI 编程做产品</a>
            <span>|</span>
            <a href="https://mp.weixin.qq.com/s/uHh9gx2sUMOOjIhKyIbx4A" target="_blank" className="hover:text-blue-600 transition-colors">更多工具</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
