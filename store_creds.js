const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bmmtcrqvikvunvpsjjcx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbXRjcnF2aWt2dW52cHNqamN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDY4ODUsImV4cCI6MjA4MzUyMjg4NX0.RkaxCuNYHFtS7uDCsIpbZrQ2mheShQNkAHfXyxQGxK0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    db: { schema: 'api' }
});

// 简单的加密函数 (Base64 + 混淆)
function encrypt(text) {
    return Buffer.from(text).toString('base64').split('').reverse().join('');
}

async function storeCredentials() {
    const creds = {
        platform: 'dkfile',
        account: 'loveu1314527@gmail.com',
        password: encrypt('i3@doit527'),
        api_key: encrypt('dkfile_f816920b495ce2e47f3173cdaf53e4128d0120c521b12df2414e545c84e2c0b5')
    };

    console.log('正在存储加密后的凭据...');
    
    try {
        const { data, error } = await supabase
            .from('credentials')
            .upsert([creds], { onConflict: 'platform' }) // 假设 platform 是唯一的
            .select();

        if (error) {
            if (error.code === '42P01') {
                console.error('❌ 错误: 表 api.credentials 不存在。请先运行迁移脚本创建该表。');
            } else {
                console.error('❌ 存储失败:', error.message);
            }
            return;
        }

        console.log('✅ 凭据已成功加密并存储到数据库。');
        console.log('存储内容 (示例):', JSON.stringify(data[0], null, 2));
    } catch (err) {
        console.error('❌ 运行时错误:', err.message);
    }
}

storeCredentials();
