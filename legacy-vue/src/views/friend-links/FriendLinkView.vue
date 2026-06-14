<template>
  <div class="friend-link-view">
    <h1 class="page-title">友链</h1>
    <div class="link-grid">
      <div v-for="link in links" :key="link.linkId" class="link-card">
        <a :href="link.url" target="_blank" rel="noopener noreferrer">
          <img v-if="link.logo" :src="link.logo" :alt="link.name" class="link-logo"/>
          <div v-else class="link-logo-placeholder">{{ link.name[0] }}</div>
          <h3>{{ link.name }}</h3>
          <p>{{ link.description }}</p>
        </a>
      </div>
    </div>
    <el-empty v-if="!links.length" description="暂无友链"/>

    <div class="apply-section">
      <el-divider/>
      <el-button type="primary" @click="showApplyDialog = true">申请友链</el-button>
      <p class="apply-tip">交换友链请先将本站加入您的友情链接，然后填写以下信息提交申请。</p>
    </div>

    <el-dialog v-model="showApplyDialog" title="申请友链" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="网站/博客名称"/>
        </el-form-item>
        <el-form-item label="地址" prop="url">
          <el-input v-model="form.url" placeholder="https://example.com"/>
        </el-form-item>
        <el-form-item label="Logo">
          <el-input v-model="form.logo" placeholder="Logo 图片链接（选填）"/>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="简短描述（选填）"/>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="联系邮箱（选填）"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showApplyDialog = false">取消</el-button>
        <el-button type="primary" @click="handleApply">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import type {FormInstance, FormRules} from 'element-plus'
import {ElMessage} from 'element-plus'
import {applyFriendLink, getFriendLinkList} from '@/api/friendLink'

const links = ref<FriendLink[]>([])

onMounted(async () => {
  const data = await getFriendLinkList({status: 1}) as unknown as FriendLink[]
  links.value = data || []
})

const showApplyDialog = ref(false)
const formRef = ref<FormInstance>()
const form = reactive<FriendLinkForm>({
  name: '',
  url: '',
  logo: '',
  description: '',
  email: '',
})

const rules: FormRules = {
  name: [{required: true, message: '请输入名称', trigger: 'blur'}],
  url: [
    {required: true, message: '请输入地址', trigger: 'blur'},
    {pattern: /^https?:\/\//, message: '请输入有效的网址', trigger: 'blur'},
  ],
}

async function handleApply() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  await applyFriendLink(form)
  ElMessage.success('申请已提交，等待审核')
  showApplyDialog.value = false
  formRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
.friend-link-view {
  padding: 20px 0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 24px;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.link-card {
  background: var(--card-bg);
  border: var(--card-border);
  border-radius: var(--card-radius);
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--card-hover-shadow);
    border-color: var(--primary-color);
  }

  a {
    display: block;
    text-align: center;
    color: var(--text-color);
  }

  h3 {
    margin: 12px 0 8px;
    font-size: 16px;
  }

  p {
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.5;
  }
}

.link-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.link-logo-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  margin: 0 auto;
}

.apply-section {
  margin-top: 40px;
  text-align: center;

  .apply-tip {
    color: var(--text-secondary);
    font-size: 13px;
    margin-top: 12px;
  }
}

@media (max-width: 768px) {
  .link-grid {
    grid-template-columns: 1fr;
  }
}
</style>
