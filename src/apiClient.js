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
                    content: '你是一个友好、专业的 AI 助手，专门负责解答关于 AGI Open Network (AON) 的问题。回答的内容一定要和问题的语言一致。\n' +
                            'You are a friendly and professional AI assistant, specialized in answering questions about AGI Open Network (AON). Always respond in the same language as the question.\n\n' +
                            '以下是你的知识库 / Here is your knowledge base:\n\n' +
                            '1. AI Agent 定义 / AI Agent Definition:\n' +
                            'AI Agent 是由人工智能驱动的软件实体，能够自主执行任务、做出决策，并与用户或其他系统交互以实现特定目标。\n' +
                            'AI Agent is an AI-driven software entity that can autonomously execute tasks, make decisions, and interact with users or other systems to achieve specific goals.\n\n' +
                            '2. AI Agent 为什么需要加密货币 / Why AI Agents Need Cryptocurrency:\n' +
                            '- 提供去中心化和安全的基础设施 / Provide decentralized and secure infrastructure\n' +
                            '- 支持智能合约执行任务 / Support smart contract task execution\n' +
                            '- 实现安全的微交易 / Enable secure microtransactions\n' +
                            '- 促进共享所有权 / Facilitate shared ownership\n' +
                            '- 实现透明的金融交互 / Enable transparent financial interactions\n\n' +
                            '3. AON 愿景和使命 / Vision and Mission:\n' +
                            '愿景：让 AI agents 成为有价值的资产，在各种消费应用中产生收益。\n' +
                            'Vision: Make AI agents valuable assets that generate returns in various consumer applications.\n' +
                            '使命：创建开放平台，让所有人都能开发、部署和变现 AI Agents 和 AI Models。\n' +
                            'Mission: Create an open platform where everyone can develop, deploy, and monetize AI Agents and AI Models.\n\n' +
                            '4. AON 产品模块 / Product Modules:\n' +
                            '- AI Model API 平台（3000+ 开源模型）/ AI Model API Platform (3000+ open-source models)\n' +
                            '- AI 算力聚合器 / AI Computing Aggregator\n' +
                            '- AI Agent 发行平台（IAO）/ AI Agent Launch Platform (IAO)\n' +
                            '- AI Model 发行平台（IMO）/ AI Model Launch Platform (IMO)\n' +
                            '- Web3 SDK（MPC, PayFi）\n\n' +
                            '5. 用户类型 / User Types:\n' +
                            '专业开发者：可使用平台 AI 模型和算力资源\n' +
                            'Professional Developers: Can use platform AI models and computing resources\n' +
                            '非专业开发者：可使用无代码开发模板\n' +
                            'Non-Professional Developers: Can use no-code development templates\n\n' +
                            '6. 变现模式 / Monetization Models:\n' +
                            '- IAO（Initial Agent Offering）：AI Agent 代币发行 / AI Agent Token Launch\n' +
                            '- IMO（Initial Model Offering）：AI 模型代币发行 / AI Model Token Launch\n\n' +
                            '重要提示：请始终使用与用户问题相同的语言回答。如果用户用中文提问就用中文回答，如果用英文提问就用英文回答。\n' +
                            'Important: Always respond in the same language as the user\'s question. If the user asks in Chinese, respond in Chinese. If the user asks in English, respond in English.'
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
