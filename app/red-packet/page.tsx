'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/lib/supabase';

interface RedPacket {
  id: string;
  created_at: string;
  content: string;
  creator_name: string;
  creator_avatar: string;
  remaining_copies: number;
  status: 'active' | 'completed';
}

const DEFAULT_AVATAR = 'https://dkfile.net/uploads/avatars/avatar_1037_2b899c87.jpeg';
const ALT_AVATAR = 'https://profile-avatar.csdnimg.cn/22f8b0128b694047beb93057ddc0d7cc_kq8819.jpg!1';

const Footer = ({ pv, uv, myVisits }: { pv?: number | null, uv?: number | null, myVisits?: number | null }) => {
  const [year, setYear] = useState(2026);
  
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYear(currentYear);
  }, []);

  const copyQQ = () => {
    navigator.clipboard.writeText('857023577');
    alert('QQ号已复制：857023577');
  };

  return (
    <footer className="mt-12 py-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm text-center text-sm text-gray-500">
      <div className="space-y-2">
        <p>© {year > 2026 ? `2026-${year}` : year} 艾兜兜儿 版权所有 · AI365</p>
        <p className="text-xs text-gray-400">访客 {typeof uv === 'number' ? uv : '...'} | 次数 {typeof pv === 'number' ? pv : '...'} | 你已 {typeof myVisits === 'number' ? myVisits : '...'}</p>
        <p>
          <button onClick={copyQQ} className="hover:text-blue-600 transition-colors">
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
  );
};

// Toast Component
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in-down">
      <div className="bg-black/75 text-white px-6 py-3 rounded-2xl shadow-lg backdrop-blur-md text-sm font-medium">
        {message}
      </div>
    </div>
  );
};

