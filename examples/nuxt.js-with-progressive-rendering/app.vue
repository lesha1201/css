<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const CSSProvider = defineAsyncComponent(async () => (await import('@master/css.vue')).CSSProvider)
</script>

<template>
    <CSSProvider :config="import('./master.css')">
        <NuxtWelcome class="{font:32!;font:heavy!;my:20;ls:-.02em}_h1@sm" />
    </CSSProvider>
</template>
