<template>
  <div class="comment-section">
    <h3 class="section-title">评论</h3>

    <!-- 已登录：直接显示输入框 -->
    <div v-if="authStore.isLoggedIn" class="comment-form">
      <div class="comment-user-info">
        <el-avatar :size="28" v-if="authStore.user?.avatar">
          <img :src="authStore.user.avatar" alt="avatar"/>
        </el-avatar>
        <el-avatar :size="28" v-else>{{ (authStore.user?.nickname || authStore.user?.username || '').charAt(0) }}</el-avatar>
        <span class="comment-username">{{ authStore.user?.nickname || authStore.user?.username }}</span>
      </div>
      <el-input v-model="form.content" type="textarea" :rows="3" placeholder="写下你的评论..." maxlength="1000"/>
      <el-button type="primary" @click="handleSubmit" :loading="submitting" :disabled="!form.content.trim()">
        发表评论
      </el-button>
    </div>

    <!-- 未登录：显示提示 + 登录按钮 -->
    <div v-else class="comment-login-hint">
      <p>登录后即可发表评论</p>
      <el-button type="primary" @click="authStore.showLoginDialog = true">
        登录 / 注册
      </el-button>
    </div>

    <div class="comment-list">
      <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
        <div class="comment-header">
          <el-avatar :size="28" v-if="comment.avatar">
            <img :src="comment.avatar" alt="avatar"/>
          </el-avatar>
          <el-avatar :size="28" v-else>{{ (comment.nickname || '').charAt(0) }}</el-avatar>
          <span class="comment-nickname">{{ comment.nickname }}</span>
          <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
        </div>
        <div class="comment-content">{{ comment.content }}</div>
        <div class="comment-actions">
          <el-button text size="small" @click="handleReplyClick(comment)">回复</el-button>
        </div>

        <div v-if="replyTo?.commentId === comment.commentId" class="reply-form">
          <el-input v-model="replyContent" type="textarea" :rows="2" placeholder="回复..." maxlength="1000"/>
          <div class="reply-actions">
            <el-button size="small" @click="cancelReply">取消</el-button>
            <el-button type="primary" size="small" @click="submitReply(comment)" :loading="submitting">回复</el-button>
          </div>
        </div>

        <div v-if="comment.children?.length" class="comment-children">
          <div v-for="child in comment.children" :key="child.commentId" class="comment-item child">
            <div class="comment-header">
              <el-avatar :size="24" v-if="child.avatar">
                <img :src="child.avatar" alt="avatar"/>
              </el-avatar>
              <el-avatar :size="24" v-else>{{ (child.nickname || '').charAt(0) }}</el-avatar>
              <span class="comment-nickname">{{ child.nickname }}</span>
              <span v-if="child.replyUserId" class="reply-to">回复 @{{ findNickname(child.replyUserId) }}</span>
              <span class="comment-time">{{ formatDate(child.createTime) }}</span>
            </div>
            <div class="comment-content">{{ child.content }}</div>
          </div>
        </div>
      </div>
      <el-empty v-if="!comments.length" description="暂无评论"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {ElMessage} from 'element-plus'
import {addComment, getCommentByEssayId} from '@/api/comment'
import {formatDate} from '@/utils/format'
import {useAuthStore} from '@/stores/auth'

const props = defineProps<{ essayId: string }>()
const authStore = useAuthStore()

const comments = ref<Comment[]>([])
const submitting = ref(false)
const form = ref({content: ''})
const replyTo = ref<Comment | null>(null)
const replyContent = ref('')

async function fetchComments() {
  const data = await getCommentByEssayId(props.essayId) as unknown as Comment[]
  comments.value = data || []
}

function findNickname(userId: string): string {
  for (const c of comments.value) {
    if (c.commentId === userId) return c.nickname
    if (c.children) {
      for (const child of c.children) {
        if (child.commentId === userId) return child.nickname
      }
    }
  }
  return '未知用户'
}

function handleReplyClick(comment: Comment) {
  if (!authStore.isLoggedIn) {
    authStore.showLoginDialog = true
    return
  }
  startReply(comment)
}

function startReply(comment: Comment) {
  replyTo.value = comment
  replyContent.value = ''
}

function cancelReply() {
  replyTo.value = null
  replyContent.value = ''
}

async function handleSubmit() {
  if (!form.value.content.trim()) return
  submitting.value = true
  try {
    await addComment({
      essayId: props.essayId,
      content: form.value.content,
    })
    ElMessage.success('评论已提交，等待审核')
    form.value.content = ''
  } finally {
    submitting.value = false
  }
}

async function submitReply(parent: Comment) {
  if (!replyContent.value.trim()) return
  submitting.value = true
  try {
    await addComment({
      essayId: props.essayId,
      content: replyContent.value,
      parentId: parent.commentId,
      replyUserId: parent.commentId,
    })
    ElMessage.success('回复已提交，等待审核')
    cancelReply()
  } finally {
    submitting.value = false
  }
}

onMounted(fetchComments)
</script>

<style lang="scss" scoped>
.comment-section {
  margin-top: 30px;
}

.section-title {
  font-size: 20px;
  margin-bottom: 20px;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.comment-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-username {
  font-weight: 600;
  font-size: 14px;
}

.comment-login-hint {
  text-align: center;
  padding: 24px;
  margin-bottom: 30px;
  background: var(--card-bg);
  border: var(--card-border);
  border-radius: var(--card-radius);

  p {
    margin: 0 0 12px;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  background: var(--card-bg);
  border: var(--card-border);
  border-radius: var(--card-radius);
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--card-hover-shadow);
    border-color: var(--primary-color);
  }

  &.child {
    margin-left: 24px;
  }
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-nickname {
  font-weight: 600;
  font-size: 14px;
}

.reply-to {
  color: var(--primary-color);
  font-size: 13px;
}

.comment-time {
  color: var(--text-secondary);
  font-size: 12px;
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color);
}

.comment-actions {
  margin-top: 8px;
}

.comment-children {
  margin-top: 12px;
}

.reply-form {
  margin-top: 12px;
}

.reply-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-end;
}
</style>
