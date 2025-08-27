
<script>
import { Sketch } from '@ckpack/vue-color'
import ColorBind from './ColorBind.vue'
import SetGradient from './SetGradient.vue'
export default {
  components: {
    Sketch,
    ColorBind,
    SetGradient
  },
  emits: ['changeBg'],
  data() {
    return {
      // 当前（渐变）类型索引
      typeIndex: 0,
      // 编辑中的颜色id
      activeID: 1,
      // 类型对象数组types
      types: [
        ['linear', '90deg'],
        ['radial', 'ellipse'],
        ['conic', '0deg']
      ],
      // 当前颜色
      currentColor: null,
      // 渐变颜色断点数组
      gradientColors: [
        {r: 215, g: 232, b: 33, a: 1, stop: 0, id: 0},
        {r: 71, g: 209, b: 140, a: 1, stop: 100, id: 1},
      ]
    }
  },
  computed: {
    // 最终效果
    gradient() {
      const colorList = this.gradientColors.map(color => {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a}) ${color.stop}%`
      }).join(', ')
      const type = this.types[this.typeIndex]
      return `${type[0]}-gradient(${type[0] === 'conic' ? 'from ' : ''}${type[1]}, ${colorList})`
    }
  },
  methods: {
    // 切换渐变类型
    switchType() {
      // 直接切换到类型对象数组中下一项
      if (this.typeIndex === this.types.length - 1) {
        this.typeIndex = 0
      } else {
        this.typeIndex++
      }
    },
    // 旋转调节线性渐变方向
    adjustDegree(e) {
      // 设置point（视图中表示角度的点）
      let point = null
      if (e.target.className === 'point') {
        point = e.target
      }else if (e.target.className === 'set-degree') {
        point = e.target.children[0]
      }
      if (point) {
        const circle = point.parentElement
        // 确定旋转中心
        const rotateCenter = [circle.offsetLeft + 20 - document.documentElement.scrollLeft, circle.offsetTop + 20 - document.documentElement.scrollTop]
        // 乘积系数
        const coeff = 180 / Math.PI
        const onMouseMove = (e1) => {
          // 鼠标位置相对于旋转中心的位置
          const dX = e1.clientX - rotateCenter[0]
          const dY = e1.clientY - rotateCenter[1]
          // 根据鼠标位置和旋转中心的关系计算反正切值
          const atan = Math.round(coeff * Math.atan(dX / dY))
          // 利用反正切值和位置关系更新旋转角
          let rot = 0
          if (dY >= 0) {
            rot = 180 - atan
          } else if (dX < 0) {
            rot = 360 - atan
          } else {
            rot = -atan
          }
          // 渐变方向变化
          this.types[this.typeIndex][1] = `${rot}deg`
          // point旋转
          point.style.transform = `rotate(${rot}deg)`
        }
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
          document.onselectstart = () => null
        }

        document.onselectstart = () => false
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }
    }
  },
  watch: {
    activeID: {
      handler() {
        for (const color of this.gradientColors) {
          if (color.id === this.activeID) {
            const {r, g, b, a} = color
            this.currentColor = {r, g, b, a}
            break
          }
        }
      },
      immediate: true
    },
    currentColor() {
      for (const color of this.gradientColors) {
        if (color.id === this.activeID) {
          Object.assign(color, this.currentColor.rgba)
          break
        }
      }
    },
    gradientColors: {
      handler() {
        this.gradientColors.sort((c1, c2) => c1.stop - c2.stop)
      },
      deep: true,
      immediate: true,
    },
    gradient: {
      handler() {
        this.$emit('changeBg', this.gradient)
      },
      immediate: true,
    }
  }
}
</script>


<template>
  <div class="color-picker">
    <SetGradient
      :type="types[typeIndex]"
      @changeType="switchType"
      @changeDegree="adjustDegree"
      @setDegree="newDegree => types[typeIndex][1] = parseInt(newDegree) + 'deg'"
      @switchShape="types[typeIndex][1] = (types[typeIndex][1] === 'ellipse') ? 'circle' : 'ellipse'" />
    <ColorBind
      :activeID
      :currentColor
      :gradientColors
      :type="types[typeIndex]"
      @changeID="newID => activeID = newID"
      @updateStop="newStop => gradientColors.forEach(color => {
        if (color.id === this.activeID) {
          color.stop = newStop
        }
      })"
      @addColor="newColor => gradientColors.push(newColor)" />
    <Sketch v-model="currentColor" />
  </div>
</template>


<style lang="less">
:root {
  --picker-width: 1200px;
  // --picker-height: 900px;
  --picker-padding: 29px;
  --picker-border-width: 1px;
  .color-picker {
    width: var(--picker-width);
    // height: var(--picker-height);
    margin: 40px auto;
    padding: var(--picker-padding);
    border: 1px solid #ccc;
    border-radius: 20px;
    .vc-sketch {
      padding: 0;
      width: 100%;
      height: 300px;
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      box-shadow: none;
      justify-content: space-evenly;
      .vc-sketch-saturation-wrap {
        width: 40%;
        height: 300px;
        padding: 0;
        .vc-saturation {
          height: 300px;
          .vc-saturation-pointer .vc-saturation-circle {
            width: 12px;
            height: 12px;
            margin-top: -7px;
            margin-left: -4px;
            border: 2px solid #fff;
            border-radius: 6px;
            box-shadow: 0 0 0 2px #000;
          }
        }
      }
      .vc-sketch-controls {
        width: 50%;
        height: 100px;
        flex-direction: row-reverse;
        justify-content: space-between;
        .vc-sketch-sliders {
          .vc-sketch-hue-wrap, .vc-sketch-alpha-wrap {
            width: 100%;
            height: 30px;
            // margin: 10px;
            overflow: visible;
            .vc-hue-picker, .vc-alpha-picker {
              margin-top: -3px;
              height: 36px;
              width: 10px;
              border: 3px solid #414141;
              border-radius: 5px;
            }
          }
        }
        .vc-sketch-color-wrap {
          display: none;
        }
        .vc-checkerboard {
          background-size: 15px 15px;
          background-repeat: repeat;
        }
      }
      .vc-sketch-field {
        width: 50%;
        input {
          height: 30px;
          padding-left: 0;
          font-size: 20px;
          text-align: center;
        }
        span {
          font-size: 20px;
          text-align: center;
        }
        .vc-editable-input {
          text-align: center;
        }
      }
      .vc-sketch-presets {
        display: none;
      }
    }
  }
}
</style>