export default function RedPacketTool() {
  const [packets, setPackets] = useState<RedPacket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [pv, setPv] = useState<number | null>(null);
  const [uv, setUv] = useState<number | null>(null);
  const [myVisits, setMyVisits] = useState<number | null>(null);
  const [myIp, setMyIp] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'expired'>('all');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);
  
  // Form State
  const [newContent, setNewContent] = useState('');
  const [creatorName, setCreatorName] = useState('艾兜兜儿');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarTouched, setAvatarTouched] = useState(false);

  // Fetch Data
  const fetchPackets = async () => {
    setLoading(true);
    let query = supabase
      .from('red_packets')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.or(`content.ilike.%${searchTerm}%,creator_name.ilike.%${searchTerm}%`);
    }

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
    if (filterStatus === 'all') {
      query = query.gte('created_at', start).lte('created_at', end);
    } else if (filterStatus === 'active') {
      query = query.eq('status', 'active').gte('created_at', start).lte('created_at', end);
    } else if (filterStatus === 'completed') {
      query = query.eq('status', 'completed').gte('created_at', start).lte('created_at', end);
    } else if (filterStatus === 'expired') {
      query = query.or(`status.eq.expired,created_at.lt.${start},created_at.gt.${end}`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching packets:', error);
      showToast('获取数据失败');
    } else {
      setPackets(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPackets();
    const initTracking = async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2000);
        let ip = 'unknown';
        try {
          const ipRes = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
          const ipJson = await ipRes.json();
          ip = ipJson?.ip || 'unknown';
        } catch {}
        clearTimeout(timer);
        setMyIp(ip);
        await supabase.from('page_views').insert([{
          page_path: '/red-packet',
          ip_address: ip
        }]);
        const { data } = await supabase
          .from('page_views')
          .select('ip_address')
          .eq('page_path', '/red-packet');
        const list = data || [];
        const total = list.length;
        const uniq = new Set(list.map((d: any) => d.ip_address)).size;
        const mine = list.filter((d: any) => d.ip_address === ip).length;
        setPv(total);
        setUv(uniq);
        setMyVisits(mine);
      } catch (e) {
        console.error('Tracking failed', e);
      }
    };
    initTracking();
    (async () => {
      try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
        await supabase
          .from('red_packets')
          .update({ status: 'expired' })
          .or(`created_at.lt.${start},created_at.gt.${end}`)
          .eq('status', 'active');
      } catch {}
    })();

    // Daily purge: delete completed older than 7 days, run at most once per day
    const lastPurge = localStorage.getItem('rp_last_purge');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (!lastPurge || now - Number(lastPurge) > oneDay) {
      const sevenDaysAgo = new Date(now - 7 * oneDay).toISOString();
      (async () => {
        try {
          await supabase
            .from('red_packets')
            .delete()
            .eq('status', 'completed')
            .lt('created_at', sevenDaysAgo);
          localStorage.setItem('rp_last_purge', String(now));
          fetchPackets();
        } catch {}
      })();
    }

    // Deep link to a specific packet by id
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) setTargetId(id);
    } catch {}
  }, []);

  useEffect(() => {
    if (!avatarTouched) {
      const seed = encodeURIComponent(creatorName || 'guest');
      setAvatarUrl(`https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`);
    }
  }, [creatorName, avatarTouched]);

  useEffect(() => {
    try {
      localStorage.setItem('rp_creator_name', creatorName);
      localStorage.setItem('rp_avatar_url', avatarUrl);
      const keys = Object.keys(localStorage);
      let size = 0;
      for (const k of keys) {
        const v = localStorage.getItem(k) || '';
        size += k.length + v.length;
      }
      if (size > 2 * 1024 * 1024) {
        setToastMsg('本地数据较多，建议清理部分内容');
      }
    } catch {}
  }, [creatorName, avatarUrl]);

  useEffect(() => {
    try {
      const savedName = localStorage.getItem('rp_creator_name');
      const savedAvatar = localStorage.getItem('rp_avatar_url');
      if (savedName) setCreatorName(savedName);
      if (savedAvatar) { setAvatarUrl(savedAvatar); setAvatarTouched(true); }
    } catch {}
  }, []);

  // Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPackets();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  const isValidFormat = (content: string) => {
    const text = content.toLowerCase();
    const hasYuanbao = text.includes('元宝');
    const hasContext = text.includes('春节') || text.includes('红包');
    return hasYuanbao && hasContext;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      showToast('请输入口令或链接');
      return;
    }

    // Format Validation: Must contain specific phrase or match flexible patterns
    // We check for "元宝" AND ("春节" OR "红包") to cover all variations
    // This is more flexible than exact matching for every variation
    // Variations provided:
    // 1. 春节到，复制口令打开元宝App，红包抢起来！
    // 2. 简单三步：复制、打开元宝App、春节抢红包！
    // 3. 元宝送福！复制口令打开App，春节抢红包！
    // 4. 春节红包在元宝App，复制口令打开抢！
    // 5. 元宝App春节专场：复制后打开App抢红包！
    // 6. 春节倒计时！复制口令，打开元宝App抢红包！
    // 7. 复制这个春节密令，打开元宝App抢红包！
    // 8. 复制这段文字，春节在元宝App抢红包超简单！
    // 9. 复制！春节打开元宝App，抢红包好运来！
    
    if (!isValidFormat(newContent)) {
        showToast('请输入正确的元宝红包口令');
        // Clear input to "close" or reset
        setNewContent('');
        return;
    }

    // Safety check (basic XSS prevention is handled by React, but length check here)
    if (newContent.length > 500) {
      showToast('内容过长，请精简');
      return;
    }

    try {
      const { error } = await supabase.from('red_packets').insert([{
        content: sanitizeText(newContent.trim()),
        creator_name: sanitizeText(creatorName.trim() || '艾兜兜儿'),
        creator_avatar: sanitizeUrl(avatarUrl || DEFAULT_AVATAR),
        remaining_copies: 3,
        status: 'active'
      }]);

      if (error) throw error;

      showToast('发布成功！');
      setNewContent('');
      fetchPackets();
    } catch (error) {
      console.error('Error creating packet:', error);
      showToast('发布失败，请重试');
    }
  };

  const handleCopy = async (packet: RedPacket) => {
    try {
      await navigator.clipboard.writeText(packet.content);
      showToast('复制成功！');

      // Update count if not owner (Simulated: Assume current user is NOT owner for demo logic, 
      // or we track copied IDs in localStorage to prevent double count decrement from same user)
      const copiedKey = `copied_packets`;
      const copiedList = JSON.parse(localStorage.getItem(copiedKey) || '[]');
      
      if (copiedList.includes(packet.id)) {
        // Already copied by this user, show toast but don't decrement
        // But since we already copied to clipboard above, maybe we should warn BEFORE copying?
        // User request: "已添加的红包口令，被复制后若有剩余数量是不同的人可以继续复制，同一个人不允许复制多次。"
        // Interpretation: Same person cannot "claim" (decrement count) twice. 
        // But usually "copy" implies claiming.
        // Let's allow copy (clipboard) but show message "You already claimed this".
        showToast('您已领取过该红包，留给其他人吧！');
        return;
      }
      
      if (packet.remaining_copies > 0) {
        const newCount = packet.remaining_copies - 1;
        const newStatus = newCount === 0 ? 'completed' : 'active';

        const { error } = await supabase
          .from('red_packets')
          .update({ 
            remaining_copies: newCount,
            status: newStatus
          })
          .eq('id', packet.id);

        if (!error) {
          copiedList.push(packet.id);
          localStorage.setItem(copiedKey, JSON.stringify(copiedList));
          
          // Update local state to reflect change immediately
          setPackets(prev => prev.map(p => 
            p.id === packet.id ? { ...p, remaining_copies: newCount, status: newStatus } : p
          ));
        }
      }
    } catch (err) {
      showToast('复制失败');
    }
  };

  const handleShare = async (packet: RedPacket) => {
    const packetUrl = `${window.location.origin}/red-packet?id=${packet.id}`;
    const shareText = `找朋友助力：${packet.creator_name}\n口令：${packet.content}\n链接：${packetUrl}`;
    const shareData = { title: '找朋友助力', text: shareText, url: packetUrl };
    try {
      if ((navigator as any).share) {
        await (navigator as any).share(shareData);
        showToast('已调起分享');
      } else {
        await navigator.clipboard.writeText(`${shareText}`);
        showToast('已复制助力文案');
      }
    } catch {
      await navigator.clipboard.writeText(`${shareText}`);
      showToast('已复制助力文案');
    }
  };

  const generateShareImage = async (packet: RedPacket) => {
    const packetUrl = `${window.location.origin}/red-packet?id=${packet.id}`;
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#f5f7ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Card
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    roundRect(ctx, 40, 40, 640, 820, 24, true, true);
    // Title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 36px system-ui, -apple-system, Segoe UI, PingFang SC, Microsoft YaHei';
    ctx.fillText('找朋友助力', 60, 100);
    // Avatar
    await drawImage(ctx, packet.creator_avatar || DEFAULT_AVATAR, 60, 130, 72, 72, true);
    ctx.font = 'bold 24px system-ui, -apple-system, PingFang SC, Microsoft YaHei';
    ctx.fillText(packet.creator_name, 150, 170);
    // Content
    ctx.font = '20px system-ui, -apple-system, PingFang SC, Microsoft YaHei';
    ctx.fillStyle = '#374151';
    wrapText(ctx, packet.content, 60, 230, 600, 28);
    // QR
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(packetUrl)}`;
    await drawImage(ctx, qrUrl, 250, 520, 220, 220, false);
    ctx.font = '16px system-ui, -apple-system, PingFang SC, Microsoft YaHei';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('扫码打开页面，直达该口令', 240, 770);
    // Download
    const data = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = data;
    a.download = `助力_${packet.creator_name}.png`;
    a.click();
    showToast('图片已生成');
  };

  const sanitizeText = (s: string) => s.replace(/[<>]/g, '').slice(0, 500);
  const sanitizeUrl = (u: string) => {
    try {
      const url = new URL(u);
      if (url.protocol === 'http:' || url.protocol === 'https:') return u;
      return '';
    } catch {
      return '';
    }
  };

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: boolean, stroke: boolean) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  };
  const drawImage = (ctx: CanvasRenderingContext2D, src: string, x: number, y: number, w: number, h: number, circle: boolean) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (circle) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, x, y, w, h);
          ctx.restore();
        } else {
          ctx.drawImage(img, x, y, w, h);
        }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = src;
    });
  };
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(/\s+/);
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  };
  const requestInvite = async () => {
    await navigator.clipboard.writeText('857023577');
    showToast('已复制微信号，请加好友并备注：元宝邀请码');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 flex flex-col">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

      <main className="flex-grow max-w-2xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 mb-2">
            红包口令/链接分享
          </h1>
          <p className="text-gray-500 text-sm">分享你的福利，传递好运 (每条仅限3次有效复制)</p>
          <div className="mt-4">
            <button
              onClick={requestInvite}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-95 transition"
            >
              点我领取最新元宝邀请码
            </button>
          </div>
        </div>

        {/* Create Card */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-100/50 border border-white/50 backdrop-blur-xl p-6 mb-8 transition-transform hover:scale-[1.01] duration-300">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">你的昵称</label>
              <div className="relative">
                 <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  onFocus={() => { if (creatorName === '艾兜兜儿') setCreatorName(''); }}
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                  placeholder="艾兜兜儿"
                />
                 {creatorName && (
                  <button
                    type="button"
                    onClick={() => setCreatorName('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">头像链接（可选）</label>
              <div className="relative">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => { setAvatarUrl(e.target.value); setAvatarTouched(true); }}
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                  placeholder="例如：https://api.dicebear.com/7.x/identicon/svg?seed=你的昵称"
                />
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => { setAvatarUrl(''); setAvatarTouched(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={avatarUrl || DEFAULT_AVATAR}
                  alt="avatar-preview"
                  className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = ALT_AVATAR; }}
                />
                <button
                  type="button"
                  onClick={() => { setAvatarUrl(`https://api.dicebear.com/7.x/identicon/svg?seed=${Date.now()}`); setAvatarTouched(true); }}
                  className="text-xs px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  随机头像
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">口令或链接</label>
              <div className="relative">
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(sanitizeText(e.target.value))}
                  onFocus={async () => {
                    try {
                      const txt = await navigator.clipboard.readText();
                      if (!newContent && isValidFormat(txt)) {
                        setNewContent(txt);
                        showToast('已自动粘贴剪贴板内容');
                      }
                    } catch {}
                  }}
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all resize-none h-24"
                  placeholder="粘贴你的红包口令或链接..."
                />
                {newContent && (
                  <button
                    type="button"
                    onClick={() => setNewContent('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-[0.98] transition-all duration-200"
            >
              发布分享
            </button>
          </form>
        </div>

        <div className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-gray-100 -mx-4 px-4 py-3 mb-6">
          <div className="relative mb-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(sanitizeText(e.target.value))}
              className="w-full bg-white/80 border border-gray-200 rounded-2xl px-5 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              placeholder="搜索昵称或口令..."
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-xl p-1">
              {(['all','active','completed','expired'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 text-xs rounded-lg ${filterStatus===s ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-white'}`}
                >
                  {s==='all'?'全部':s==='active'?'进行中':s==='completed'?'已完成':'已过期'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setLang(lang==='zh'?'en':'zh')}
              className="px-3 py-1.5 rounded-lg bg-white/70 border border-gray-200 text-gray-700 text-xs hover:bg-white transition"
            >
              {lang==='zh'?'中文':'English'}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-400">加载中...</div>
          ) : packets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
              暂无数据，快来发布第一条吧！
            </div>
          ) : (
            packets.map((packet) => (
              <div 
                key={packet.id}
                id={`packet_${packet.id}`}
                className={`group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md ${packet.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <img 
                    src={packet.creator_avatar || DEFAULT_AVATAR} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = ALT_AVATAR;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{packet.creator_name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(packet.created_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        packet.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {packet.status === 'active' ? `剩余 ${packet.remaining_copies} 次` : '已抢完'}
                      </div>
                    </div>
                    
                    <div className="mt-3 bg-gray-50 rounded-xl p-3 text-gray-700 text-sm break-all font-mono leading-relaxed relative group-hover:bg-gray-100 transition-colors">
                      {packet.content}
                    </div>

                    <div className="mt-3 flex justify-end">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleCopy(packet)}
                          disabled={packet.status === 'completed'}
                          title="复制"
                          aria-label="复制"
                          className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${
                            packet.status === 'active'
                              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10" />
                            </svg>
                            <span className="mt-1 text-[10px] text-gray-400">复制</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleShare(packet)}
                          title="助力"
                          aria-label="助力"
                          className="w-12 h-12 flex items-center justify-center rounded-lg transition-all bg-pink-50 text-pink-600 hover:bg-pink-100 active:scale-95"
                        >
                          <div className="flex flex-col items-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v5a2 2 0 002 2h12a2 2 0 002-2v-5" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8l4-4 4 4M12 4v10" />
                            </svg>
                            <span className="mt-1 text-[10px] text-gray-400">助力</span>
                          </div>
                        </button>
                        <button
                          onClick={() => generateShareImage(packet)}
                          title="下载"
                          aria-label="下载"
                          className="w-12 h-12 flex items-center justify-center rounded-lg transition-all bg-green-50 text-green-600 hover:bg-green-100 active:scale-95"
                        >
                          <div className="flex flex-col items-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v10m0 0l-4-4m4 4l4-4" />
                            </svg>
                            <span className="mt-1 text-[10px] text-gray-400">下载</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center active:scale-95"
          aria-label="返回顶部"
          title="返回顶部"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5l-7 7m7-7l7 7M12 5v14" />
          </svg>
        </button>
      )}

      <Footer pv={pv} uv={uv} myVisits={myVisits} />
    </div>
  );
}
