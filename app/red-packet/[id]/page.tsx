import type { Metadata } from 'next';
import { supabase } from '../../../src/lib/supabase';
import Image from 'next/image';

const DEFAULT_AVATAR = 'https://dkfile.net/uploads/avatars/avatar_1037_2b899c87.jpeg';

async function getPacket(id: string) {
  const { data } = await supabase
    .from('red_packets')
    .select('*')
    .eq('id', id)
    .limit(1)
    .maybeSingle();
  return data || null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const packet = await getPacket(params.id);
  const name = packet?.creator_name || '好友';
  const content = packet?.content || '口令待查看';
  const title = `AI365 · 找朋友助力`;
  const description = `来自 ${name} 的邀请：${content.slice(0, 60)}…（复制口令即可助力，3次有效）`;
  const image = packet?.creator_avatar || DEFAULT_AVATAR;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://worthlist.vercel.app'}/red-packet/${params.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const packet = await getPacket(params.id);
  if (!packet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900">链接已失效或不存在</h1>
          <p className="mt-2 text-gray-500">请返回列表重新分享</p>
        </div>
      </div>
    );
  }

  const packetUrl = `/red-packet?id=${packet.id}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <Image
            src={packet.creator_avatar || DEFAULT_AVATAR}
            alt="avatar"
            width={60}
            height={60}
            className="rounded-full border border-gray-200 object-cover"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{packet.creator_name}</h2>
            <p className="text-sm text-gray-500">邀请你助力领取福利，复制口令即可</p>
          </div>
        </div>
        <div className="mt-4 bg-gray-50 rounded-xl p-3 text-gray-700 text-sm break-all font-mono leading-relaxed">
          {packet.content}
        </div>
        <div className="mt-6 text-right">
          <a
            href={packetUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
          >
            打开页面复制口令
          </a>
        </div>
      </div>
    </div>
  );
}
