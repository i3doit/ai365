'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';

export default function MaskedText({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'aidoudou@gmail.com';
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email || '';
      setIsAdmin(email.toLowerCase() === adminEmail.toLowerCase());
      setVisible(email.toLowerCase() === adminEmail.toLowerCase());
    })();
  }, []);

  return (
    <span className="inline-flex items-center gap-2">
      <span>{visible ? value : '***'}</span>
      {!isAdmin && (
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700"
        >
          显示
        </button>
      )}
    </span>
  );
}
