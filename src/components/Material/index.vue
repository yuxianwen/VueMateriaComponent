<template>
  <div>
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="素材库" name="material">
        <el-row class="mb10">
          <el-col :span="12">
            <el-input class="input-with-select" size="small" v-model="imageParams.key" placeholder="请输入关键字" clearable>
              <el-select v-if="isManager" :disabled="!isManager" v-model="imageParams.type" slot="prepend" @change="loadList(true)">
                <el-option label="图片" :value="1"></el-option>
                <el-option label="视频" :value="2"></el-option>
                <el-option label="文件" :value="3"></el-option>
              </el-select>
              <el-button slot="append" icon="el-icon-search" @click="loadList(true)"></el-button>
            </el-input>
          </el-col>
          <el-col class="tr" :span="12">
            <el-radio-group size="small" v-model="imageParams.sort" @change="loadList(true)">
              <el-radio-button label="1">默认</el-radio-button>
              <el-radio-button label="2">时间</el-radio-button>
            </el-radio-group>
          </el-col>
        </el-row>
        <div v-loading="listLoading">
          <div class="wm-files" :class="{manager: isManager}">
            <el-alert v-if="items.length ==0" title="暂无数据" type="info" center show-icon></el-alert>
            <el-row :gutter="10" v-else>
              <el-col v-for="(item,index) in items" :key="item.id" :span="isManager ? 2: 4">
                <div class="item">
                  <div class="file">
                    <div @click="selectFile(item, index)" :class="{checked: item.status}">
                      <img
                        :src="getThumbnail((imageParams.type ==1 ? item.data_url : item.cover) || '', {q_w:145,q_h:145,q_t:5,u_w:200})"
                        :alt="item.file_name"
                        v-if="imageParams.type !=3"
                      >
                      <i v-if="imageParams.type==2" class="el-icon-caret-right play-icon"></i>
                      <i class="el-icon-document" v-if="imageParams.type ==3"></i>
                      <i class="el-icon-check"></i>
                    </div>
                    <el-row class="action">
                      <el-col :span="8" @click.native="preview(item)">
                        <i class="el-icon-zoom-in"></i>
                      </el-col>
                      <el-col :span="8" @click.native="handleCopy(item.data_url ,$event)">
                        <i class="el-icon-share"></i>
                      </el-col>
                      <el-col :span="8" @click.native="deleteItem(item, index)">
                        <i class="el-icon-delete"></i>
                      </el-col>
                    </el-row>
                  </div>
                  <el-tooltip effect="dark" placement="bottom">
                    <p class="ellipsis">{{item.file_name}}</p>
                    <div slot="content">
                      文件名：{{item.file_name}}
                      <br>
                      大小：{{item.file_size | bytesToSize }}
                    </div>
                  </el-tooltip>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
        <wm-pagination
          :total="total"
          :page-size="imageParams.page_size"
          v-model="imageParams.page"
          @size-change="pageSizeChange"
          @current-change="pageCurrentChange"
        ></wm-pagination>
      </el-tab-pane>
      <el-tab-pane label="本地上传" name="upload">
        <el-upload
          class="upload-demo"
          drag
          action
          :http-request="changeFile"
          :before-remove="removeFile"
          :file-list="uploadFile"
          :on-change="uploadChange"
          :multiple="uploadNum !== 1"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <!-- <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div> -->
        </el-upload>
      </el-tab-pane>
    </el-tabs>
    <template v-if="!isManager">
      <div v-if="activeName === 'material' || (activeName === 'file' && uploadNum === 1) " slot="footer" class="dialog-footer tr">
        <el-button @click="visible=false">取 消</el-button>
        <el-button type="primary" @click="selectOk">确 定</el-button>
      </div>
    </template>
    <preview :title="previewTitle" v-model="previewDialogVisible" :url="previewUrl" :type="previewType"/>
  </div>
</template>

<script>
import { getMaterialList, addMaterial, deleteMaterial } from '@/api/common/material'
import { getMediaId } from '@/api/common/file'
import { bytesToSize, getThumbnail } from '@/utils'
import WmPagination from '@/components/Pagination'
import Preview from '@/components/Preview'
import clip from '@/utils/clipboard'
import upload from '@/mixins/upload'

