<template>
  <div class="wm-upload">
    <span @click="materialVisible = true" v-if="fileList.length != uploadNum && isUpload">
      <div class="el-upload el-upload--picture-card" v-if=" type<3">
        <i class="el-icon-plus"></i>
      </div>
      <el-button v-else-if="type!==1" size="mini">选择文件</el-button>
    </span>
    <ul class="el-upload-list" :class="type<3? 'el-upload-list--picture-card':'el-upload-list--text'">
      <li
        tabindex="0"
        class="el-upload-list__item is-success"
        v-for="(item, index) in fileList"
        v-bg
        :data-url="type < 3 ? getThumbnail( type === 1 ? item : '', {q_t:5}) : ''"
        :key="item"
      >
        <a class="el-upload-list__item-name" @click="videoPreview(item, index)">
          <i class="el-icon-document"></i>
        </a>
        <label class="el-upload-list__item-status-label">
          <i class="el-icon-upload-success el-icon-check"></i>
        </label>
        <i class="el-icon-close" v-if="isUpload" @click="removeFile(item,index)"></i>
        <i class="el-icon-close-tip">按 delete 键可删除</i>
        <!---->
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-preview" @click="pictureCardPreview(item, index)">
            <i class="el-icon-zoom-in"></i>
          </span>
          <span v-if="isUpload" class="el-upload-list__item-delete" @click="removeFile(item,index)">
            <i class="el-icon-delete"></i>
          </span>
        </span>
      </li>
    </ul>
    <el-dialog append-to-body title="选择文件" top="10vh" :visible.sync="materialVisible" width="990px">
      <material v-model="materialVisible" @on-send="materialSend" :type="type" :upload-num="uploadNum - fileList.length" :media="media"></material>
    </el-dialog>

    <preview v-model="previewVisible" :url="previewUrl" :type="type"/>
  </div>
</template>

<script>
import Material from '@/components/Material'
import { getThumbnail } from '@/utils'
import Preview from '@/components/Preview'
import bg from '@/directives/imgBg'

export default {
  data() {
    return {
      previewVisible: false,
      materialVisible: false,
      previewUrl: '',
      tempFiles: this.value || ''
    }
  },
  directives: {
    bg
  },
  props: {
    type: {
      type: Number,
      default: 1
    },
    value: {
      type: [Array, String],
      default: null
    },
    uploadNum: {
      type: Number,
      default: 1
    },
    media: {
      type: Boolean,
      default: false
    },
    isUpload: {
      type: Boolean,
      default: true
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  components: { Material, Preview },
  methods: {
    getThumbnail,
    // 素材框 确定选择 返回数据
    materialSend(data) {
      console.log(data)
      if (this.multiple) {
        var urls = data.map(v => v.data_url)
        this.tempFiles = this.tempFiles.concat(urls)
      } else {
        this.tempFiles = data[0].data_url
      }
    },
    // 删除文件
    removeFile(item, index) {
      if (this.multiple) {
        this.tempFiles.splice(index, 1)
      } else {
        this.tempFiles = ''
      }
    },
    pictureCardPreview(item) {
      this.previewUrl = item
      this.previewVisible = true
    },
    videoPreview(item) {
      if (this.type === 2) {
        this.previewUrl = item
        this.previewVisible = true
      }
    }
  },
  computed: {
    fileList() {
      var fileList = []
      if (this.multiple && this.tempFiles) {
        this.tempFiles.map((v, i) => {
          fileList[i] = v
        })
      } else {
        fileList = this.tempFiles ? [this.tempFiles] : []
      }
      return fileList
    }
  },
  watch: {
    value(val) {
      this.tempFiles = val || ''
    },
    tempFiles(val) {
      this.$emit('input', val)
    }
  }
}
</script>

<style lang="scss">
.wm-upload {
  .el-upload-list--text {
    .el-upload-list__item-actions {
      display: none;
    }
  }
}
.preview {
  img {
    max-width: 100%;
    max-height: 100%;
  }
  .el-dialog {
    text-align: center;
    margin-bottom: 0;
    height: 96%;
    margin-top: 10px;
  }
  .el-dialog__body {
    padding: 0;
    height: 88%;
  }
}
</style>
