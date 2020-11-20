// import { http } from '@/utils/axios'
// import stroe from '@/store'

// const system = stroe.getters.system
// var path = system === 'podcasts' ? 'space/' : ''
// 获取素材列表
export function getMaterialList(params) {
  return new Promise((resolve)=>{
    resolve({params})
  })
}

// 添加素材
export function addMaterial(params) {
  return new Promise((resolve)=>{
    resolve({params})
  })
}

// 删除素材信息
export function deleteMaterial(id) {
  return new Promise((resolve)=>{
    resolve({id})
  })
}
