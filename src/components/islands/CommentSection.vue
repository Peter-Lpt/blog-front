<template>
  <section class="comment-section" aria-labelledby="comment-title">
    <header class="comment-heading">
      <div><p class="eyebrow">READER LETTERS</p><h2 id="comment-title">读者来信</h2></div>
      <span class="comment-count">{{ comments.length }} 条公开评论</span>
    </header>

    <div v-if="loading" class="comment-skeleton" aria-label="正在加载评论">
      <span></span><span></span><span></span>
    </div>

    <template v-else>
      <div v-if="loadError" class="state-card error-state">
        <strong>评论暂时没有加载成功</strong><p>这不会影响文章阅读，你可以稍后重试。</p><button @click="fetchComments">重新加载</button>
      </div>
      <div v-else-if="comments.length === 0" class="state-card empty-state">
        <span class="state-mark">“</span><strong>还没有读者留下文字</strong><p>如果这篇文章给了你启发，欢迎成为第一位来信的人。</p>
      </div>
      <div v-else class="comment-list">
        <article v-for="(comment, index) in comments" :key="comment.commentId" class="comment-item">
          <div class="comment-index">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="comment-main">
            <header class="comment-meta"><div class="avatar">{{ initial(comment.nickname) }}</div><div><strong>{{ comment.nickname || '匿名读者' }}</strong><time>{{ comment.createTime }}</time></div></header>
            <p class="comment-content">{{ comment.content }}</p>
            <div v-if="comment.children?.length" class="reply-list">
              <article v-for="child in comment.children" :key="child.commentId" class="reply-item">
                <header><span class="avatar small">{{ initial(child.nickname) }}</span><strong>{{ child.nickname || '匿名读者' }}</strong><time>{{ child.createTime }}</time></header>
                <p>{{ child.content }}</p>
              </article>
            </div>
          </div>
        </article>
      </div>

      <form class="comment-form" @submit.prevent="submit">
        <div class="form-intro"><div><p class="eyebrow">LEAVE A NOTE</p><h3>写下你的想法</h3></div><p>友善、具体的讨论，会让文章变得更完整。</p></div>
        <label class="field nickname-field"><span>署名 <small>可选</small></span><input v-model="form.nickname" maxlength="30" autocomplete="nickname" placeholder="匿名读者" /></label>
        <label class="field message-field"><span>评论内容</span><textarea v-model="form.content" rows="5" maxlength="1000" placeholder="关于这篇文章，你想补充什么？"></textarea><small class="counter">{{ form.content.length }} / 1000</small></label>
        <div class="form-footer"><p class="privacy">评论提交后将在审核通过后公开。</p><button class="submit" :disabled="submitting || !form.content.trim()"><span>{{ submitting ? '正在寄出…' : '提交评论' }}</span><b aria-hidden="true">↗</b></button></div>
        <p v-if="statusMessage" class="status-message" :class="statusType" aria-live="polite">{{ statusMessage }}</p>
      </form>
    </template>
  </section>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { apiRequest } from '@/lib/api';
