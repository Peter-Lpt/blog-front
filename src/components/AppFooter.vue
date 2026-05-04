<template>
  <footer class="app-footer">
    <p>&copy; {{ new Date().getFullYear() }} Qs Blog. All rights reserved.</p>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  text-align: center;
  padding: 24px 20px;
  color: var(--text-secondary);
  font-size: 13px;
  border-top: 1px solid var(--border-color);
}
</style>
