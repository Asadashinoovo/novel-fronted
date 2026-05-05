<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { aiChat } from '@/api/modules/ai'
import type { ChatMessage } from '@/types'

const props = defineProps<{
  bookId: number
  maxChapterId?: number
  chapters?: any[]
}>()

const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const sending = ref(false)
const chatContainer = ref<HTMLElement>()

function getChapterNum(chapterId: number): number {
  if (!props.chapters || props.chapters.length === 0) return chapterId
  const chapter = props.chapters.find(c => c.id === chapterId)
  return chapter ? chapter.chapterNum : chapterId
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

async function sendMessage() {
  const question = inputText.value.trim()
  if (!question || sending.value) return

  messages.value.push({ role: 'user', content: question })
  inputText.value = ''
  sending.value = true
  scrollToBottom()

  try {
    const res = await aiChat({
      bookId: props.bookId,
      question,
      maxChapterId: props.maxChapterId
    })
    if (res.data.success && res.data.data) {
      messages.value.push({
        role: 'assistant',
        content: res.data.data.answer,
        sources: res.data.data.sources
      })
    }
  } catch (e) {
    // axios interceptor will show error message
  } finally {
    sending.value = false
    scrollToBottom()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="ai-chat">
    <div class="chat-messages" ref="chatContainer">
      <div v-if="messages.length === 0" class="chat-empty">
        <p>基于当前小说内容，向我提问吧</p>
        <p class="chat-hint">例如：主角现在是什么境界？</p>
      </div>

      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="chat-message"
        :class="msg.role"
      >
        <div class="message-label">{{ msg.role === 'user' ? '你' : 'AI 助手' }}</div>
        <div class="message-content">{{ msg.content }}</div>
        <div v-if="msg.sources && msg.sources.length > 0" class="message-sources">
          <div class="sources-title">参考章节：</div>
          <span
            v-for="src in msg.sources"
            :key="src.chapterId"
            class="source-tag"
          >第{{ getChapterNum(src.chapterId) }}章</span>
        </div>
      </div>

      <div v-if="sending" class="chat-message assistant">
        <div class="message-label">AI 助手</div>
        <div class="typing-indicator">思考中<span class="dots">...</span></div>
      </div>
    </div>

    <div class="chat-input-area">
      <textarea
        v-model="inputText"
        class="chat-input"
        placeholder="输入你的问题..."
        :disabled="sending"
        rows="2"
        @keydown="handleKeydown"
      />
      <button
        class="send-btn"
        :disabled="!inputText.trim() || sending"
        @click="sendMessage"
      >
        发送
      </button>
    </div>
  </div>
</template>

<style scoped>
.ai-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chat-empty {
  text-align: center;
  color: #999;
  margin-top: 60px;
}

.chat-hint {
  font-size: 13px;
  color: #bbb;
  margin-top: 8px;
}

.chat-message .message-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.chat-message.user .message-label {
  text-align: right;
  color: #5c4a32;
}

.chat-message.user .message-content {
  background: #8b7355;
  color: #fff;
  border-radius: 12px 12px 4px 12px;
  padding: 10px 14px;
  max-width: 80%;
  margin-left: auto;
  font-size: 14px;
  line-height: 1.6;
}

.chat-message.assistant .message-content {
  background: #f0ebe3;
  color: #4a3f2f;
  border-radius: 12px 12px 12px 4px;
  padding: 10px 14px;
  max-width: 100%;
  font-size: 14px;
  line-height: 1.6;
}

.message-sources {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.sources-title {
  font-size: 11px;
  color: #aaa;
}

.source-tag {
  display: inline-block;
  background: #e8f5e9;
  color: #5c8a5a;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.typing-indicator {
  color: #aaa;
  font-size: 13px;
  padding: 10px 14px;
  background: #f0ebe3;
  border-radius: 12px 12px 12px 4px;
  display: inline-block;
}

.dots {
  animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {
  0%, 20% { opacity: 0; }
  40% { opacity: 1; }
  100% { opacity: 1; }
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #eee;
  background: #fff;
}

.chat-input {
  flex: 1;
  border: 1px solid #e0d5c5;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  resize: none;
  font-family: inherit;
  outline: none;
  background: #faf8f5;
}

.chat-input:focus {
  border-color: #8b7355;
}

.send-btn {
  align-self: flex-end;
  padding: 8px 18px;
  border: none;
  border-radius: 8px;
  background: #8b7355;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.send-btn:disabled {
  background: #c4b89a;
  cursor: not-allowed;
}
</style>
