
<script>
import html2canvas from 'html2canvas'
export default {
  props: {
    currentColor: Object,
    type: Array,
  },
  emits: ['changeColor', 'IDChanged'],
  data() {
    return {
      activeID: 1,
      gradientColors: [
        {color: {
            hex: "#D7E821",
            hex8: '#D7E821FF',
            hsl: { h: 65, s: 0.81, l: 0.52, a: 1 },
            hsv: { h: 65, s: 0.84, v: 0.91, a: 1 },
            rgba: { r: 215, g: 232, b: 33, a: 1 },
            a: 1
          }, location: 0, id: 0},
        {color: {
          hex: "#47D18C",
          hex8: "#47D18CFF",
          hsl: { h: 150, s: 0.6, l: 0.55, a: 1 },
          hsv: { h: 150, s: 0.66, v: 0.82, a: 1 },
          rgba: { r: 71, g: 209, b: 140, a: 1 },
          a: 1
        }, location: 100, id: 1}
      ]
    }
  },
  computed: {
    sortedColors() {
      // 按照百分比将颜色排序
      return this.gradientColors.sort((c1, c2) => {
        return c1.location - c2.location
      })
    },
    gradientColor() {
      // bind背景色
      const colorList = this.sortedColors.map(item => {
        return `${item.color.hex} ${item.location}%`
      }).join(', ')
      return `linear-gradient(90deg, ${colorList})`
    },
    gradientColorWithAlpha() {
      // preview-box背景色
      const colorList = this.sortedColors.map(item => {
        return `${item.color.hex8} ${item.location}%`
      }).join(', ')
      return `${this.type[0]}-gradient(${this.type[1]}, ${colorList})`
    }
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
          const percent = newX * 100 / 1120
          // 更新point位置
          point.style.left = `${newX}px`
          // 更新gradient对象中对应颜色的location
          this.gradientColors.forEach(colorItem => {
            if (colorItem.id === this.activeID) {
              colorItem.location = percent
            }
          })
        }
        // 鼠标抬起事件
        const onMouseUp = () => {
          // 移除事件绑定
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
          document.ondragstart = null
          document.onselectstart = null
        }
        // 禁用文档拖拽和选择事件
        document.ondragstart = () => false
        document.onselectstart = () => false
        // 绑定鼠标移动和抬起事件
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }
    },
    async addColor(e) {
      const canvas = await html2canvas(this.$refs['color-bind'], {
        useCORS: true,
        scale: window.devicePixelRatio,
      })

      const rect = this.$refs['color-bind'].getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const ctx = canvas.getContext("2d")
      const pixelData = Array.from(ctx.getImageData(x, y, 1, 1).data)
      const [r, g, b, a] = pixelData
      const id = Date.now()
      const hex = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
      const hex8 = hex + a.toString(16)
      this.gradientColors.push({color: {
        hex,
        hex8,
        rgba: {r, g, b, a}
      }, location: (x - 10) * 100 / 1120, id})
      this.activeID = id
    },
    focusLabel(e, id) {
      this.activeID = id
      const input = e.target
      const changeLocation = () => {
        for (const colorItem of this.gradientColors) {
          if (colorItem.id === this.activeID) {
            const newLocation = Math.max(0, Math.min(100, parseInt(input.value)))
            if (isNaN(newLocation)) {
              input.value = colorItem.location
            }else {
              colorItem.location = newLocation
            }
            break
          }
        }
      }
      input.addEventListener('keydown', (e1) => {
        if (e1.key === 'Enter') {
          changeLocation()
          input.removeEventListener('blur', changeLocation)
          input.blur()
        }
      })
      input.addEventListener('blur', changeLocation)
    }
  },
  watch: {
    currentColor: {
      handler() {
        this.gradientColors.forEach(colorItem => {
          if (colorItem.id === this.activeID) {
            colorItem['color'] = this.currentColor
          }
        })
      },
      deep: true,
      immediate: true,
    },
    activeID() {
      for (const colorItem of this.gradientColors) {
        if (colorItem.id === this.activeID) {
          this.$emit('IDChanged', colorItem.color)
          break
        }
      }
    },
    gradientColorWithAlpha: {
      handler() {
        this.$emit('changeColor', this.gradientColorWithAlpha)
      },
      immediate: true
    },
  },
  mounted() {
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement.tagName !== 'INPUT') {
          if (this.gradientColors.length > 2) {
            const deleteIndex = this.gradientColors.findIndex(colorItem => {
              return colorItem.id === this.activeID
            })
            this.gradientColors.splice(deleteIndex, 1)
            this.activeID = this.gradientColors[Math.floor(this.gradientColors.length / 2)].id
          }
        }
      }
    })
  }
}
</script>


<template>
  
  <div
    class="color-bind"
    ref="color-bind"
    @mousedown="movePointer">
    <div class="bind-background" :style="{'background-image': gradientColor}" @click="addColor"></div>
    <div class="bind-point"
      v-for="item of gradientColors"
      :key="item.id"
      :data-id="item.id"
      :style="{'left': `${item.location * 0.01 * 1120}px`, 'background-color': `${item.color.hex}`}"
      :class="{'active': item.id === activeID}">
      <div class="point-visual"></div>
      <input class="point-label" :value="parseInt(item.location)" @focus="focusLabel($event, item.id)">
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