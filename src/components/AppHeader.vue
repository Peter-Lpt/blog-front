<template>
  <header class="app-header">
    <div class="header-content">
      <router-link to="/" class="logo">Qs Blog</router-link>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/friend-links">友链</router-link>
        <router-link to="/admin">后台</router-link>
      </nav>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  background: $glass-bg;
  backdrop-filter: blur($glass-blur);
  -webkit-backdrop-filter: blur($glass-blur);
  border-bottom: $glass-border;
  box-shadow: $glass-shadow;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

nav {
  display: flex;
  gap: 24px;

  a {
    color: rgba(255, 255, 255, 0.75);
    font-size: 15px;
    transition: color 0.2s;

    &:hover,
    &.router-link-exact-active {
      color: #fff;
    }
  }
}
</style>
