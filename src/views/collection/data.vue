<template>
  <div class="collection-data">
    <div class="header">
      <h1>采集数据处理</h1>
      <el-button
        type="primary"
        @click="handleAdd"
      >
        新增采集数据
      </el-button>
    </div>
    <el-card>
      <template #header>
        <div class="table-header">
          <el-input
            v-model="search"
            placeholder="搜索标题或内容"
            style="width: 300px;"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button
                :icon="Search"
                @click="handleSearch"
              />
            </template>
          </el-input>
          <div>
            <el-button
              :icon="Refresh"
              @click="handleRefresh"
            />
          </div>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="tableData"
      >
        <el-table-column
          prop="title"
          label="标题"
          min-width="150"
        />
        <el-table-column
          prop="time"
          label="采集时间"
          width="180"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.time) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="内容"
          show-overflow-tooltip
        />
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150"
        >
          <template #default="scope">
            <el-button
              size="small"
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑采集数据对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form
        ref="dataFormRef"
        :model="dataForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item
          label="标题"
          prop="title"
        >
          <el-input
            v-model="dataForm.title"
            placeholder="请输入标题"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item
          label="采集时间"
          prop="time"
        >
          <el-date-picker
            v-model="dataForm.time"
            type="datetime"
            placeholder="选择采集时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item
          label="内容"
          prop="content"
        >
          <el-input
            v-model="dataForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitForm"
          >确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="采集数据详情"
      width="600px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="标题">
          {{ currentViewData.title }}
        </el-descriptions-item>
        <el-descriptions-item label="采集时间">
          {{ formatDateTime(currentViewData.time) }}
        </el-descriptions-item>
        <el-descriptions-item label="内容">
          <div class="content-view">{{ currentViewData.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(currentViewData.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(currentViewData.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { dataCollectionsApi } from '@/api'
import type { DataCollectionResponseDto, CreateDataCollectionDto } from '@/api'

type DataCollection = DataCollectionResponseDto

const search = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const viewDialogVisible = ref(false)
const dataFormRef = ref<FormInstance>()

const tableData = ref<DataCollection[]>([])
const currentViewData = reactive<Partial<DataCollection>>({})

const dataForm = reactive<CreateDataCollectionDto & { id?: string }>({
  title: '',
  time: '',
  content: ''
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  time: [
    { required: true, message: '请选择采集时间', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ]
}

onMounted(() => {
  fetchData()
})

const fetchData = () => {
  loading.value = true
  dataCollectionsApi.getDataCollectionsPaged({
    pageNumber: currentPage.value,
    pageSize: pageSize.value
  }).then(response => {
    if (response.code === 0 && response.data) {
      tableData.value = response.data.items || []
      total.value = response.data.totalCount || 0
    } else {
      ElMessage.error(response.message || '获取采集数据失败')
    }
  }).catch(error => {
    ElMessage.error('请求失败：' + error.message)
  }).finally(() => {
    loading.value = false
  })
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleRefresh = () => {
  fetchData()
  ElMessage.success('已刷新')
}

const handleAdd = () => {
  dialogTitle.value = '新增采集数据'
  Object.assign(dataForm, {
    id: undefined,
    title: '',
    time: new Date().toISOString().slice(0, 16),
    content: ''
  })
  dialogVisible.value = true
  nextTick(() => {
    dataFormRef.value?.clearValidate()
  })
}

const handleView = (row: DataCollection) => {
  Object.assign(currentViewData, row)
  viewDialogVisible.value = true
}

const handleDelete = (row: DataCollection) => {
  ElMessageBox.confirm(
    `确定删除采集数据"${row.title}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.info('删除功能待后端接口完善')
  }).catch(() => {
    // 取消
  })
}

const submitForm = () => {
  dataFormRef.value?.validate((valid) => {
    if (valid) {
      dataCollectionsApi.createDataCollection(dataForm).then(response => {
        if (response.code === 0) {
          ElMessage.success('创建成功')
          dialogVisible.value = false
          fetchData()
        } else {
          ElMessage.error(response.message || '创建失败')
        }
      }).catch(error => {
        ElMessage.error('创建失败：' + error.message)
      })
    }
  })
}

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}
</script>

<style scoped>
.collection-data {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.content-view {
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}
</style>
