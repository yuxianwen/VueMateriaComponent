<template>
  <el-pagination @size-change="pageSizeChange" @current-change="pageCurrentChange" :current-page.sync="currentPage" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
  </el-pagination>
</template>
<script>
export default {
  data() {
    return {
      pageSizes: [20, 40, 60, 80, 100],
      currentPage: this.value
    }
  },
  props: ['pageSize', 'value', 'total'],
  methods: {
    // 改变每页数量
    pageSizeChange(val) {
      this.$emit('size-change', val)
    },
    // 改变页数
    pageCurrentChange(val) {
      this.$emit('current-change', val)
    }
  },
  watch: {
    value() {
      this.currentPage = parseInt(this.value)
    },
    currentPage(val) {
      this.$emit('input', val)
    }
  }
}
</script>
