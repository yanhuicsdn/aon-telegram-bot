require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const winston = require('winston');
const APIClient = require('./apiClient');
const http = require('http');

// 配置日志
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// 创建一个简单的 HTTP 服务器
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running!');
});

// 监听端口
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.info(`HTTP 服务器运行在端口 ${PORT}`);
});

// 简单的自我保活
setInterval(() => {
    logger.info('保持服务活跃...');
    // 发送一个简单的请求给自己的服务器
    http.get(`http://localhost:${PORT}`, (res) => {
        if (res.statusCode === 200) {
            logger.info('服务器正常运行中');
        }
    }).on('error', (err) => {
        logger.error('保活请求失败:', err.message);
    });
}, 10 * 60 * 1000); // 每10分钟执行一次

// 创建API客户端
const apiClient = new APIClient(
    process.env.API_TOKEN,
    process.env.API_URL,
    process.env.MODEL_NAME
);

// 创建Telegram机器人
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// 处理错误
bot.on('polling_error', (error) => {
    logger.error('Telegram机器人轮询错误:', error);
});

// 处理 /start 命令
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        logger.info(`收到 /start 命令，来自用户: ${msg.from.username}`);
        await bot.sendMessage(chatId,
            "👋 你好！我是一个智能助手。\n\n" +
            "🤖 我可以：\n" +
            "1. 回答你的问题\n" +
            "2. 帮你完成任务\n" +
            "3. 陪你聊天\n\n" +
            "💡 直接发消息给我就可以开始对话！\n" +
            "🔄 使用 /clear 可以清除对话历史\n" +
            "❓ 使用 /help 查看更多帮助"
        );
    } catch (error) {
        logger.error(`处理 /start 命令时出错: ${error.message}`);
        await bot.sendMessage(chatId, "抱歉，处理命令时出现错误，请稍后再试。");
    }
});

// 处理 /help 命令
bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        logger.info(`收到 /help 命令，来自用户: ${msg.from.username}`);
        await bot.sendMessage(chatId,
            "🔍 帮助信息：\n\n" +
            "命令列表：\n" +
            "/start - 开始对话\n" +
            "/help - 显示帮助信息\n" +
            "/clear - 清除对话历史\n" +
            "/check - 检查机器人权限\n\n" +
            "使用提示：\n" +
            "1. 直接发送消息即可与我对话\n" +
            "2. 我会记住对话内容，保持上下文连贯\n" +
            "3. 如果想开始新话题，可以用 /clear 清除历史\n" +
            "4. 我会用emoji让对话更生动\n" +
            "5. 如果遇到问题，请尝试重新发送消息"
        );
    } catch (error) {
        logger.error(`处理 /help 命令时出错: ${error.message}`);
        await bot.sendMessage(chatId, "抱歉，处理命令时出现错误，请稍后再试。");
    }
});

// 处理 /clear 命令
bot.onText(/\/clear/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        logger.info(`收到 /clear 命令，来自用户: ${msg.from.username}`);
        apiClient.clearHistory(chatId);
        await bot.sendMessage(chatId,
            "🧹 已清除对话历史！\n" +
            "现在我们可以开始新的对话了。"
        );
    } catch (error) {
        logger.error(`处理 /clear 命令时出错: ${error.message}`);
        await bot.sendMessage(chatId, "抱歉，清除历史记录时出现错误，请稍后再试。");
    }
});

// 处理 /check 命令
bot.onText(/\/check/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        logger.info(`收到 /check 命令，来自用户: ${msg.from.username}`);
        const chat = msg.chat;
        const botInfo = await bot.getMe();
        
        // 获取机器人成员信息
        let botMember;
        try {
            botMember = await bot.getChatMember(chatId, botInfo.id);
        } catch (e) {
            logger.error(`获取机器人成员信息失败: ${e.message}`);
        }

        const permissionsInfo = [
            `🤖 机器人信息：`,
            `- 用户名：@${botInfo.username}`,
            `- ID：${botInfo.id}`,
            `- 是否为机器人：${botInfo.is_bot ? '是' : '否'}`,
            `\n📱 当前聊天信息：`,
            `- 类型：${chat.type}`,
            `- ID：${chat.id}`,
            `- 标题：${chat.type !== 'private' ? chat.title : '私聊'}`
        ];

        if (botMember) {
            permissionsInfo.push(
                `\n🔑 机器人权限：`,
                `- 成员状态：${botMember.status}`,
                `- 是否为管理员：${['administrator', 'creator'].includes(botMember.status) ? '是' : '否'}`
            );
        }

        await bot.sendMessage(chatId, permissionsInfo.join('\n'));
    } catch (error) {
        logger.error(`处理 /check 命令时出错: ${error.message}`);
        await bot.sendMessage(chatId, `抱歉，检查权限时出现错误：\n${error.message}`);
    }
});

// 处理普通消息
bot.on('message', async (msg) => {
    // 如果是命令，则跳过
    if (msg.text && msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    const messageText = msg.text;

    // 检查是否是群组消息
    const isGroup = ['group', 'supergroup'].includes(msg.chat.type);
    
    // 如果是群组消息，检查是否提到了机器人
    if (isGroup) {
        const botInfo = await bot.getMe();
        const mentioned = msg.reply_to_message?.from?.id === botInfo.id || 
                         (messageText && messageText.includes(`@${botInfo.username}`));
        
        if (!mentioned) {
            logger.info("群组消息未提到机器人，忽略");
            return;
        }
    }

    try {
        logger.info(`处理消息 [${chatId}] 来自 ${msg.from.username}: ${messageText}`);
        
        // 发送"正在输入"状态
        await bot.sendChatAction(chatId, 'typing');
        
        // 调用API获取回复
        const response = await apiClient.getAIResponse(chatId, messageText);
        
        // 发送回复
        await bot.sendMessage(chatId, response);
        logger.info(`已回复消息 [${chatId}]: ${response.substring(0, 100)}...`);
        
    } catch (error) {
        logger.error(`处理消息时出错: ${error.message}`);
        await bot.sendMessage(chatId, "抱歉，处理消息时出现错误，请稍后再试。");
    }
});

// 启动机器人
logger.info('机器人已启动...');
logger.info(`机器人名称: ${process.env.BOT_NAME}`);
