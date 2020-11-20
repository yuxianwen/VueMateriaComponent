<template>
  <el-dialog :title="previewTitle" class="wm-preview" :visible.sync="visible" append-to-body>
    <div class="p10" v-if="url">
      <template v-if="type===1">
        <img :src="previewThumbnail" alt>
        <div class="tc">
          <a class="link-type" :href="url" target="_blank">查看原图</a>
        </div>
      </template>
      <video v-if="type ===2" :src="url" controls autoplay></video>
    </div>
  </el-dialog>
</template>

<script>
import { getThumbnail } from '@/utils'

export default {
  data() {
    return {
      visible: this.value
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: Number,
      default: 1
    },
    title: {
      type: String
    },
    url: {
      type: String
    }
  },
  computed: {
    previewTitle() {
      if (this.title) {
        return this.title
      } else {
        var types = {
          1: '图片',
          2: '视频'
        }
        return types[this.type] + '预览'
      }
    },
    previewThumbnail() {
      return this.visible ? (this.type === 1 ? getThumbnail(this.url, { q_w: 800, q_h: 800, u_w: 640 }) : this.url) : ''
    }
  },
  watch: {
    value(val) {
      this.visible = val
    },
    visible(val) {
      this.$emit('input', val)
    }
  }
}
</script>

<style lang="scss">
.wm-preview {
  text-align: center;
  img,
  video {
    max-width: 100%;
  }
}
</style>
