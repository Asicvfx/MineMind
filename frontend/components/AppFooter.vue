<template>
  <footer class="py-12 px-6 border-t border-border/40 mt-20">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <Logo :size="32" />
        <span class="font-bold">MineMind</span>
      </div>
      <div class="flex items-center gap-6 text-sm text-muted-foreground">
        <NuxtLink to="/pricing" class="hover:text-foreground transition-colors">Pro</NuxtLink>
        <NuxtLink to="/leaderboard" class="hover:text-foreground transition-colors">Рейтинг</NuxtLink>
        <a href="https://github.com" target="_blank" rel="noopener" class="hover:text-foreground transition-colors">GitHub</a>
      </div>
      <div class="text-xs text-muted-foreground">
        © {{ year }} MineMind. Brain training через Сапёр.
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>
