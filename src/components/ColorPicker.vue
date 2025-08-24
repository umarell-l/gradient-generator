
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
      type: 'linear',
      param: '90deg',
      currentColor: {
        hex: "#47D18C",
        hex8: "#47D18CFF",
        hsl: { h: 150, s: 0.6, l: 0.55, a: 1 },
        hsv: { h: 150, s: 0.66, v: 0.82, a: 1 },
        rgba: { r: 71, g: 209, b: 140, a: 1 },
        a: 1
      }
    }
  },
  methods: {
    changeType() {
      if (this.type === 'linear') {
        this.type = 'radial'
        this.param = 'circle'
      } else if (this.type === 'radial') {
        this.type = 'linear'
        this.param = '90deg'
      }
    },
    changeDegree(e) {
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
        const times = 180 / Math.PI
        const onMouseMove = (e1) => {
          const dX = e1.clientX - rotateCenter[0]
          const dY = e1.clientY - rotateCenter[1]
          // 根据鼠标位置和旋转中心的关系计算旋转角
          const atan = Math.round(times * Math.atan(dX / dY))
          let rot = 0
          if (dY >= 0) {
            rot = 180 - atan
          } else if (dX < 0) {
            rot = 360 - atan
          } else {
            rot = -atan
          }
          // 渐变方向变化
          this.param = `${rot}deg`
          // point旋转
          point.style.transform = `rotate(${rot}deg)`
        }
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }
    }
  }
}
</script>


<template>
  <div class="color-picker">
    <SetGradient
      :type
      :param
      @changeType="changeType"
      @changeDegree="changeDegree"
      @editDegree="newDegree => this.param = newDegree + 'deg'" />
    <ColorBind
      ref="colorBind"
      :currentColor
      :type
      :param
      @changeColor="newGrident => $emit('changeBg', newGrident)"
      @IDChanged="newColor => currentColor = newColor" />
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