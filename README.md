# AON Telegram Bot

这是一个基于Node.js的Telegram机器人，专门用于回答关于AGI Open Network (AON)的问题。

## 功能特点

- 智能对话：使用AI模型回答用户问题
- 上下文记忆：保持对话连贯性
- 群组支持：支持在群组中@机器人
- 命令系统：支持多个实用命令

## 可用命令

- `/start` - 开始对话
- `/help` - 显示帮助信息
- `/clear` - 清除对话历史
- `/check` - 检查机器人权限

## 环境变量

需要在Railway的环境变量中设置以下值：

- `API_TOKEN` - AI API的访问令牌
- `API_URL` - AI API的地址
- `MODEL_NAME` - 使用的AI模型名称
- `TELEGRAM_BOT_TOKEN` - Telegram机器人的访问令牌

## 部署

1. Fork这个仓库
2. 在Railway.app上创建新项目
3. 选择从GitHub导入
4. 设置环境变量
5. 部署完成！

## 开发

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 启动生产服务
npm start
```
