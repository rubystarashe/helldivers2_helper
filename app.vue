<template>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup>
onMounted(async () => {
  ipcRenderer.on('initRoute', route => {
    useRouter().push(route)
  })
  ipcRenderer.send('initRoute')
})
</script>

<style lang="scss">
.p-dialog-mask {
  z-index: 0 !important;
}
.toast {
  z-index: 99999999;
}
.p-toast-detail {
  word-break: keep-all;
}
.p-popover {
  pointer-events: none !important;
}
body, pre {
  background: rgba(0, 0, 0, 0);
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  margin: 0;
  overflow: hidden;
  font-family: "Inter", "Noto Sans KR", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}
a:hover, a:visited, a:link, a:active {
  text-decoration: none;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input {
  font-family: "Inter", "Noto Sans KR", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}
input[type="date"], textarea, button {
  font-family: "Inter", "Noto Sans KR", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}
input[type=number] {
  -moz-appearance: textfield;
}
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
::-webkit-scrollbar-thumb {
    background: rgb(110, 112, 116);
    border-radius: 10px;
}
// ::-webkit-scrollbar-track {
//     background: rgb(43, 45, 49);
//     border-radius: 10px;
// }
</style>
