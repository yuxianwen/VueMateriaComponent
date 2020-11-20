/**
 * Features: utils 常用功能集合
 * Author: xianwen.yu
 * Time: 2017-12-20
 */

// 字节转
export function bytesToSize(bytes) {
  if (bytes === 0) {
    return '0 B'
  }
  var k = 1000 // or 1024
  var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  var i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
}

/**
 *
 *
 * @export
 * @param {*} func
 * @param {*} wait
 * @param {*} immediate
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function(...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * @desc 函数节流
 * @param func 函数
 * @param wait 延迟执行毫秒数
 * @param type 1 表时间戳版，2 表定时器版
 */
export function throttle(func, wait = 1000, type = 1) {
  if (type === 1) {
    var previous = 0
  } else if (type === 2) {
    var timeout
  }

  return function() {
    var context = this
    var args = arguments
    if (type === 1) {
      var now = Date.now()

      if (now - previous > wait) {
        func.apply(context, args)
        previous = now
      }
    } else if (type === 2) {
      if (!timeout) {
        timeout = setTimeout(function() {
          timeout = null
          func.apply(context, args)
        }, wait)
      }
    }
  }
}

let videoCover = require('@/assets/img/video_cover.png')
// 获取缩略图地址
export function getThumbnail(url, opts = {}) {
  var params
  if (url) {
    // console.log(url)
    url = url.split('?')
    params = url[1] || ''
    url = url[0]
  }
  opts = Object.assign({ u_w: 200, q_w: 200, q_h: 200, q_t: 2 }, opts)
  if (!url) {
    // url = '/assets/img/default_video_poster.jpg'
    url = videoCover
  } else if (url.indexOf('.upaiyun.com/') > -1) {
    url += `!W${opts.u_w || 200}?${params}`
  } else {
    if (opts.q_w || opts.q_h) {
      url += `?imageView2/${opts.q_t || 2}/w/${opts.q_w || 200}/h/${opts.q_h ||
        200}${params ? '&' + params : ''}`
    } else {
      url += opts.q_c
      url += `${opts.q_c + (params ? '&' + params : '')}`
    }
  }
  return url
}

export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