export default {
  data() {
    return {
      dialogImageUrl: '',
      activeName: 'material',
      dialogVisible: false,
      materialDialogVisible: true,
      previewDialogVisible: false,
      items: [],
      videos: null,
      previewUrl: '',
      previewTitle: '',
      previewType: 1,
      imageParams: {
        key: null,
        per_page: 20,
        page: 1,
        type: this.type,
        sort: 1
      },
      listLoading: false,
      total: 0,
      currentPage: '',
      selects: {},
      curIndex: '',
      uploadFile: [],
      visible: this.value,
      tempFiles: []
    }
  },
  components: { WmPagination, Preview },
  props: {
    value: { type: Boolean, default: false },
    type: { type: Number, default: 1 },
    uploadNum: { type: Number, default: 1 },
    media: {
      type: Boolean,
      default: false
    },
    isManager: {
      type: Boolean,
      default: false
    }
  },
  mixins: [upload],
  created() {
    if (this.items.length === 0) {
      this.loadList()
    }
  },
  methods: {
    /* *** 素材库业务  *** */
    // 加载列表
    loadList(reset = false) {
      reset && (this.imageParams.page = 1)
      this.listLoading = true
      this.selects = {}
      getMaterialList(this.imageParams)
        .then(res => {
          this.searchBtnDisabled = false
          this.listLoading = false
          var data = res.data
          var items = data.data
          for (var i = 0, len = items.length; i < len; i++) {
            items[i].status = false
          }
          this.items = items
          this.total = parseInt(data.total)
          this.currentPage = data.current_page
        })
        .catch(() => {
          this.listLoading = false
          this.items = []
        })
    },
    // 改变每页数量
    pageSizeChange(val) {
      this.imageParams.per_page = val
      this.loadList()
    },
    // 改变页数
    pageCurrentChange(val) {
      this.imageParams.page = val
      this.loadList()
    },
    // 排序
    sort(type) {
      this.imageParams.sort = type
      this.loadList(true)
    },
    // 搜索
    search() {
      this.loadList(true)
      return false
    },
    // 预览
    preview(item) {
      this.previewDialogVisible = true
      this.previewUrl = item.data_url
      this.previewTitle = `${item.file_name}(${bytesToSize(item.file_size)})`
      this.previewType = item.type
    },
    deleteItem(item, index) {
      this.$confirm('你确定要删除该文件吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteMaterial(item.id).then(() => {
          this.items.splice(index, 1)
          this.$message.success('删除成功!')
          this.total--
        })
      })
    },
    // 勾选文件
    selectFile(item, index) {
      if (!this.isManager) {
        var status = this.items[index].status
        if (status) {
          // 取消选择
          delete this.selects[index]
        } else {
          // 选择
          if (this.uploadNum > Object.keys(this.selects).length) {
            this.selects[index] = item
          } else {
            if (this.uploadNum === 1) {
              this.selects = {}
              this.selects[index] = item
              this.curIndex !== '' && (this.items[this.curIndex].status = false)
            } else {
              return this.$message.warning(`最多勾选${this.uploadNum}个文件`)
            }
          }
        }
        this.curIndex = index
        this.items[index].status = !status
      }
    },
    // 选择素材
    selectOk() {
      var selectsNum = Object.keys(this.selects).length
      if (this.activeName === 'material') {
        if (!selectsNum) {
          this.$message('请选择文件！')
          return
        }
        var emitData = []
        // 素材库选择
        emitData = Object.values(this.selects)
      } else if (this.activeName === 'upload') {
        // 本地上传
        emitData = this.tempFiles
      }
      console.log('素材库返回数据：', emitData)
      this.visible = false
      this.uploadFile = []
      this.tempFiles = []
      // 判断是否发到微信中单独处理
      if (this.media) {
        this.getMediaIds(emitData)
      } else {
        this.$emit('on-send', emitData)
        this.items.map(v => (v.status = false))
        this.selects = {}
      }
    },
    // 复制地址
    handleCopy(text, event) {
      clip(text, event)
    },
    // 处理素材库
    getMediaIds(emitData) {
      const loading = this.$loading({
        text: '正在处理中...',
        spinner: 'el-icon-loading',
        fullscreen: false,
        background: 'transparent'
      })
      emitData.map((v, i) => {
        getMediaId(emitData[0].id)
          .then(res => {
            console.log(res)
            emitData[i].media_id = res.data.data.media_id
            if (i === emitData.length - 1) {
              this.$emit('on-send', emitData)
              this.items.map(v => (v.status = false))
              this.selects = {}
            }
          })
          .finally(() => {
            i === emitData.length - 1 && loading.close()
          })
      })
    },

    /* *** 上传业务  *** */
    // 选择附件
    async changeFile(params) {
      var file = params.file
      // console.log(params)
      // 没有选择任何文件 退出
      if (!file) {
        return
      }
      // 判断文件格式是否正确
      let type = this.imageParams.type === 3 ? 'pan' : file.type.split('/')[0]
      if (type === this.getFileType(false)) {
        // 获取上传地址等信息
        // 开始上传到腾讯COS
        if (this.uploadFile.length > this.uploadNum) {
          // 超过上传数量，后续不作处理提示
          this.$message.error(`最多上传${this.uploadNum}个文件，超出的文件本次将不会上传！`)
          this.uploadFile.splice(this.uploadFile.findIndex(v => v.name === file.name), 1)
        } else {
          var fileItem = await this.uploadTecent(file)
          fileItem && this.uploadSuccess(fileItem)
        }
      } else {
        this.$message.error('你上传的文件格式不正确，请重新上传')
        this.uploadFile.splice(this.uploadFile.findIndex(v => v.name === file.name), 1)
      }
    },
    exceedTip() {},
    // 获得文件类型
    getFileType(flag = true) {
      switch (this.imageParams.type) {
        case 1:
          return flag ? 'img' : 'image'
        case 2:
          return 'video'
        case 3:
          return 'pan'
        default:
          return null
      }
    },
    getThumbnail,
    // 上传文件
    uploadChange(file, fileList) {
      this.uploadFile = fileList
    },
    // 正在上传中...
    uploading(progressData) {
      var index = this.uploadFile.length - 1
      this.uploadFile[index].percentage = progressData.percent * 100
      this.uploadFile[index].status = 'uploading'
    },
    // 文件上传成功
    uploadSuccess(fileItem) {
      addMaterial(fileItem).then(res => {
        fileItem.data_url = res.data.data.data_url
        this.tempFiles.push(fileItem)
        if (this.tempFiles.length === this.uploadFile.length) {
          // 文件全部上传成功选择回调
          this.selectOk(false)
        }
      })
    }
  },
  filters: {
    bytesToSize(val) {
      return bytesToSize(val)
    }
  },
  watch: {
    visible(val) {
      this.$emit('input', val)
    },
    value(val) {
      this.visible = val
    }
  }
}
</script>

