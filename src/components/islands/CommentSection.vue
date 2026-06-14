<template>
  <section class="comment-section">
    <h3 class="section-title">💬 评论</h3>

    <div v-if="loading" class="loading">加载评论中...</div>

    <template v-else>
      <div class="comment-list">
        <div v-if="comments.length === 0" class="empty">暂无评论，来抢沙发吧~</div>
        <div v-for="c in comments" :key="c.commentId" class="comment-item">
          <div class="comment-header">
            <div class="avatar">{{ (c.nickname || '匿').charAt(0) }}</div>
            <span class="nickname">{{ c.nickname || '匿名' }}</span>
            <span class="time">{{ c.createTime }}</span>
          </div>
          <div class="content">{{ c.content }}</div>
          <div v-if="c.children && c.children.length" class="children">
            <div v-for="child in c.children" :key="child.commentId" class="comment-item child">
              <div class="comment-header">
                <div class="avatar sm">{{ (child.nickname || '匿').charAt(0) }}</div>
                <span class="nickname">{{ child.nickname || '匿名' }}</span>
                <span class="time">{{ child.createTime }}</span>
              </div>
              <div class="content">{{ child.content }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="comment-form">
        <input v-model="form.nickname" placeholder="昵称（可选）" class="input" maxlength="30" />
        <textarea
          v-model="form.content"
          placeholder="写下你的评论..."
          class="textarea"
          rows="3"
          maxlength="1000"
        ></textarea>
        <button
          class="submit"
          :disabled="submitting || !form.content.trim()"
          @click="submit"
        >
          {{ submitting ? '提交中...' : '发表评论' }}
        </button>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { SITE } from '@/lib/config';

interface Comment {
  commentId: string;
  essaySlug: string;
  content: string;
  parentId: string | null;
  nickname: string;
  createTime: string;
  children?: Comment[];
}

const props = defineProps<{ essaySlug: string }>();

const comments = ref<Comment[]>([]);
const loading = ref(true);
const submitting = ref(false);
const form = reactive({ nickname: '', content: '' });

onMounted(fetchComments);

async function fetchComments() {
  loading.value = true;
  try {
    const res = await fetch(
      `${SITE.apiBaseUrl}/comment/findByEssaySlug?essaySlug=${encodeURIComponent(props.essaySlug)}`
    );
    const data = await res.json();
    comments.value = data.success ? data.data || [] : [];
  } catch {
    comments.value = [];
  } finally {
    loading.value = false;
  }
}

async function submit() {
  if (!form.content.trim()) return;
  submitting.value = true;
  try {
    const res = await fetch(`${SITE.apiBaseUrl}/comment/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        essaySlug: props.essaySlug,
        content: form.content,
        nickname: form.nickname || '匿名访客',
      }),
    });
    const data = await res.json();
    if (data.success) {
      form.content = '';
      alert('评论已提交，审核通过后将展示');
    } else {
      alert(data.message || '评论失败');
    }
  } catch {
    alert('网络异常，评论失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.comment-section {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}
.section-title {
  font-size: 20px;
  margin: 0 0 20px;
  color: var(--text-color);
}
.loading, .empty {
  text-align: center;
  color: var(--text-secondary);
  padding: 24px;
  font-size: 14px;
}
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.comment-item {
  background: var(--card-bg);
  border: var(--card-border);
  border-radius: 12px;
  padding: 14px 16px;
}
.comment-item.child {
  margin-top: 10px;
  margin-left: 32px;
  background: var(--glass-bg);
}
.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}
.avatar.sm {
  width: 24px;
  height: 24px;
  font-size: 12px;
}
.nickname {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
}
.time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: auto;
}
.content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color);
  padding-left: 36px;
}
.child .content { padding-left: 32px; }
.comment-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--card-bg);
  border: var(--card-border);
  border-radius: 12px;
  padding: 16px;
}
.input, .textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--glass-bg);
  color: var(--text-color);
  font-family: inherit;
  font-size: 14px;
}
.input:focus, .textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}
.textarea {
  resize: vertical;
  min-height: 70px;
}
.submit {
  align-self: flex-end;
  padding: 8px 20px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}
.submit:hover:not(:disabled) {
  opacity: 0.9;
}
.submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
