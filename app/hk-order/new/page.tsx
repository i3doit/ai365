'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';
import { z } from 'zod';

const ItemSchema = z.object({
  product_name: z.string().min(1),
  quantity: z.number().int().min(1),
  img_url: z.string().url().optional().or(z.string().length(0))
});

function cleanText(s: string) {
  return s.replace(/<[^>]+>/g, '').trim();
}

export default function NewOrderPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [items, setItems] = useState<{ product_name: string; quantity: number; img_url: string }[]>([
    { product_name: '', quantity: 1, img_url: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setEmail(user?.email ?? null);
    })();
  }, []);

  const addItem = () => {
    setItems(prev => [...prev, { product_name: '', quantity: 1, img_url: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, key: 'product_name' | 'quantity' | 'img_url', value: string) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, [key]: key === 'quantity' ? Number(value || 1) : value } : it));
  };

  const submit = async () => {
    if (!email) return;
    setSubmitting(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) throw new Error('no user');
      const safeItems = items.map(it => ({
        product_name: cleanText(it.product_name),
        quantity: it.quantity,
        img_url: it.img_url.trim()
      }));
      safeItems.forEach(it => ItemSchema.parse({ ...it, img_url: it.img_url }));
      const { data: order } = await supabase
        .from('orders')
        .insert([{ user_id: user.id, status: '待核价', total_price: null, shipping_fee: null }])
        .select('*')
        .limit(1)
        .maybeSingle();
      if (!order) throw new Error('order failed');
      const rows = safeItems.map(it => ({
        order_id: order.id,
        product_name: it.product_name,
        quantity: it.quantity,
        img_url: it.img_url.length ? it.img_url : null,
        price_at_time: null
      }));
      const { error: itemsErr } = await supabase.from('order_items').insert(rows);
      if (itemsErr) throw itemsErr;
      await navigator.clipboard.writeText('857023577');
      alert('提交成功，已复制店主微信号，请联系发送截图');
      setItems([{ product_name: '', quantity: 1, img_url: '' }]);
    } catch (e) {
      alert('提交失败，请检查输入');
    } finally {
      setSubmitting(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-gray-700 mb-4">请先登录后再下单</div>
          <a href="/login" className="block w-full text-center py-2 rounded-lg bg-emerald-600 text-white">去登录</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">新建订单</h1>
      <div className="space-y-4">
        {items.map((it, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={it.product_name}
                onChange={(e) => updateItem(i, 'product_name', e.target.value)}
                placeholder="商品名称"
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
              <input
                type="number"
                min={1}
                value={it.quantity}
                onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                placeholder="数量"
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
              <input
                type="text"
                value={it.img_url}
                onChange={(e) => updateItem(i, 'img_url', e.target.value)}
                placeholder="图片链接"
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-800"
              >
                删除该商品
              </button>
            </div>
          </div>
        ))}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={addItem}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800"
          >
            增加商品
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="px-3 py-2 rounded-lg bg-blue-600 text-white"
          >
            提交订单
          </button>
        </div>
      </div>
    </div>
  );
}
