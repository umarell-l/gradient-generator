
<script>
import { mapWritableState } from 'pinia'
import { gradientStore } from '@/stores/gradient'
import html2canvas from 'html2canvas'
export default {
  computed: {
    ...mapWritableState(gradientStore, [
      'gradientColors',
      'activeID',
    ]),
    // bind背景色
    bindBg() {
      const colorList = this.gradientColors.map(color => {
        return `rgb(${color.r}, ${color.g}, ${color.b}) ${color.stop}%`
      }).join(', ')
      return `linear-gradient(90deg, ${colorList})`
    },
  },
  methods: {
    movePointer(e1) {
      // 获取类名列表
      const classList = Array.from(e1.target.classList)
      let point = null
      // 通过类名列表确定当前按下的point
      if (classList.indexOf('bind-point') !== -1) {
        point = e1.target
      } else if (classList.indexOf('point-visual') !== -1) {
        point = e1.target.parentElement
      }
      // 如果point被按下，触发activeID更新，并绑定拖动事件
      if (point) {
        // activeID更新
        this.activeID = Number(point.dataset.id)
        const bind = this.$refs['color-bind']
        const initialX = bind.offsetLeft
        // 拖动事件
        const onMouseMove = (e2) => {
          // 计算新的point位置
          const newX = Math.max(0, Math.min(e2.clientX - initialX - 10, 1120))
          // 计算新的位置在bind中的百分比
          console.log()
          const newStop = newX * 100 / 1120
          // 更新point位置
          point.style.left = `${newX}px`
          // 更新gradientColors对象中对应颜色的stop
          for (const color of this.gradientColors) {
            if (color.id === this.activeID) {
              color.stop = newStop
              break
            }
          }
        }
        // 鼠标抬起事件
        const onMouseUp = () => {
          // 移除事件绑定
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
          document.onselectstart = null
        }
        // 禁用文档选择事件
        document.onselectstart = () => false
        // 绑定鼠标移动和抬起事件
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }
    },
    async addColor(e) {
      // 创建canvas画布
      const canvas = await html2canvas(this.$refs['color-bind'], {
        useCORS: true,
        scale: window.devicePixelRatio,
      })

      const rect = this.$refs['color-bind'].getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const ctx = canvas.getContext("2d")
      const pixelData = Array.from(ctx.getImageData(x, y, 1, 1).data)
      // 获取点击位置的颜色信息
      const [r, g, b, a] = pixelData
      const stop = (x - 10) * 100 / 1120
      const id = Date.now()
      // 新建颜色断点对象
      const newColor = {r, g, b, a, stop, id}
      this.gradientColors.push(newColor)
      this.activeID = id
    },
    focusLabel(e, id) {
      this.activeID = id
      const input = e.target
      // 定义改变颜色stop函数
      const changeStop = () => {
        const newStop = Math.max(0, Math.min(100, parseInt(input.value)))
        if (isNaN(newStop)) {
          input.value = color.stop
        }else {
          for (const color of this.gradientColors) {
            if (color.id === this.activeID) {
              color.stop = newStop
              break
            }
          }
        }
      }
      input.addEventListener('keydown', (e1) => {
        if (e1.key === 'Enter') {
          changeStop()
          input.removeEventListener('blur', changeStop)
          input.blur()
        }
      })
      input.addEventListener('blur', changeStop)
    }
  }
}
</script>


<template>
  
  <div
    class="color-bind"
    ref="color-bind"
    @mousedown="movePointer">
    <div class="bind-background" :style="{'background-image': bindBg}" @click="addColor"></div>
    <div class="bind-point"
      v-for="color of gradientColors"
      :key="color.id"
      :data-id="color.id"
      :style="{'left': `${color.stop * 0.01 * 1120}px`, 'background-color': `rgb(${color.r}, ${color.g}, ${color.b})`}"
      :class="{'active': color.id === activeID}">
      <div class="point-visual"></div>
      <input class="point-label" :value="parseInt(color.stop)" @focus="focusLabel($event, color.id)">
    </div>
  </div>
</template>


<style lang="less">
:root {
  --bind-bg-left: 5px;
  --bind-bg-bottom: 30px;
  --bind-height: 24px;
  --bind-width: calc(100% - 2 * var(--bind-bg-left));
  --bind-bg-border: 1px solid #ddd;
  --bind-radius: 12px;

  --bind-point-top: -4px;
  --bind-point-width: 20px;
  --bind-point-height: 32px;
  --bind-point-border: 3px solid #414141;
  --bind-point-radius: 10px;
  --bind-visual-width: 14px;
  --bind-visual-height: 26px;
  --bind-visual-radius: 7px;
  --bind-label-left: -12px;
  --bind-label-top: 41px;
  --bind-label-width: 40px;
  --bind-labal-height: 30px;
  --bind-label-border: 1px solid #ccc;
  --bind-label-radius: 5px;
  --bind-label-font-size: 16px;
  --bind-label-active-top: 34px;
  --bind-label-active-border: 2px solid #777;
  .color-bind {
    border-bottom: 1px solid #eee;
    position: relative;
    .bind-background {
      width: var(--bind-width);
      height: var(--bind-height);
      margin-left: var(--bind-bg-left);
      margin-bottom: var(--bind-bg-bottom);
      border: var(--bind-bg-border);
      border-radius: var(--bind-radius);
      cursor: copy;
    }
    .bind-point {
      position: absolute;
      top: var(--bind-point-top);
      width: var(--bind-point-width);
      height: var(--bind-point-height);
      border: var(--bind-point-border);
      border-radius: var(--bind-point-radius);
      cursor: pointer;
      .point-visual {
        width: var(--bind-visual-width);
        height: var(--bind-visual-height);
        border: 2px solid #fff;
        border-radius: var(--bind-visual-radius);
        z-index: -1;
      }
      .point-label {
        position: absolute;
        left: var(--bind-label-left);
        top: var(--bind-label-top);
        width: var(--bind-label-width);
        height: var(--bind-labal-height);
        border: var(--bind-label-border);
        outline: none;
        border-radius: var(--bind-label-radius);
        text-align: center;
        font-size: var(--bind-label-font-size);
      }
    }
    .active {
      transform: scale(1.2);
      box-shadow: 0 0 3px 4px #fff;
      z-index: 1;
      .point-label {
        top: var(--bind-label-active-top);
        border: var(--bind-label-active-border);
      }
    }
  }
}
</style>