'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';

interface Order {
  id: string;
  user_id: string;
  total_price: number | null;
  shipping_fee: number | null;
  status: string;
  created_at: string;
}

const options = ['待核价', '待支付', '采购中', '已发货'];

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'aidoudou@gmail.com';
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      const em = user?.email ?? null;
      setEmail(em);
      setIsAdmin((em || '').toLowerCase() === adminEmail.toLowerCase());
      if ((em || '').toLowerCase() === adminEmail.toLowerCase()) {
        const { data: list } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        setOrders(list || []);
      }
    })();
  }, []);

  const updateOrder = async (id: string, patch: Partial<Order>) => {
    await supabase.from('orders').update(patch).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-gray-700">仅限管理员访问</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">管理后台</h1>
      <div className="space-y-3">
        {orders.map(o => (
          <div key={o.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-800">{o.id}</div>
              <div className="text-sm text-gray-500">{new Date(o.created_at).toLocaleString()}</div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={o.status}
                onChange={(e) => updateOrder(o.id, { status: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              >
                {options.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="number"
                placeholder="运费"
                value={o.shipping_fee ?? ''}
                onChange={(e) => updateOrder(o.id, { shipping_fee: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
              <input
                type="number"
                placeholder="总价"
                value={o.total_price ?? ''}
                onChange={(e) => updateOrder(o.id, { total_price: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
              <div className="text-sm text-gray-600 break-all">用户：{o.user_id}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
