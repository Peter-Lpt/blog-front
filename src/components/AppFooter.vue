<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p>&copy; {{ new Date().getFullYear() }} PeterQs' Blog. All rights reserved.</p>
      <div class="footer-links">
        <a href="https://github.com/Peter-Lpt" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  text-align: center;
  padding: 32px 20px;
  color: var(--text-secondary);
  font-size: 13px;
  border-top: 1px solid var(--border-color);
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
}

.footer-links {
  display: flex;
  gap: 16px;

  a {
    color: var(--text-secondary);
    transition: color 0.2s;

    &:hover {
      color: var(--primary-color);
    }
  }
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
