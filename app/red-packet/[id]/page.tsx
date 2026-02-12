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
  const title = `红包口令助力`;
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

export async function generateStaticParams() {
  return [];
}

export default function SharePage({ params }: { params: { id: string } }) {
  return null; // 临时禁用，以允许 build 成功进行静态导出测试
}
