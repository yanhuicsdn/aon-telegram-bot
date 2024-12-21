<template>
  <div class="chat-container">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <el-menu default-active="1" class="command-menu">
        <el-menu-item index="1" @click="handleStart">
          <el-icon><ChatRound /></el-icon>
          <span>开始对话</span>
        </el-menu-item>
        <el-menu-item index="2" @click="handleHelp">
          <el-icon><QuestionFilled /></el-icon>
          <span>帮助信息</span>
        </el-menu-item>
        <el-menu-item index="3" @click="handleClear">
          <el-icon><Delete /></el-icon>
          <span>清除历史</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主聊天区域 -->
    <div class="chat-main">
      <!-- 消息列表 -->
      <div class="message-list" ref="messageList">
        <div v-for="(msg, index) in messages" :key="index" 
             :class="['message', msg.role === 'user' ? 'message-user' : 'message-assistant']">
          <div class="message-content">
            <el-avatar :size="40" :icon="msg.role === 'user' ? 'UserFilled' : 'Service'" />
            <div class="message-bubble">
              {{ msg.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="请输入消息..."
          @keyup.enter.native="handleSend"
        />
        <el-button 
          type="primary" 
          :loading="isLoading"
          @click="handleSend"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ChatView',
  setup() {
    const store = useStore()
    const inputMessage = ref('')
    const messageList = ref(null)

    const messages = computed(() => store.state.messages)
    const isLoading = computed(() => store.state.isLoading)

    const scrollToBottom = async () => {
      await nextTick()
      if (messageList.value) {
        messageList.value.scrollTop = messageList.value.scrollHeight
      }
    }

    const handleSend = async () => {
      if (!inputMessage.value.trim()) return
      
      await store.dispatch('sendMessage', inputMessage.value)
      inputMessage.value = ''
      scrollToBottom()
    }

    const handleStart = () => {
      store.dispatch('sendMessage', '/start')
    }

    const handleHelp = () => {
      store.dispatch('sendMessage', '/help')
    }

    const handleClear = () => {
      store.dispatch('clearHistory')
    }

    onMounted(() => {
      handleStart()
    })

    return {
      inputMessage,
      messages,
      isLoading,
      messageList,
      handleSend,
      handleStart,
      handleHelp,
      handleClear
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 200px;
  border-right: 1px solid #dcdfe6;
}

.command-menu {
  height: 100%;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 20px;
}

.message-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.message-bubble {
  background: #f4f4f5;
  padding: 12px;
  border-radius: 8px;
  max-width: 70%;
  word-break: break-word;
}

.message-user {
  flex-direction: row-reverse;
}

.message-user .message-content {
  flex-direction: row-reverse;
}

.message-user .message-bubble {
  background: #409eff;
  color: white;
}

.input-area {
  padding: 20px;
  border-top: 1px solid #dcdfe6;
  display: flex;
  gap: 10px;
}

.input-area .el-input {
  flex: 1;
}
</style>
