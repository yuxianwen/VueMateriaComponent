
/* eslint-disable */
import COS from 'cos-js-sdk-v5'
// import { randomWord } from '@/utils'
import { getFileSign, getFileUploadUrl } from '@/api/common/file'
import Hashes from 'jshashes'

export default {
  data() {
    return {
      cosInfo: null,
      uploadImgUrl: '',
      uploadVideoUrl: '',
      imgHost: undefined,
      videoHost: undefined,
      cos: null
    }
  },
  created() {
    this.initCos()
  },
  methods: {
    // 初始化腾讯云对象存储实例
    initCos() {
      this.cos = new COS({
        getAuthorization: (options, callback) => {
          // 异步获取签名
          getFileSign({
            method: (options.Method || 'get').toLowerCase(),
            pathname: '/' + (options.Key || ''),
            type: this.getFileType(),
            site: 'qcloud'
          }).then(res => {
            callback(res.data.data.authorization)
          })
        }
      })
    },

    // 获取上传地址
    async getFileUploadUrl() {
      var data, res
      switch (this.getFileType()) {
        case 'img':
        case 'open_img':
          if (!this.uploadImgUrl) {
            res = await getFileUploadUrl({ type: this.getFileType() })
            data = res.data.data
            this.uploadImgUrl = data.upload_url
            this.imgHost = data.show_url
            this.cosInfo = {
              bucket: data.bucket,
              region: data.region
            }
            return true
          } else {
            return true
          }
        case 'video':
          if (!this.uploadVideoUrl) {
            res = await getFileUploadUrl({ type: this.getFileType() })
            data = res.data.data
            this.uploadVideoUrl = data.upload_url
            this.videoHost = data.show_url
            this.cosInfo = {
              bucket: data.bucket,
              region: data.region
            }
            return true
          } else {
            return true
          }
        case 'pan':
          return false
        default:
          return false
      }
    },
    // 文件上传到腾讯COS
    async uploadTecent(file) {
      // 文件上传之前的一些处理
      // 生成文件key
      if (await this.getFileUploadUrl()) {
        return new Promise((resolve, reject) => {
          var key = this.getTempFileKey(file.name)
          console.log(key)
          this.cos.putObject(
            {
              Bucket: this.cosInfo.bucket,
              Region: this.cosInfo.region,
              Key: key,
              Body: file,
              onProgress: progressData => {
                console.log('上传进度：', progressData)
                this.uploading && this.uploading(progressData)
              }
            },
            (err, data) => {
              // fileInfo.up_dateline = Date.parse(new Date()) / 1000;
              if (err) {
                console.log('上传错误:', err)
                this.$message.error('cos_error:' + (err.error || '上传错误！'))
                reject(err)
              } else {
                console.log('上传成功:', data, data.name, file)
                var fileItem = {
                  data_url:
                    (['img', 'open_img'].includes(this.getFileType())
                      ? this.imgHost
                      : this.videoHost) + key,
                  file_name: file.name,
                  file_size: file.size,
                  type: ['img', 'open_img'].includes(this.getFileType())
                    ? 1
                    : 2,
                  key,
                  bucket: this.cosInfo.bucket
                }
                resolve(fileItem)
              }
            }
          )
        })
      } else {
        return false
      }
    },
    // 生成文件key
    getTempFileKey(fileName) {
      var platform = 'pc'
      var app = this.$store.getters.system
      var empNo = this.$store.getters.userInfo.emp_no
      // var md5 = randomWord(false, 32)
      var randomString = new Hashes.SHA1().hex(Date.now().toString())
      var extName = fileName.split('.')
      var index = extName.length - 1
      extName = index ? '.' + extName[index] : ''
      return `${platform}.${app}.${empNo}.${randomString + extName}`
    },
    removeFile(file, fileList) {
      console.log('removeFile')
      return false
    }
  }
}