interface Comment { commentId:string; essaySlug:string; content:string; parentId:string|null; nickname:string; createTime:string; children?:Comment[]; }
const props=defineProps<{ essaySlug:string }>();
const comments=ref<Comment[]>([]); const loading=ref(true); const loadError=ref(false); const submitting=ref(false); const statusMessage=ref(''); const statusType=ref<'success'|'error'>('success');
const form=reactive({ nickname:'', content:'' });
const initial=(name?:string)=>(name || '匿').trim().charAt(0).toUpperCase();
onMounted(fetchComments);
async function fetchComments(){ loading.value=true; loadError.value=false; try { const data=await apiRequest<Comment[]>('/comment/findByEssaySlug?essaySlug='+encodeURIComponent(props.essaySlug)); comments.value=data || []; } catch { comments.value=[]; loadError.value=true; } finally { loading.value=false; } }
async function submit(){ if(!form.content.trim() || submitting.value) return; submitting.value=true; statusMessage.value=''; try { await apiRequest('/comment/add',{ method:'POST', body:JSON.stringify({ essaySlug:props.essaySlug, content:form.content.trim(), nickname:form.nickname.trim() || '匿名访客' }) }); form.content=''; statusType.value='success'; statusMessage.value='评论已寄出，审核通过后会出现在这里。'; } catch(error){ statusType.value='error'; statusMessage.value=error instanceof Error ? error.message : '评论提交失败，请稍后重试。'; } finally { submitting.value=false; } }
</script>
<style scoped>
.comment-section { margin-top:54px; padding-top:44px; border-top:1px solid var(--color-fog); }
.comment-heading { display:flex; align-items:end; justify-content:space-between; gap:20px; margin-bottom:28px; }
.eyebrow { margin:0 0 8px; color:var(--color-signal); font:700 .68rem/1 var(--font-ui); letter-spacing:.18em; }
.comment-heading h2,.form-intro h3 { margin:0; color:var(--color-text); font-family:var(--font-display); letter-spacing:-.03em; }
.comment-heading h2 { font-size:clamp(1.8rem,4vw,2.6rem); }
.comment-count { color:var(--color-text-faint); font:var(--text-xs) var(--font-ui); }
.comment-skeleton { display:grid; gap:12px; margin-bottom:28px; } .comment-skeleton span { height:88px; border-radius:var(--radius-md); background:linear-gradient(90deg,var(--color-surface-raised),var(--color-surface),var(--color-surface-raised)); background-size:200% 100%; animation:skeleton 1.4s linear infinite; } @keyframes skeleton { to { background-position:-200% 0; } }
.state-card { position:relative; overflow:hidden; margin-bottom:30px; padding:30px; border:1px dashed var(--color-fog-strong); border-radius:var(--radius-md); background:var(--color-surface-raised); text-align:center; }
.state-card strong { display:block; color:var(--color-text); font:600 1rem var(--font-display); } .state-card p { margin:7px auto 0; max-width:420px; color:var(--color-text-muted); font-size:var(--text-sm); }
.state-mark { position:absolute; left:18px; top:-18px; color:var(--primary-color-light); font:700 7rem/1 var(--font-display); }
.error-state button { margin-top:16px; padding:8px 14px; border:1px solid var(--color-fog); border-radius:999px; background:var(--color-surface); color:var(--color-text); cursor:pointer; }
.comment-list { display:grid; gap:14px; margin-bottom:34px; }
.comment-item { display:grid; grid-template-columns:42px minmax(0,1fr); gap:16px; padding:20px 0; border-top:1px solid var(--color-fog); }
.comment-index { padding-top:4px; color:var(--color-text-faint); font:600 var(--text-xs) var(--font-mono); }
.comment-meta { display:flex; align-items:center; gap:10px; }
.avatar { display:grid; place-items:center; width:34px; height:34px; border-radius:11px; background:var(--color-ink); color:var(--color-on-ink); font:700 var(--text-xs) var(--font-ui); }
.comment-meta div:last-child { display:flex; flex-direction:column; gap:2px; } .comment-meta strong,.reply-item strong { color:var(--color-text); font:600 var(--text-sm) var(--font-ui); } time { color:var(--color-text-faint); font:var(--text-xs) var(--font-ui); }
.comment-content { margin:13px 0 0; color:var(--color-text); font-size:var(--text-sm); line-height:1.8; white-space:pre-wrap; }
.reply-list { display:grid; gap:10px; margin-top:16px; padding-left:16px; border-left:2px solid var(--color-signal); }
.reply-item { padding:14px 16px; border-radius:0 var(--radius-sm) var(--radius-sm) 0; background:var(--color-surface-raised); } .reply-item header { display:flex; align-items:center; gap:8px; } .avatar.small { width:26px; height:26px; border-radius:8px; background:var(--color-signal); } .reply-item time { margin-left:auto; } .reply-item p { margin:8px 0 0; color:var(--color-text-muted); font-size:var(--text-sm); line-height:1.7; }
.comment-form { display:grid; grid-template-columns:minmax(0,1fr) 190px; gap:18px 22px; padding:28px; border:1px solid var(--color-fog); border-radius:var(--radius-lg); background:var(--color-surface-raised); box-shadow:var(--shadow-soft); }
.form-intro { grid-column:1/-1; display:flex; align-items:end; justify-content:space-between; gap:20px; padding-bottom:20px; border-bottom:1px solid var(--color-fog); } .form-intro h3 { font-size:1.55rem; } .form-intro > p { max-width:300px; margin:0; color:var(--color-text-muted); font-size:var(--text-xs); text-align:right; }
.field { display:flex; flex-direction:column; gap:8px; } .field > span { color:var(--color-text-muted); font:600 var(--text-xs) var(--font-ui); } .field > span small { font-weight:400; color:var(--color-text-faint); }
.message-field { grid-column:1/2; grid-row:3/5; position:relative; } .nickname-field { grid-column:2/3; }
.field input,.field textarea { width:100%; border:1px solid var(--color-fog); border-radius:var(--radius-sm); background:var(--color-surface); color:var(--color-text); font:var(--text-sm)/1.7 var(--font-body); transition:border-color var(--motion-fast),box-shadow var(--motion-fast); }
.field input { height:44px; padding:0 13px; } .field textarea { min-height:150px; padding:12px 14px 30px; resize:vertical; }
.field input:focus,.field textarea:focus { outline:none; border-color:var(--color-signal); box-shadow:0 0 0 3px var(--primary-color-light); }
.counter { position:absolute; right:12px; bottom:9px; color:var(--color-text-faint); font:var(--text-xs) var(--font-mono); }
.form-footer { grid-column:2/3; display:flex; flex-direction:column; align-items:stretch; justify-content:end; gap:12px; } .privacy { margin:0; color:var(--color-text-faint); font-size:.7rem; line-height:1.5; }
.submit { display:flex; align-items:center; justify-content:space-between; min-height:46px; padding:0 15px; border:0; border-radius:var(--radius-sm); background:var(--color-ink); color:var(--color-on-ink); cursor:pointer; font:600 var(--text-sm) var(--font-ui); transition:transform var(--motion-fast),background var(--motion-fast); } .submit:hover:not(:disabled) { transform:translateY(-1px); background:var(--color-signal); } .submit:disabled { cursor:not-allowed; opacity:.45; }
.status-message { grid-column:1/-1; margin:0; padding:10px 12px; border-radius:var(--radius-sm); font-size:var(--text-xs); } .status-message.success { background:rgb(109 155 120 / .12); color:var(--color-success); } .status-message.error { background:rgb(198 106 98 / .12); color:var(--color-danger); }
@media (max-width:680px) { .comment-section { margin-top:40px; padding-top:32px; } .comment-heading,.form-intro { align-items:flex-start; flex-direction:column; } .form-intro > p { text-align:left; } .comment-form { grid-template-columns:1fr; padding:20px; } .message-field,.nickname-field,.form-footer { grid-column:1; grid-row:auto; } .comment-item { grid-template-columns:28px minmax(0,1fr); gap:10px; } }
</style>
