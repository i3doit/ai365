'use client';
import { supabase } from '../../src/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? null);
    })();
  }, []);

  const signInGoogle = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/red-packet` }
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">登录</h1>
        {userEmail ? (
          <div className="space-y-4">
            <div className="text-gray-600">已登录：{userEmail}</div>
            <button
              onClick={() => router.push('/red-packet')}
              className="w-full py-2 rounded-lg bg-blue-600 text-white"
            >
              返回红包口令主页
            </button>
            <button
              onClick={signOut}
              className="w-full py-2 rounded-lg bg-gray-100 text-gray-800"
            >
              退出登录
            </button>
          </div>
        ) : (
          <button
            onClick={signInGoogle}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-emerald-600 text-white"
          >
            使用 Google 登录
          </button>
        )}
      </div>
    </div>
  );
}
