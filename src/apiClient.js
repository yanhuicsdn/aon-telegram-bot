const axios = require('axios');
const winston = require('winston');

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

class APIClient {
    constructor(apiToken, apiUrl, modelName) {
        this.apiToken = apiToken;
        this.apiUrl = apiUrl;
        this.modelName = modelName;
        this.conversations = new Map();
        
        // 创建axios实例
        this.api = axios.create({
            baseURL: this.apiUrl,
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    // 获取或创建对话历史
    getConversation(chatId) {
        if (!this.conversations.has(chatId)) {
            this.conversations.set(chatId, [
                {
                    role: 'system',
                    content: '你是一个友好、专业的 AI 助手，专门负责解答关于 AGI Open Network (AON) 的问题。\n' +
                            '以下是你的知识库：\n\n' +
                            '1. AI Agent 定义：\n' +
                            'AI Agent 是由人工智能驱动的软件实体，能够自主执行任务、做出决策，并与用户或其他系统交互以实现特定目标。\n\n' +
                            '2. AI Agent 为什么需要加密货币：\n' +
                            '- 提供去中心化和安全的基础设施\n' +
                            '- 支持智能合约执行任务\n' +
                            '- 实现安全的微交易\n' +
                            '- 促进共享所有权\n' +
                            '- 实现透明的金融交互\n\n' +
                            '3. AON 愿景和使命：\n' +
                            '愿景：让 AI agents 成为有价值的资产，在各种消费应用中产生收益。\n' +
                            '使命：创建开放平台，让所有人都能开发、部署和变现 AI Agents 和 AI Models。\n\n' +
                            '4. AON 产品模块：\n' +
                            '- AI Model API 平台（3000+ 开源模型）\n' +
                            '- AI 算力聚合器\n' +
                            '- AI Agent 发行平台（IAO）\n' +
                            '- AI Model 发行平台（IMO）\n' +
                            '- Web3 SDK（MPC, PayFi）\n\n' +
                            '5. 用户类型：\n' +
                            '专业开发者：可使用平台 AI 模型和算力资源\n' +
                            '非专业开发者：可使用无代码开发模板\n\n' +
                            '6. 变现模式：\n' +
                            '- IAO（Initial Agent Offering）：AI Agent 代币发行\n' +
                            '- IMO（Initial Model Offering）：AI 模型代币发行\n\n' +
                            '请根据以上知识，准确、简洁地回答用户问题。如果遇到知识库之外的问题，请诚实地表示不确定。'
                }
            ]);
        }
        return this.conversations.get(chatId);
    }

    // 清除对话历史
    clearHistory(chatId) {
        this.conversations.delete(chatId);
        logger.info(`已清除聊天ID ${chatId} 的对话历史`);
    }

    // 获取AI响应
    async getAIResponse(chatId, userMessage) {
        try {
            const conversation = this.getConversation(chatId);
            conversation.push({ role: 'user', content: userMessage });

            logger.info(`发送请求到API，聊天ID: ${chatId}, 消息: ${userMessage}`);

            const response = await this.api.post('', {
                model: this.modelName,
                messages: conversation
            });

            const aiResponse = response.data.choices[0].message.content;
            conversation.push({ role: 'assistant', content: aiResponse });

            // 保持对话历史在合理范围内（最多保留10条消息）
            if (conversation.length > 11) { // 系统消息 + 10条对话
                conversation.splice(1, 2); // 删除最早的一组对话（用户消息和AI响应）
            }

            logger.info(`收到AI响应，聊天ID: ${chatId}, 响应: ${aiResponse.substring(0, 100)}...`);
            return aiResponse;

        } catch (error) {
            logger.error('调用API时出错:', error);
            throw error;
        }
    }
}

module.exports = APIClient;
