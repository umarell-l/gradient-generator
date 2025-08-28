import { defineStore } from "pinia"

export const gradientStore = defineStore('gradient', {
  state() {
    return {
      // 当前预设索引
      presetIndex: 0,
      // 预设渐变数组
      presetList: [
        {
          type: ['conic', '30deg'],
          gradientColors: [
            {r: 144, g: 184, b: 232, a: 1, stop: 0, id: 0},
            {r: 238, g: 174, b: 202, a: 1, stop: 100, id: 1},
          ],
        }
      ],
      // 当前（渐变）类型
      type: [],
      // 渐变颜色断点数组
      gradientColors: [],
      // 当前颜色id
      activeID: undefined,
      // 当前颜色
      currentColor: null,
    }
  }
})