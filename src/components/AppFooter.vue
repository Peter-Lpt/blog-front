<template>
  <footer class="app-footer">
    <p>&copy; {{ new Date().getFullYear() }} Qs Blog. All rights reserved.</p>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  text-align: center;
  padding: 20px;
  color: $text-secondary;
  font-size: 14px;
  border-top: 1px solid $border-color;
  background: #fff;
}
</style>
