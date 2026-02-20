-- 创建 credentials 表，用于存储第三方平台的账号信息
CREATE TABLE IF NOT EXISTS api.credentials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text NOT NULL,
  account text,
  password text, -- 存储加密后的密码
  api_key text,  -- 存储加密后的 API Key
  created_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE api.credentials ENABLE ROW LEVEL SECURITY;

-- 只有管理员可以访问（假设管理员 UID 为 '00000000-0000-0000-0000-000000000000'）
DROP POLICY IF EXISTS "Admin only access" ON api.credentials;
CREATE POLICY "Admin only access" ON api.credentials
  FOR ALL
  USING (auth.uid()::text = '00000000-0000-0000-0000-000000000000')
  WITH CHECK (auth.uid()::text = '00000000-0000-0000-0000-000000000000');
