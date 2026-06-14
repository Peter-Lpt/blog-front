<template>
  <div class="user-area">
    <!-- 已登录：头像 + 下拉 -->
    <div v-if="loggedIn" class="user-menu" @click="toggleDropdown">
      <img :src="avatarUrl" :alt="displayName" class="avatar" v-if="!avatarError" @error="avatarError = true" />
      <div class="avatar fallback" v-else>{{ displayName.charAt(0).toUpperCase() }}</div>

      <div v-if="dropdownOpen" class="dropdown" @click.stop>
        <a v-if="isAdmin" :href="adminUrl" class="dropdown-item admin-link">
          ⚙️ 进入后台
        </a>
        <label class="dropdown-item avatar-upload-item">
          📷 更换头像
          <input type="file" accept="image/*" class="hidden-input" @change="handleAvatarUpload" />
        </label>
        <button class="dropdown-item" @click="handleLogout">退出登录</button>
      </div>
    </div>

    <!-- 未登录：登录按钮 -->
    <button v-else class="login-trigger" @click="showLogin = true">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
      登录
    </button>

    <LoginDialog :visible="showLogin" @close="showLogin = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { SITE } from '@/lib/config';
import { getAvatar } from '@/lib/avatar';
import {
  getUser,
  isLoggedIn,
  isAdmin as checkAdmin,
  logout,
  verifyToken,
  onAuthChange,
  uploadAvatar,
} from '@/lib/auth';
import LoginDialog from './LoginDialog.vue';

const loggedIn = ref(false);
const user = ref(getUser());
const dropdownOpen = ref(false);
const avatarError = ref(false);
const showLogin = ref(false);

const displayName = computed(() => user.value?.nickname || user.value?.username || '用户');
const isAdmin = computed(() => user.value?.role === 'admin');
const adminUrl = '/admin/';
const avatarUrl = computed(() =>
  getAvatar(user.value?.username || 'anonymous', user.value?.avatar)
);

function refresh() {
  user.value = getUser();
  loggedIn.value = isLoggedIn();
}

// 订阅登录态变化（LoginDialog 登录成功后触发）
onAuthChange(refresh);

onMounted(() => {
  refresh();
  // 已登录则校验 token，顺便刷新 role
  if (isLoggedIn()) {
    verifyToken().then(refresh);
  }
  // 点击外部关闭下拉
  document.addEventListener('click', (e) => {
    if (dropdownOpen.value && !(e.target as HTMLElement).closest('.user-menu')) {
      dropdownOpen.value = false;
    }
  });
});

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
}

async function handleAvatarUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  // 预览：本地生成 data URL
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result as string;
    // 乐观更新本地头像
    if (user.value) {
      user.value.avatar = dataUrl;
      localStorage.setItem('blog_user', JSON.stringify(user.value));
      refresh();
    }
  };
  reader.readAsDataURL(file);

  // 上传到后端
  const result = await uploadAvatar(file);
  if (result.ok && result.avatarUrl) {
    // 后端返回正式 URL，替换本地 data URL
    if (user.value) {
      user.value.avatar = result.avatarUrl;
      localStorage.setItem('blog_user', JSON.stringify(user.value));
      refresh();
    }
  }
  // 重置 input 以便重复选择同一文件
  input.value = '';
  dropdownOpen.value = false;
}

async function handleLogout() {
  await logout();
  dropdownOpen.value = false;
  refresh();
}
</script>

<style scoped>
.user-area { position: relative; }
.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 8px;
  transition: background 0.2s;
}
.user-menu:hover { background: var(--glass-bg); }
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar.fallback {
  background: var(--primary-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}
.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: var(--card-bg);
  border: var(--card-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  overflow: hidden;
  z-index: 200;
}
.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color);
  font-size: 14px;
  text-align: left;
  text-decoration: none;
  box-sizing: border-box;
}
.dropdown-item:hover { background: var(--primary-color-light); }
.admin-link {
  color: var(--primary-color);
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  text-decoration: none;
}
.avatar-upload-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.hidden-input {
  display: none;
}
.login-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.login-trigger:hover { opacity: 0.9; }
</style>
