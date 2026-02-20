'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/lib/supabase';
import { APP_CONFIG } from '../../src/config/constants';

interface RedPacket {
  id: string;
  created_at: string;
  content: string;
  creator_name: string;
  creator_avatar: string;
  remaining_copies: number;
  total_copies: number;
  client_id: string;
  status: 'active' | 'completed' | 'expired';
}

interface CopyRecord {
  id: string;
  created_at: string;
  red_packet_id: string;
  copier_name: string;
  copier_avatar: string;
  copier_client_id: string;
  creator_client_id?: string | null;
  creator_name?: string | null;
  creator_avatar?: string | null;
  is_self?: boolean | null;
}

const DEFAULT_AVATAR = 'https://dkfile.net/uploads/avatars/avatar_1037_2b899c87.jpeg';
const ALT_AVATAR = 'https://profile-avatar.csdnimg.cn/22f8b0128b694047beb93057ddc0d7cc_kq8819.jpg!1';
const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/identicon/svg?seed=Felix',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Leo',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Milo',
  'https://api.dicebear.com/7.x/identicon/svg?seed=Sasha'
];

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
    <footer className="mt-12 py-10 border-t border-gray-100 bg-white/50 backdrop-blur-sm text-center space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium">
          <a href="https://mp.weixin.qq.com/s/EpghdXSl4NqOD5mwu3DWXQ" target="_blank" className="text-blue-600 hover:text-blue-700 transition-colors">技术支持：艾兜兜儿</a>
          <a href="https://t.zsxq.com/XNHXs" target="_blank" className="text-gray-600 hover:text-blue-600 transition-colors">DeepSeek 实战提效赚小钱</a>
          <a href="https://t.zsxq.com/uqG2N" target="_blank" className="text-gray-600 hover:text-blue-600 transition-colors">AI 编程做产品</a>
          <a href="https://t.zsxq.com/FhQcu" target="_blank" className="text-gray-600 hover:text-blue-600 transition-colors">更多工具</a>
        </div>
        
        <button onClick={copyQQ} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-100 transition-all border border-blue-100">
          <span>💬 AI 提效工具官方 QQ 群：857023577</span>
          <span className="text-[10px] bg-blue-200/50 px-1.5 py-0.5 rounded">点击复制</span>
        </button>
      </div>

      <div className="text-[11px] text-gray-400 space-y-1">
        <p>© {year > 2026 ? `2026-${year}` : '2026'} 艾兜兜儿 版权所有 · AI365</p>
        <p>访客 {typeof uv === 'number' ? uv : '...'} | 次数 {typeof pv === 'number' ? pv : '...'} | 你已 {typeof myVisits === 'number' ? myVisits : '...'}</p>
        <div className="flex justify-center gap-3 opacity-60">
          <a href="https://dkfile.com" target="_blank" className="hover:underline">DKFile.com</a>
          <a href="https://dkfile.xyz" target="_blank" className="hover:underline">DKFile.xyz</a>
          <a href="https://dkfile.istester.com" target="_blank" className="hover:underline">DKFile.istester.com</a>
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
  const [clientId, setClientId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'all' | 'completed' | 'expired'>('active');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 30;
  const [hasMore, setHasMore] = useState(false);
  
  // Form State
  const [newContent, setNewContent] = useState('');
  const [creatorName, setCreatorName] = useState(APP_CONFIG.DEFAULT_NICKNAME);
  const [avatarUrl, setAvatarUrl] = useState(APP_CONFIG.DEFAULT_AVATARS[0]);
  const [totalCopies, setTotalCopies] = useState(APP_CONFIG.RED_PACKET.DEFAULT_COPIES);
  const [avatarTouched, setAvatarTouched] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState({ name: false, content: false, avatar: false, copies: false });

  // Feedback Modal State
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Usage Modal State
  const [showUsage, setShowUsage] = useState(false);

  // Record Modal State
  const [showRecords, setShowRecords] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<CopyRecord[]>([]);
  const [selectedPacketId, setSelectedPacketId] = useState<string | null>(null);

  // User Page State
  const [showUserPage, setShowUserPage] = useState(false);
  const [userClientId, setUserClientId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  // XSS and Safety Helpers
  const sanitizeText = (text: string) => {
    return text.replace(/<[^>]*>?/gm, '').trim();
  };

  const sanitizeUrl = (url: string) => {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      return (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? url : '';
    } catch {
      return '';
    }
  };

  const handleRandomAvatar = () => {
    const avatars = APP_CONFIG.RANDOM_AVATARS || PRESET_AVATARS;
    const random = avatars[Math.floor(Math.random() * avatars.length)];
    setAvatarUrl(random);
    setAvatarTouched(true);
  };

  // Feedback Submission
  const submitFeedback = async () => {
    if (!feedbackContent.trim()) {
      showToast('请输入反馈内容');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const { error } = await supabase.from('feedbacks').insert([{
        content: feedbackContent.trim(),
        contact: feedbackContact.trim(),
        client_id: clientId,
        page_url: window.location.href,
        module_name: '红包口令'
      }]);

      if (error) throw error;

      showToast('感谢您的反馈！');
      setFeedbackContent('');
      setFeedbackContact('');
      setShowFeedback(false);
    } catch (err) {
      console.error(err);
      showToast('提交失败，请稍后重试');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Fetch Records
  const fetchRecords = async (packetId: string) => {
    try {
      const { data, error } = await supabase
        .from('copy_records')
        .select('*')
        .eq('red_packet_id', packetId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSelectedRecords(data || []);
      setSelectedPacketId(packetId);
      setShowRecords(true);
    } catch (err) {
      console.error(err);
      showToast('获取记录失败');
    }
  };

  // 刷新缓存提醒：如果遇到 PGRST204 错误（找不到 client_id 列），
  // 是因为数据库 Schema 变更后缓存未同步。
  // 请在 Supabase SQL Editor 中运行以下命令刷新：
  // NOTIFY pgrst, 'reload schema';

  // Fetch Data
  const fetchPackets = async (reset = false) => {
    if (reset) {
      setPage(1);
    }
    setLoading(true);
    let query = supabase
      .from('red_packets')
      .select('id,created_at,content,creator_name,creator_avatar,remaining_copies,total_copies,client_id,status')
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.or(`content.ilike.%${searchTerm}%,creator_name.ilike.%${searchTerm}%`);
    }

    if (userClientId) {
      query = query.eq('client_id', userClientId);
    } else {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
      
      if (filterStatus === 'all') {
        // 全部显示所有数据，按创建时间倒序（已在初始定义中设置）
      } else if (filterStatus === 'active') {
        // 进行中：优先展示当天的，如果当天没有展示最后一天的
        // 先检查当天是否有数据
        const { data: todayData } = await supabase
          .from('red_packets')
          .select('id')
          .gte('created_at', start)
          .lte('created_at', end)
          .gt('remaining_copies', 0)
          .eq('status', 'active')
          .limit(1);
        
        if (todayData && todayData.length > 0) {
          query = query.gte('created_at', start).lte('created_at', end).gt('remaining_copies', 0).eq('status', 'active');
        } else {
          // 获取最后一天的日期（有进行中数据的最后一天）
          const { data: lastPacket } = await supabase
            .from('red_packets')
            .select('created_at')
            .gt('remaining_copies', 0)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (lastPacket?.[0]) {
            const lastDate = new Date(lastPacket[0].created_at);
            const lStart = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 0, 0, 0, 0).toISOString();
            const lEnd = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 23, 59, 59, 999).toISOString();
            query = query.gte('created_at', lStart).lte('created_at', lEnd).gt('remaining_copies', 0).eq('status', 'active');
          } else {
            // 如果完全没有进行中的，展示空
            query = query.eq('status', 'active').gt('remaining_copies', 0);
          }
        }
      } else if (filterStatus === 'completed') {
        query = query.eq('remaining_copies', 0);
      } else if (filterStatus === 'expired') {
        // 已过期：次数不为0且不是当天的数据
        query = query.gt('remaining_copies', 0).lt('created_at', start);
      }
    }

    const from = reset ? 0 : packets.length;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching packets:', error);
      showToast('获取数据失败');
    } else {
      const list = data || [];
      if (reset) {
        setPackets(list);
      } else {
        setPackets(prev => [...prev, ...list]);
      }
      setHasMore(list.length === pageSize);
      if (!reset) setPage(p => p + 1);
    }
    setLoading(false);
  };

  const fetchRecords = async (packetId: string) => {
    setSelectedPacketId(packetId);
    const { data, error } = await supabase
      .from('copy_records')
      .select('*')
      .eq('red_packet_id', packetId)
      .order('created_at', { ascending: false });
    
    if (!error) {
      setSelectedRecords(data || []);
      setShowRecords(true);
    } else {
      showToast('获取复制记录失败');
    }
  };

  const handleUserClick = (packet: RedPacket) => {
    setUserClientId(packet.client_id);
    setUserName(packet.creator_name);
    setShowUserPage(true);
    fetchPackets(true);
  };

  const handleBackFromUser = () => {
    setShowUserPage(false);
    setUserClientId(null);
    setUserName('');
    fetchPackets(true);
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
    
    // Set Client ID
    let cid = localStorage.getItem('rp_client_id');
    if (!cid) {
      cid = Math.random().toString(36).slice(2, 12);
      localStorage.setItem('rp_client_id', cid);
    }
    setClientId(cid);

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
      fetchPackets(true);
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
    // 支持简体和繁体
    const hasYuanbao = text.includes('元宝') || text.includes('元寶');
    const hasContext = text.includes('春节') || text.includes('春-节') || text.includes('红包') || text.includes('紅包');
    // 如果包含口令特征也允许
    const hasCommand = text.includes('复制口令') || text.includes('復制口令') || text.includes('hu9190');
    return hasYuanbao || hasContext || hasCommand || text.length > 10;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newContent.trim();
    const creator = creatorName.trim();
    const copies = totalCopies;

    if (!content) {
      showToast('请输入口令或链接');
      return;
    }
    if (!creator) {
      showToast('请输入昵称');
      return;
    }
    if (copies < 1) {
      showToast('助力次数必须大于0');
      return;
    }

    if (!isValidFormat(content)) {
        showToast('请输入正确的元宝红包口令');
        setNewContent('');
        return;
    }

    if (content.length > 500) {
      showToast('内容过长，请精简');
      return;
    }

    try {
      const finalName = sanitizeText(creator);
      const finalAvatar = sanitizeUrl(avatarUrl) || APP_CONFIG.DEFAULT_AVATARS[0];
      const finalCopies = Math.min(APP_CONFIG.RED_PACKET.MAX_COPIES, Math.max(1, copies));
      
      const { error } = await supabase.from('red_packets').insert([{
        content: sanitizeText(content),
        creator_name: finalName,
        creator_avatar: finalAvatar,
        remaining_copies: finalCopies,
        total_copies: finalCopies,
        client_id: clientId,
        status: 'active' as const
      }]);

      if (error) {
        console.error('Supabase Insert Error:', error);
        if (error.code === 'PGRST204') {
          showToast('数据库缓存未同步，请在 SQL Editor 运行: NOTIFY pgrst, \'reload schema\';');
        } else {
          throw error;
        }
      } else {
        showToast('发布成功！');
        setNewContent('');
        if (filterStatus === 'completed' || filterStatus === 'expired') {
          setFilterStatus('active');
        } else {
          fetchPackets(true);
        }
      }
    } catch (error: any) {
      console.error('Error creating packet:', error);
      showToast('发布失败：' + (error.message || '网络异常'));
    }
  };

  const handleCopy = async (packet: RedPacket) => {
    if (packet.status === 'expired' && filterStatus !== 'all') {
      showToast('该口令已过期，请复制最新有效口令');
      return;
    }

    const isOwner = packet.client_id === clientId;

    try {
      if (!isOwner) {
        // 同一个人对同一个发布者只助力一次
        const { data: existed, error: checkError } = await supabase
          .from('copy_records')
          .select('id')
          .eq('copier_client_id', clientId)
          .eq('creator_client_id', packet.client_id)
          .limit(1);

        if (checkError) {
          console.error('check copy_records error', checkError);
        } else if (existed && existed.length > 0) {
          showToast('同一个用户多个口令只需选一个，你已帮TA助力，去选择其他人助力领红包吧');
          return;
        }
      }

      await navigator.clipboard.writeText(packet.content);

      const copiedKey = `copied_packets`;
      const copiedList = JSON.parse(localStorage.getItem(copiedKey) || '[]');

      if (!isOwner && copiedList.includes(packet.id)) {
        showToast('您已领取过该红包，留给其他人吧！');
        return;
      }

      const shouldDecrease = !isOwner && packet.remaining_copies > 0;
      let newCount = packet.remaining_copies;
      let newStatus: RedPacket['status'] = packet.status;

      if (shouldDecrease) {
        newCount = packet.remaining_copies - 1;
        newStatus = newCount === 0 ? 'completed' : 'active';
      }

      const finalName = creatorName || '匿名用户';
      const finalAvatar = avatarUrl || APP_CONFIG.DEFAULT_AVATARS[0];

      await supabase.from('copy_records').insert([{
        red_packet_id: packet.id,
        copier_name: finalName,
        copier_avatar: finalAvatar,
        copier_client_id: clientId,
        creator_client_id: packet.client_id,
        creator_name: packet.creator_name,
        creator_avatar: packet.creator_avatar,
        is_self: isOwner
      }]);

      if (shouldDecrease) {
        const { error } = await supabase
          .from('red_packets')
          .update({ 
            remaining_copies: newCount,
            status: newStatus
          })
          .eq('id', packet.id);

        if (error) {
          console.error('update red_packets error', error);
        } else {
          const updated = { ...packet, remaining_copies: newCount, status: newStatus };
          setPackets(prev => prev.map(p => p.id === packet.id ? updated : p));

          copiedList.push(packet.id);
          localStorage.setItem(copiedKey, JSON.stringify(copiedList));
        }
      }

      if (isOwner) {
        showToast('复制成功，自己提交的次数不减，去复制和助力其他小伙伴吧');
      } else if (shouldDecrease) {
        showToast('复制成功！');
      } else {
        showToast('该红包已被领完');
      }
    } catch (err) {
      console.error(err);
      showToast('复制失败');
    }
  };

  const handleShare = async (packet: RedPacket) => {
    if (packet.status === 'expired' && filterStatus !== 'all') {
      showToast('该口令已过期，无法助力');
      return;
    }
    const packetUrl = `${window.location.origin}${window.location.pathname}?id=${packet.id}`;
    const invite = `来自 ${packet.creator_name} 的邀请 (剩${packet.remaining_copies}个)：复制口令即可助力领取福利`;
    const shareText = `${invite}\n口令：${packet.content}\n链接：${packetUrl}`;
    const shareData = { title: '红包口令助力', text: shareText, url: packetUrl };
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
    if (packet.status === 'expired' && filterStatus !== 'all') {
      showToast('该口令已过期，无法下载分享图');
      return;
    }
    const packetUrl = `${window.location.origin}${window.location.pathname}?id=${packet.id}`;
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#FF4D4F');
    grad.addColorStop(1, '#CF1322');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Card
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, 40, 100, 640, 880, 40, true, false);

    // Tool Name
    ctx.fillStyle = '#CF1322';
    ctx.font = 'bold 44px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('艾兜兜儿红包口令工具', canvas.width / 2, 180);

    // Subtitle
    ctx.fillStyle = '#666666';
    ctx.font = '26px system-ui';
    ctx.fillText('分享你的福利，传递好运', canvas.width / 2, 230);

    // User Info (Downloader)
    await drawImage(packet.creator_avatar || APP_CONFIG.DEFAULT_AVATARS[0], 100, 280, 80, 80, true, ctx);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 30px system-ui';
    ctx.fillText(packet.creator_name, 200, 325);
    ctx.font = '22px system-ui';
    ctx.fillStyle = '#999999';
    ctx.fillText('正在邀你一起助力', 200, 360);

    // Red Packet Command Box
    ctx.fillStyle = '#FFF1F0';
    roundRect(ctx, 80, 410, 560, 220, 20, true, false);
    ctx.fillStyle = '#CF1322';
    ctx.font = 'bold 34px system-ui';
    ctx.textAlign = 'center';
    wrapText(ctx, packet.content, canvas.width / 2, 480, 500, 45);

    // Help Text
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 34px system-ui';
    ctx.fillText('一起扫码助力领元宝红包', canvas.width / 2, 700);

    // QR Code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(packetUrl)}`;
    await drawImage(qrUrl, 235, 740, 250, 250, false, ctx);

    // Footer
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('长按识别二维码 · 助力领红包', canvas.width / 2, 1030);

    const data = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = data;
    a.download = `红包助力_${packet.creator_name}.png`;
    a.click();
    showToast('助力卡片已生成');
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
  const drawImage = (src: string, x: number, y: number, w: number, h: number, circle: boolean, ctx: CanvasRenderingContext2D) => {
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

      {showRecords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="text-xl">🤝</span> 助力记录
              </h3>
              <button onClick={() => setShowRecords(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                ✕
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              {selectedRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">暂无助力记录</div>
              ) : (
                selectedRecords.map((rec) => (
                  <div 
                    key={rec.id} 
                    onClick={() => {
                      setShowRecords(false);
                      setUserClientId(rec.copier_client_id);
                      setUserName(rec.copier_name);
                      setShowUserPage(true);
                      fetchPackets(true);
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                  >
                    <img src={rec.copier_avatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-full border border-gray-100" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">{rec.copier_name}</div>
                      <div className="text-[10px] text-gray-400">{new Date(rec.created_at).toLocaleString()}</div>
                    </div>
                    <div className="text-xs text-blue-500 font-medium">查看 Ta</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-2xl mx-auto w-full px-4 py-8">
        {showUserPage && (
          <div className="mb-6 flex items-center justify-between bg-white/80 backdrop-blur p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={handleBackFromUser} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="font-bold text-gray-900">{userName} 的主页</h2>
                <p className="text-xs text-gray-400">显示该用户提交的所有口令</p>
              </div>
            </div>
            <button onClick={handleBackFromUser} className="text-sm text-blue-500 font-medium">返回列表</button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 mb-2">
            红包口令/链接分享
          </h1>
          <p className="text-gray-500 text-sm">分享你的福利，传递好运</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">你的昵称</label>
                <div className="relative">
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    onClick={(e) => (e.target as HTMLInputElement).value = ''}
                    onBlur={(e) => {
                        if (!(e.target as HTMLInputElement).value) setCreatorName(APP_CONFIG.DEFAULT_NICKNAME);
                    }}
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                    placeholder={APP_CONFIG.DEFAULT_NICKNAME}
                    required
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

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1 ml-1 flex justify-between">
                    <span>助力次数</span>
                    <span className="text-xs text-gray-400 font-normal">高效领红包，可填助力次数</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={totalCopies}
                      onChange={(e) => setTotalCopies(parseInt(e.target.value) || 0)}
                      onClick={(e) => (e.target as HTMLInputElement).value = ''}
                      onBlur={(e) => {
                        const val = parseInt((e.target as HTMLInputElement).value);
                        if (isNaN(val) || val < 1) setTotalCopies(3);
                      }}
                      className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                    />
                    {totalCopies !== 3 && (
                      <button
                        type="button"
                        onClick={() => setTotalCopies(3)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">头像链接（可选）</label>
              <div className="relative">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => { setAvatarUrl(e.target.value); setAvatarTouched(true); }}
                  onClick={(e) => (e.target as HTMLInputElement).value = ''}
                  onFocus={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text.startsWith('http')) {
                        setAvatarUrl(text);
                        setAvatarTouched(true);
                        showToast('已自动粘贴头像链接');
                      }
                    } catch {}
                  }}
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                  placeholder="粘贴URL或点击下方头像"
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
              
              <div className="mt-3">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                  <button
                    type="button"
                    onClick={handleRandomAvatar}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors border border-gray-200"
                    title="随机生成"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  {APP_CONFIG.DEFAULT_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setAvatarUrl(url); setAvatarTouched(true); }}
                      className="flex-shrink-0 w-10 h-10 rounded-full border border-gray-200 overflow-hidden hover:ring-2 hover:ring-offset-1 hover:ring-red-500 transition-all"
                    >
                      <img src={url} alt={`avatar-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">口令或链接</label>
              <div className="relative">
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  onClick={(e) => (e.target as HTMLInputElement).value = ''}
                  onFocus={async () => {
                    try {
                      const txt = await navigator.clipboard.readText();
                      if (!newContent && isValidFormat(txt)) {
                        setNewContent(txt);
                        showToast('已自动粘贴剪贴板内容');
                      }
                    } catch {}
                  }}
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all resize-none h-32"
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
            packets.map((packet) => {
              const now = new Date();
              const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
              const isExpired = packet.remaining_copies > 0 && new Date(packet.created_at) < todayStart;
              const isCompleted = packet.remaining_copies === 0;
              const isDisabled = isExpired || isCompleted;

              return (
                <div 
                  key={packet.id}
                  id={`packet_${packet.id}`}
                  className={`group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md ${(isExpired || isCompleted) ? 'opacity-60 grayscale-[0.5]' : ''} ${isExpired ? 'opacity-50 grayscale' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <img 
                      src={packet.creator_avatar || DEFAULT_AVATAR} 
                      alt="avatar" 
                      onClick={() => handleUserClick(packet)}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
                      onError={(e) => {
                          (e.target as HTMLImageElement).src = ALT_AVATAR;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="cursor-pointer" onClick={() => handleUserClick(packet)}>
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-red-500 transition-colors">{packet.creator_name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(packet.created_at).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                            isExpired 
                              ? 'bg-gray-100 text-gray-400'
                              : packet.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : packet.status === 'expired'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isExpired 
                              ? '已过期'
                              : packet.status === 'active' 
                                ? `剩余 ${packet.remaining_copies} 次`
                                : packet.status === 'expired'
                                  ? `已过期 · 余 ${packet.remaining_copies} 次`
                                  : '已完成'}
                          </div>
                          {packet.client_id === clientId && (
                            <button 
                              onClick={() => fetchRecords(packet.id)}
                              className="text-[10px] text-blue-500 hover:underline"
                            >
                              查看助力记录
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 bg-gray-50 rounded-xl p-3 text-gray-700 text-sm break-all font-mono leading-relaxed relative group-hover:bg-gray-100 transition-colors">
                        {packet.content}
                      </div>

                      <div className="mt-4 flex justify-around gap-2 pt-4 border-t border-gray-50">
                        <button 
                          onClick={() => {
                            if (isDisabled) {
                              showToast(`该口令${isExpired ? '已过期' : '已领完'}，请使用今天最新的口令吧`);
                              return;
                            }
                            handleCopy(packet);
                          }}
                          className={`action-btn flex flex-col items-center gap-1 group/btn ${isDisabled ? 'cursor-not-allowed' : ''}`}
                        >
                          <div className={`w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full transition-all shadow-sm ${isDisabled ? 'grayscale opacity-50' : 'group-hover/btn:bg-blue-600 group-hover/btn:text-white'}`}>
                            <span className="text-lg">📋</span>
                          </div>
                          <span className="action-text text-[10px] text-gray-500 font-medium">复制口令</span>
                        </button>

                        <button 
                          onClick={() => {
                            if (isDisabled) {
                              showToast(`该口令${isExpired ? '已过期' : '已领完'}，请使用今天最新的口令吧`);
                              return;
                            }
                            handleShare(packet);
                          }}
                          className={`action-btn flex flex-col items-center gap-1 group/btn ${isDisabled ? 'cursor-not-allowed' : ''}`}
                        >
                          <div className={`w-10 h-10 flex items-center justify-center bg-pink-50 text-pink-600 rounded-full transition-all shadow-sm ${isDisabled ? 'grayscale opacity-50' : 'group-hover/btn:bg-pink-600 group-hover/btn:text-white'}`}>
                            <span className="text-lg">🔗</span>
                          </div>
                          <span className="action-text text-[10px] text-gray-500 font-medium">助力分享</span>
                        </button>

                        <button 
                          onClick={() => generateShareImage(packet)}
                          className="action-btn flex flex-col items-center gap-1 group/btn"
                        >
                          <div className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-600 rounded-full group-hover/btn:bg-green-600 group-hover/btn:text-white transition-all shadow-sm">
                            <span className="text-lg">⬇️</span>
                          </div>
                          <span className="action-text text-[10px] text-gray-500 font-medium">下载卡片</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {!loading && hasMore && (
        <div className="text-center my-4">
          <button
            onClick={() => fetchPackets(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-black transition"
          >
            加载更多
          </button>
        </div>
      )}

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 w-10 h-10 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center active:scale-95 z-40"
          aria-label="返回顶部"
          title="返回顶部"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5l-7 7m7-7l7 7M12 5v14" />
          </svg>
        </button>
      )}

      {/* Floating Actions */}
      <div className="fixed right-6 bottom-36 flex flex-col gap-3 z-40">
        <button 
          onClick={() => setShowUsage(true)}
          className="w-10 h-10 bg-white border border-gray-100 rounded-full shadow-lg flex items-center justify-center text-lg hover:bg-gray-50 active:scale-95 transition-all"
          title="使用说明"
        >
          📖
        </button>
        <button 
          onClick={() => setShowFeedback(true)}
          className="w-10 h-10 bg-white border border-gray-100 rounded-full shadow-lg flex items-center justify-center text-lg hover:bg-gray-50 active:scale-95 transition-all"
          title="提交反馈"
        >
          💬
        </button>
      </div>

      {/* Usage Modal */}
      {showUsage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowUsage(false)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">使用说明 📖</h3>
              <button onClick={() => setShowUsage(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="font-bold text-orange-800 mb-2">如何发布？</p>
                <p>填写昵称、设置助力次数（默认3次），粘贴你的红包口令或链接点击“发布分享”即可。</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="font-bold text-blue-800 mb-2">如何互助？</p>
                <p>点击他人卡片的“复制口令”，去对应的 App 使用。复制成功后，对方的助力次数会减1。</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                <p className="font-bold text-green-800 mb-2">温馨提示</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>仅展示当天的口令，过期自动失效。</li>
                  <li>自己点击自己发布的口令不扣减次数。</li>
                  <li>点击用户头像可以进入该用户的主页查看更多。</li>
                </ul>
              </div>
            </div>
            <button onClick={() => setShowUsage(false)} className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-medium">我知道了</button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFeedback(false)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">问题反馈 💬</h3>
              <button onClick={() => setShowFeedback(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">您的反馈是我们进步的动力，请详细描述您遇到的问题。</p>
              <textarea 
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-gray-900 h-32 focus:ring-2 focus:ring-blue-500/20 resize-none" 
                placeholder="请在此输入您的反馈内容..."
                autoFocus
              ></textarea>
              <input 
                type="text"
                value={feedbackContact}
                onChange={(e) => setFeedbackContact(e.target.value)}
                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20" 
                placeholder="联系方式（QQ/微信/邮箱，选填）"
              />
              <button 
                onClick={submitFeedback}
                disabled={isSubmittingFeedback}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isSubmittingFeedback ? '提交中...' : '提交反馈'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Records Modal */}
      {showRecords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRecords(false)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
              <h3 className="text-xl font-bold text-gray-900">助力记录</h3>
              <button onClick={() => setShowRecords(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {selectedRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-400">暂无助力记录</div>
              ) : (
                selectedRecords.map((rec) => (
                  <div 
                    key={rec.id}
                    onClick={() => {
                      setShowRecords(false);
                      setUserClientId(rec.copier_client_id);
                      setUserName(rec.copier_name);
                      setShowUserPage(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                  >
                    <img src={rec.copier_avatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-full border border-gray-100 object-cover" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">
                        {rec.copier_name}
                        {rec.copier_client_id === clientId && (
                          <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded bg-blue-50 text-blue-600 align-middle">
                            我
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400">{new Date(rec.created_at).toLocaleString()}</div>
                    </div>
                    <div className="text-xs text-blue-500 font-medium">查看 Ta</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Footer pv={pv} uv={uv} myVisits={myVisits} />
    </div>
  );
}
