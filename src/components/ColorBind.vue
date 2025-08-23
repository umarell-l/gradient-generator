
<script>
import html2canvas from 'html2canvas'
export default {
  props: {
    currentColor: Object
  },
  data() {
    return {
      activeID: 1,
      gradient: {
        colors: [
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
        ],
        type: 'linear',
        direction: 90,
      }
    }
  },
  computed: {
    sortedColors() {
      return this.gradient.colors.sort((c1, c2) => {
        return c1.location - c2.location
      })
    },
    gradientColor() {
      if (this.gradient.type === 'linear') {
        const colorList = this.sortedColors.map(item => {
          return `${item.color.hex} ${item.location}%`
        }).join(', ')
        return `linear-gradient(${this.gradient.direction}deg, ${colorList})`
      }
    },
    gradientColorWithAlpha() {
      if (this.gradient.type === 'linear') {
        const colorList = this.gradient.colors.map(item => {
          return `${item.color.hex8} ${item.location}%`
        }).join(', ')
        return `linear-gradient(${this.gradient.direction}deg, ${colorList})`
      }
    }
  },
  methods: {
    movePointer(e1) {
      // 获取类名列表
      const classList = Array.from(e1.target.classList)
      let pointer = null
      // 通过类名列表确定当前按下的pointer
      if (classList.indexOf('bind-pointer') !== -1) {
        pointer = e1.target
      } else if (classList.indexOf('inner-box') !== -1) {
        pointer = e1.target.parentElement
      }
      // 如果pointer被按下，触发activeID更新，并绑定拖动事件
      if (pointer) {
        // activeID更新
        this.activeID = Number(pointer.dataset.id)
        const bind = this.$refs.colorBind
        const initialX = bind.offsetLeft
        // 拖动事件
        const onMouseMove = (e2) => {
          // 计算新的pointer位置
          const newX = Math.max(0, Math.min(e2.clientX - initialX - 10, 1120))
          // 计算新的位置在bind中的百分比
          const percent = newX * 100 / 1120
          // 更新pointer位置
          pointer.style.left = `${newX}px`
          // 更新gradient对象中对应颜色的location
          this.gradient.colors.forEach(colorItem => {
            if (colorItem.id === this.activeID) {
              colorItem.location = percent
            }
          })
        }
        // 鼠标抬起事件
        const onMouseUp = () => {
          // 移除事件绑定
          document.ondragstart = null
          document.onselectstart = null
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
        }
        // 绑定鼠标移动和抬起事件
        document.ondragstart = () => false
        document.onselectstart = () => false
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }
    },
    addColor(e1) {
      console.log('触发添加')
      const onMouseUp = async (e2) => {
        const canvas = await html2canvas(this.$refs.colorBind, {
          useCORS: true,
          scale: window.devicePixelRatio,
        })

        const rect = this.$refs.colorBind.getBoundingClientRect()
        const x = e2.clientX - rect.left
        const y = e2.clientY - rect.top

        const ctx = canvas.getContext("2d")
        const pixelData = ctx.getImageData(x, y, 1, 1).data
        const [r, g, b, a] = pixelData
        const id = Date.now()
        this.gradient.colors.push({color: {
          rgba: {r, g, b, a}
        }, location: (x - 10) * 100 / 1120, id})
        this.activeID = id  
        e1.target.removeEventListener('mouseup', onMouseUp)
      }
      e1.target.addEventListener('mouseup', onMouseUp)
    }
  },
  watch: {
    currentColor: {
      handler() {
        this.gradient.colors.forEach(colorItem => {
          if (colorItem.id === this.activeID) {
            colorItem['color'] = this.currentColor
          }
        })
      },
      deep: true,
      immediate: true,
    },
    activeID() {
      for (const colorItem of this.gradient.colors) {
        if (colorItem.id === this.activeID) {
          this.$emit('IDChanged', colorItem.color)
          break
        }
      }
      
    },
    gradientColorWithAlpha: {
      handler() {
        console.log('颜色变化')
        this.$emit('changeColor', this.gradientColorWithAlpha)
      },
      immediate: true
    },
    // gradient: {
    //   handler() {
    //     console.log('颜色变化')
    //   },
    //   deep: true
    // }
  }
}
</script>


<template>
  
  <div
    class="color-bind"
    @mousedown.self="addColor"
    @mousedown="movePointer"
    ref="colorBind">
    <div class="background" :style="{'background-image': gradientColor}" ref="bindBg"></div>
    <div class="bind-pointer"
      v-for="item of gradient.colors"
      :key="item.id"
      :data-id="item.id"
      :style="{'left': `${item.location * 0.01 * 1120}px`, 'background-color': `${item.color.hex}`}"
      :class="{'active': item.id === activeID}">
      <div class="inner-box"></div>
    </div>
  </div>
</template>


<style lang="less">
:root {
  --bind-pointer-top: -4px;
  --bind-pointer-width: 20px;
  --bind-pointer-height: 20px;
  --bind-pointer-border-width: 3px;
  --bind-pointer-border-radius: 10px;
  --bind-inner-width: 14px;
  --bind-inner-height: 14px;
  --bind-inner-border-radius: 7px;
  .color-bind {
    height: 12px;
    margin-bottom: 20px;
    position: relative;
    cursor: copy;
    .background {
      width: 1130px;
      height: 100%;
      margin-left: 5px;
      border-radius: 8px;
    }
    .bind-pointer {
      position: absolute;
      top: var(--bind-pointer-top);
      width: var(--bind-pointer-width);
      height: var(--bind-pointer-height);
      border: var(--bind-pointer-border-width) solid #414141;
      border-radius: var(--bind-pointer-border-radius);
      cursor: pointer;
      .inner-box {
        width: var(--bind-inner-width);
        height: var(--bind-inner-height);
        border: 2px solid #ffffff;
        border-radius: var(--bind-inner-border-radius);
        z-index: -1
      }
    }
    .active {
      transform: scale(1.2);
    }
  }
}
</style>