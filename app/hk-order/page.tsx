'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../src/lib/supabase';
import MaskedText from '../../src/components/hk-proxy/MaskedText';

interface Order {
  id: string;
  user_id: string;
  total_price: number | null;
  shipping_fee: number | null;
  status: string;
  created_at: string;
}

export default function HkOrderHome() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setEmail(user?.email ?? null);
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: list } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(list || []);
      setLoading(false);
    })();
  }, []);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-gray-700 mb-4">请先登录后使用香港代购服务</div>
          <Link href="/login" className="block w-full text-center py-2 rounded-lg bg-emerald-600 text-white">
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">香港代购服务</h1>
        <Link href="/hk-order/new" className="px-3 py-2 rounded-lg bg-blue-600 text-white">
          新建订单
        </Link>
      </div>
      {loading ? (
        <div className="text-gray-500">加载中…</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-500">暂无订单</div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-800">订单 {o.id.slice(0, 8)}</div>
                <div className="text-sm text-gray-500">{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div className="mt-2 text-sm text-gray-700">状态：{o.status}</div>
              <div className="mt-1 text-sm text-gray-700">运费：{o.shipping_fee ?? '-'}</div>
              <div className="mt-1 text-sm text-gray-700">总价：{o.total_price ?? '-'}</div>
              <div className="mt-2 text-sm text-gray-700">
                联系手机号：<MaskedText value={'未填写'} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
