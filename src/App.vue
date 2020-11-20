<template>
  <div id="app">
    <upload v-model="src" />
  </div>
</template>

<script>
import Upload from "@/components/Upload/index.vue";
export default {
  name: "app",
  data() {
    return {
      src:
        "https://5b0988e595225.cdn.sohucs.com/images/20191023/081ff180cc7d438cb45b5d74828a264e.jpeg",
    };
  },
  components: {
    Upload,
  },
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
