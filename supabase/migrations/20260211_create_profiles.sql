-- 创建 profiles 表，用于存储用户的公开信息
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  full_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- 为 profiles 表启用行级安全
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略（先删除后创建，确保幂等性）
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 创建触发器函数，在新用户注册时自动创建 profile 记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 将触发器绑定到 auth.users 表的插入操作（先删除后创建，解决触发器已存在的问题）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 为 profiles 表添加注释
COMMENT ON TABLE profiles IS '存储用户的公开信息，与 auth.users 关联';
COMMENT ON COLUMN profiles.id IS '用户ID，关联 auth.users.id';
COMMENT ON COLUMN profiles.username IS '用户名，唯一且至少3个字符';
COMMENT ON COLUMN profiles.avatar_url IS '用户头像链接';
COMMENT ON COLUMN profiles.full_name IS '用户全名';
COMMENT ON COLUMN profiles.updated_at IS '最后更新时间';
