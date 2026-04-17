<template>
  <div class="settings">
    <h1>系统设置</h1>
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicForm" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统logo">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :on-change="handleLogoChange"
                :auto-upload="false"
              >
                <img v-if="basicForm.logoUrl" :src="basicForm.logoUrl" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="版权信息">
              <el-input v-model="basicForm.copyright" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasic">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="安全设置" name="security">
          <el-form :model="securityForm" label-width="120px">
            <el-form-item label="登录超时">
              <el-input-number v-model="securityForm.timeout" :min="5" :max="120" />
              <span style="margin-left: 10px;">分钟</span>
            </el-form-item>
            <el-form-item label="强制双重认证">
              <el-switch v-model="securityForm.twoFactor" />
            </el-form-item>
            <el-form-item label="密码策略">
              <el-checkbox-group v-model="securityForm.passwordPolicy">
                <el-checkbox value="requireUppercase">必须包含大写字母</el-checkbox>
                <el-checkbox value="requireLowercase">必须包含小写字母</el-checkbox>
                <el-checkbox value="requireNumbers">必须包含数字</el-checkbox>
                <el-checkbox value="requireSpecialChars">必须包含特殊字符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSecurity">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="通知设置" name="notification">
          <el-form :model="notificationForm" label-width="120px">
            <el-form-item label="邮件通知">
              <el-switch v-model="notificationForm.email" />
            </el-form-item>
            <el-form-item label="站内信通知">
              <el-switch v-model="notificationForm.inApp" />
            </el-form-item>
            <el-form-item label="推送通知">
              <el-switch v-model="notificationForm.push" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveNotification">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const activeTab = ref('basic')

const basicForm = reactive({
  systemName: '采集分析Claw',
  logoUrl: '',
  copyright: 'Copyright © 2024 采集分析Claw. All rights reserved.'
})

const securityForm = reactive({
  timeout: 30,
  twoFactor: false,
  passwordPolicy: ['requireUppercase', 'requireNumbers']
})

const notificationForm = reactive({
  email: true,
  inApp: true,
  push: false
})

const handleLogoChange = (file: any) => {
  // 这里应该处理文件上传
  basicForm.logoUrl = URL.createObjectURL(file.raw)
}

const saveBasic = () => {
  ElMessage.success('基本设置已保存')
}

const saveSecurity = () => {
  ElMessage.success('安全设置已保存')
}

const saveNotification = () => {
  ElMessage.success('通知设置已保存')
}
</script>

<style scoped>
.settings {
  padding: 20px;
}

.avatar-uploader .avatar {
  width: 120px;
  height: 120px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}
</style>