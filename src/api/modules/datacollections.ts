import request from '@/api/request'
import type { ApiResponse, PagedResponse, CreateDataCollectionDto, DataCollectionResponseDto, PagedRequest } from '@/api/types'

export const dataCollectionsApi = {
  // 分页获取采集数据
  getDataCollectionsPaged(params: PagedRequest) {
    return request.get<ApiResponse<PagedResponse<DataCollectionResponseDto>>>('/api/datacollections', {
      params: {
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize || 10
      }
    })
  },

  // 创建采集数据
  createDataCollection(data: CreateDataCollectionDto) {
    return request.post<ApiResponse<DataCollectionResponseDto>>('/api/datacollections', data)
  }
}
