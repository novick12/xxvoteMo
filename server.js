const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const basicAuth = require('basic-auth');

const app = express();
const PORT = 8081; // 修改端口号

// 管理员认证
const ADMIN_USER = 'admin';
const ADMIN_PASS = '123456';

// 启用CORS和JSON解析中间件
app.use(cors());
app.use(express.json());

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'votes.json');

// 初始化数据文件
if (!fs.existsSync(DATA_FILE)) {
    const members = [
        "杨南飞", "张航友", "刘三甦", "杜敏", "郭䶮", 
        "李竹", "魏术森", "李海聪", "李琪", "乔迎春",
        "杨莉", "龚楠", "常津铭", "冷夔", "段佳明",
        "刘勇", "王坤", "何畏", "温健军", "何淼",
        "曾祥洪", "伍洛宾", "江华", "张洪林", "周大军",
        "曾谛", "吕昊", "杨新涛", "杨孝平", "刘国栋",
        "杨名", "王维政", "李洋", "刘冬梅", "董晓勇",
        "方亮", "周毅", "郑水华", "吉晓红", "陈军材",
        "张超", "唐何", "曹睿", "王雄金", "熊敏",
        "张茜", "张金虎", "胡鹕", "黄丽娟", "张明志",
        "管宁", "江川贵", "杨智", "梁鹏"
    ];
    const initialData = {
        votes: {},
        submitted: false,
        members: members
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// 获取投票数据
app.get('/api/votes', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: '读取数据失败' });
    }
});

// 提交投票
app.post('/api/votes', (req, res) => {
    try {
        const { name, level } = req.body;
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        
        if (!data.submitted) {
            data.votes[name] = level;
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
            res.json({ success: true });
        } else {
            res.status(400).json({ error: '投票已结束' });
        }
    } catch (error) {
        res.status(500).json({ error: '保存投票失败' });
    }
});

// 提交所有投票
app.post('/api/submit', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        data.submitted = true;
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: '提交失败' });
    }
});

// 提供静态文件服务
app.use(express.static(__dirname));

// 管理员认证中间件
function adminAuth(req, res, next) {
    const user = basicAuth(req);
    if (!user || user.name !== ADMIN_USER || user.pass !== ADMIN_PASS) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.status(401).json({ error: '未授权' });
    }
    next();
}

// 管理员登录验证
app.post('/api/login', adminAuth, (req, res) => {
    res.json({ success: true });
});

// 重置投票数据
app.post('/api/reset', adminAuth, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        data.votes = {};
        data.submitted = false;
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: '重置失败' });
    }
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});