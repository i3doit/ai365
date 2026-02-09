'use client';
import { supabase } from '../../src/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const emailSchema = z.string().email();
const phoneSchema = z.string().min(6);
const pwSchema = z.string().min(6);

function clean(s: string) {
  return s.replace(/<[^>]+>/g, '').trim();
}

export default function LoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState('/hk-order');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<'idle' | 'phone_code'>('idle');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [mode, setMode] = useState<'email' | 'phone' | 'oauth'>('email');

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

  const signInGoogle = async () => {
    setMsg('');
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/login?next=${encodeURIComponent(nextPath)}` }
      });
    } catch (e: any) {
      setMsg('谷歌登录未启用，请使用邮箱或手机号登录');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailLink = async () => {
    setMsg('');
    const v = clean(email);
    try {
      emailSchema.parse(v);
      setLoading(true);
      await supabase.auth.signInWithOtp({
        email: v,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/login?next=${encodeURIComponent(nextPath)}`
        }
      });
      setMsg('已发送邮箱登录链接，请前往邮箱点击登录');
    } catch {
      setMsg('邮箱格式不正确或发送失败');
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
      setMsg('验证码已发送，请输入验证码完成登录');
    } catch {
      setMsg('手机号格式不正确或验证码发送失败');
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneCode = async () => {
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
        router.push('/hk-order');
      } else {
        setMsg('验证码验证失败');
      }
    } catch {
      setMsg('验证码验证失败');
    } finally {
      setLoading(false);
    }
  };

  const signInEmailPassword = async () => {
    setMsg('');
    const vEmail = clean(email);
    const vPw = clean(password);
    try {
      emailSchema.parse(vEmail);
      pwSchema.parse(vPw);
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: vEmail,
        password: vPw
      });
      if (error) throw error;
      if (data.user) {
        router.push(nextPath);
      } else {
        setMsg('登录失败，请检查邮箱或密码');
      }
    } catch {
      setMsg('登录失败，请检查邮箱或密码');
    } finally {
      setLoading(false);
    }
  };

  const signUpEmailPassword = async () => {
    setMsg('');
    const vEmail = clean(email);
    const vPw = clean(password);
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
        router.push(nextPath);
      } else {
        setMsg('注册失败，请稍后重试');
      }
    } catch {
      setMsg('注册失败，请检查输入');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">登录</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('email')}
            className={`px-3 py-1.5 rounded-lg text-sm ${mode==='email'?'bg-gray-900 text-white':'bg-gray-100 text-gray-700'}`}
          >
            邮箱登录
          </button>
          <button
            onClick={() => setMode('phone')}
            className={`px-3 py-1.5 rounded-lg text-sm ${mode==='phone'?'bg-gray-900 text-white':'bg-gray-100 text-gray-700'}`}
          >
            手机登录
          </button>
          <button
            onClick={() => setMode('oauth')}
            className={`px-3 py-1.5 rounded-lg text-sm ${mode==='oauth'?'bg-gray-900 text-white':'bg-gray-100 text-gray-700'}`}
          >
            第三方
          </button>
        </div>
        {msg && <div className="text-sm text-red-600">{msg}</div>}
        {mode === 'email' && (
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱"
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码（至少6位）"
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={signInEmailPassword}
                disabled={loading}
                className="w-full py-2 rounded-lg bg-blue-600 text-white"
              >
                邮箱+密码登录
              </button>
              <button
                onClick={signUpEmailPassword}
                disabled={loading}
                className="w-full py-2 rounded-lg bg-indigo-600 text-white"
              >
                邮箱+密码注册
              </button>
            </div>
            <button
              onClick={sendEmailLink}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-blue-600 text-white"
            >
              邮箱登录链接
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
              className="w-full rounded-lg border border-gray-200 px-3 py-2"
            />
            {phase === 'idle' ? (
              <button
                onClick={sendPhoneCode}
                disabled={loading}
                className="w-full py-2 rounded-lg bg-emerald-600 text-white"
              >
                发送手机验证码
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="短信验证码"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                />
                <button
                  onClick={verifyPhoneCode}
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-emerald-600 text-white"
                >
                  验证并登录
                </button>
              </div>
            )}
          </div>
        )}
        {mode === 'oauth' && (
          <div className="space-y-3">
            <button
              onClick={signInGoogle}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-gray-800 text-white"
            >
              使用 Gmail 快捷登录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
