'use client';
import { supabase } from '../../src/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import Link from 'next/link';

const emailSchema = z.string().email();
const phoneSchema = z.string().min(6);
const pwSchema = z.string().min(6);

function clean(s: string) {
  return s.replace(/<[^>]+>/g, '').trim();
}

export default function RegisterPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState('/hk-order');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<'idle' | 'phone_code'>('idle');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [mode, setMode] = useState<'email' | 'phone'>('email');

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next');
      if (next) setNextPath(next);
    } catch {}
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.push(nextPath);
      }
    })();
  }, [router, nextPath]);

  const registerWithEmail = async () => {
    setMsg('');
    const vEmail = clean(email);
    const vPw = clean(password);
    const vConfirmPw = clean(confirmPassword);

    if (vPw !== vConfirmPw) {
      setMsg('两次输入的密码不一致');
      return;
    }

    try {
      emailSchema.parse(vEmail);
      pwSchema.parse(vPw);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: vEmail,
        password: vPw
      });
      
      if (error) throw error;
      if (data.user) {
        setMsg('注册成功！正在跳转...');
        setTimeout(() => router.push(nextPath), 1500);
      } else {
        setMsg('注册失败，请稍后重试');
      }
    } catch (error: any) {
      setMsg(error.message || '注册失败，请检查输入');
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneCode = async () => {
    setMsg('');
    const v = clean(phone);
    try {
      phoneSchema.parse(v);
      setLoading(true);
      await supabase.auth.signInWithOtp({
        phone: v,
        options: {
          shouldCreateUser: true
        }
      });
      setPhase('phone_code');
      setMsg('验证码已发送，请输入验证码完成注册');
    } catch {
      setMsg('手机号格式不正确或验证码发送失败');
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneAndRegister = async () => {
    setMsg('');
    const v = clean(phone);
    const c = clean(code);
    if (!c) {
      setMsg('请输入验证码');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        phone: v,
        token: c,
        type: 'sms'
      });
      if (error) throw error;
      if (data.user) {
        setMsg('注册成功！正在跳转...');
        setTimeout(() => router.push(nextPath), 1500);
      } else {
        setMsg('验证码验证失败');
      }
    } catch {
      setMsg('验证码验证失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">注册新账户</h1>
          <p className="text-sm text-gray-600 mt-1">创建您的账户以开始使用</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMode('email')}
            className={`px-3 py-1.5 rounded-lg text-sm ${mode==='email'?'bg-gray-900 text-white':'bg-gray-100 text-gray-700'}`}
          >
            邮箱注册
          </button>
          <button
            onClick={() => setMode('phone')}
            className={`px-3 py-1.5 rounded-lg text-sm ${mode==='phone'?'bg-gray-900 text-white':'bg-gray-100 text-gray-700'}`}
          >
            手机注册
          </button>
        </div>

        {msg && (
          <div className={`text-sm p-3 rounded-lg ${
            msg.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {msg}
          </div>
        )}

        {mode === 'email' && (
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱地址"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码（至少6位）"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="确认密码"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={registerWithEmail}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </div>
        )}

        {mode === 'phone' && (
          <div className="space-y-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="手机号"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {phase === 'idle' ? (
              <button
                onClick={sendPhoneCode}
                disabled={loading}
                className="w-full py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
              >
                {loading ? '发送中...' : '发送验证码'}
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="短信验证码"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={verifyPhoneAndRegister}
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
                >
                  {loading ? '验证中...' : '验证并注册'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="text-center text-sm text-gray-600">
          已有账户？
          <Link 
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="text-blue-600 hover:text-blue-700 ml-1"
          >
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
}