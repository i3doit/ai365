const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const API_KEY = 'dkfile_f816920b495ce2e47f3173cdaf53e4128d0120c521b12df2414e545c84e2c0b5';
const BASE_URL = 'https://dkfile.xyz/dkfile_api';

function publishWithCurl(filePath, projectName, description) {
    const fileName = path.basename(filePath, '.html');
    console.log(`正在通过 curl 发布 ${fileName} 到 dkfile...`);
    
    try {
        // 使用 -k 跳过 SSL 验证 (针对防火墙拦截问题)
        // 使用 -F "file=@path;filename=name" 强制指定上传文件名（不带 .html）
        const command = `curl -k -s -X POST ${BASE_URL}/upload \
            -H "Authorization: Bearer ${API_KEY}" \
            -F "file=@${filePath};filename=${fileName}" \
            -F "project_name=${projectName}" \
            -F "description=${description}"`;
        
        const output = execSync(command).toString();
        const result = JSON.parse(output);
        
        if (result.success) {
            console.log(`✅ ${fileName} 发布成功！`);
            console.log(`   访问地址: ${result.data.url}`);
            return result.data;
        } else {
            console.error(`❌ ${fileName} 发布失败: ${result.message}`);
        }
    } catch (error) {
        console.error(`❌ ${fileName} 运行时错误: ${error.message}`);
        if (error.stdout) console.log('输出:', error.stdout.toString());
    }
}

async function main() {
    const files = [
        { path: './index-export.html', project: 'AIDDER 首页', desc: 'AI365 工具导航' },
        { path: './red-packet-export.html', project: 'AIDDER 红包口令', desc: '红包口令助力工具' }
    ];

    for (const f of files) {
        const fullPath = path.resolve(__dirname, f.path);
        if (fs.existsSync(fullPath)) {
            publishWithCurl(fullPath, f.project, f.desc);
        } else {
            console.error(`找不到文件: ${fullPath}`);
        }
    }
}

main();