<style lang="scss">
$primary-color: #c7000a;

.wm-preview {
  text-align: center;
  img,
  video {
    max-width: 100%;
    max-height: 100%;
  }
}

.wm-files {
  height: 470px;
  overflow: auto;
  overflow-x: hidden;
  &.manager {
    height: auto;
  }
  .item {
    border: 1px solid #ddd;
    margin-bottom: 10px;
    position: relative;
    &:hover {
      .file {
        border-color: $primary-color;
      }
      .el-checkbox,
      .action {
        display: block;
      }
    }
    .el-checkbox {
      position: absolute;
      right: 5px;
      top: 5px;
      display: none;
    }
    .is-checked {
      display: inline-block;
    }
    .play-icon {
      position: absolute;
      left: 0;
      right: 0;
      top: 45px;
      font-size: 24px;
      color: white;
      text-align: center;
      line-height: 30px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #0000009e;
      margin: auto;
      cursor: pointer;
    }
    .action {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #000000b5;
      color: white;
      display: none;
      font-size: 16px;
      i {
        line-height: 30px;
        cursor: pointer;
        padding: 0 5px;
        &:hover {
          color: #d7d7d7;
          transition: cubic-bezier(0.075, 0.82, 0.165, 1);
        }
      }
    }
  }
  .file {
    height: 145px;
    text-align: center;
    overflow: hidden;
    position: relative;
    > div {
      // vertical-align: top;
    }
    // &::before {
    //   content: '';
    //   display: inline-block;
    //   vertical-align: middle;
    //   height: 100%;
    // }
    .el-icon-check {
      display: none;
      background-color: white;
    }
    .checked {
      .el-icon-check {
        display: block;
        position: absolute;
        width: 100%;
        text-align: center;
        color: white;
        font-size: 50px;
        top: 0;
        bottom: 0;
        background-color: #000000b5;
        line-height: 145px;
        transition: 0.3s;
      }
    }
    img {
      max-width: 100%;
      max-height: 100%;
    }
    video {
      max-width: 95%;
      max-height: 100%;
    }
    .el-icon-document {
      font-size: 40px;
      color: #999;
      margin-top: 40px;
    }
  }
  p {
    padding: 0 5px;
    cursor: default;
  }
}
// .wm-material-dialog {
// }

.input-with-select {
  .el-input-group__prepend {
    background-color: #fff;
  }
  .el-select .el-input {
    width: 75px;
  }
}
</style>
