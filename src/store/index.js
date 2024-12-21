import { createStore } from 'vuex'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.VUE_APP_API_TOKEN}`,
    'Content-Type': 'application/json'
  }
})

export default createStore({
  state: {
    messages: [],
    isLoading: false,
    error: null
  },
  mutations: {
    ADD_MESSAGE(state, message) {
      state.messages.push(message)
    },
    CLEAR_MESSAGES(state) {
      state.messages = []
    },
    SET_LOADING(state, status) {
      state.isLoading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async sendMessage({ commit, state }, message) {
      try {
        commit('SET_LOADING', true)
        commit('ADD_MESSAGE', { role: 'user', content: message })
        
        const response = await api.post('/api/chat/completions', {
          model: process.env.VUE_APP_MODEL_NAME,
          messages: [
            {
              role: 'system',
              content: '你是一个友好、专业的 AI 助手，专门负责解答关于 AGI Open Network (AON) 的问题。'
            },
            ...state.messages
          ]
        })

        const aiResponse = response.data.choices[0].message.content
        commit('ADD_MESSAGE', { role: 'assistant', content: aiResponse })
      } catch (error) {
        commit('SET_ERROR', error.message)
        // 显示错误消息
        ElMessage.error('发送消息失败，请稍后重试')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    clearHistory({ commit }) {
      commit('CLEAR_MESSAGES')
    }
  }
})
