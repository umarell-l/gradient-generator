
<script>
import { mapState, mapWritableState } from 'pinia'
import { gradientStore } from '@/stores/gradient'
import { Sketch } from '@ckpack/vue-color'
import ColorBind from './ColorBind.vue'
import SetGradient from './SetGradient.vue'
export default {
  components: {
    Sketch,
    ColorBind,
    SetGradient
  },
  methods: {
    // 删除指定id颜色
    deleteColorByID(deleteID) {
      // 当只剩两个元素时，不再删除
      if (this.gradientColors.length > 2) {
        const deleteIndex = this.gradientColors.findIndex(color => {
          return color.id === deleteID
        })
        this.gradientColors.splice(deleteIndex, 1)
        this.activeID = this.gradientColors[Math.floor(this.gradientColors.length / 2)].id
      }
    }
  },
  computed: {
    ...mapState(gradientStore, [
      'presetIndex',
      'presetList',
    ]),
    ...mapWritableState(gradientStore, [
      'type',
      'gradientColors',
      'activeID',
      'currentColor',
    ]),
  },
  created() {
    this.type = this.presetList[this.presetIndex].type
    this.gradientColors = this.presetList[this.presetIndex].gradientColors
    this.activeID = this.gradientColors[0].id
    for (const color of this.gradientColors) {
      if (color.id === this.activeID) {
        const {r, g, b, a} = color
        this.currentColor = {r, g, b, a}
        break
      }
    }
  },
  mounted() {
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement.tagName !== 'INPUT') {
          this.deleteColorByID(this.activeID)
        }
      }
    })
    document.ondragstart = () => false
  },
  watch: {
    activeID() {
      for (const color of this.gradientColors) {
        if (color.id === this.activeID) {
          const {r, g, b, a} = color
          this.currentColor = {r, g, b, a}
          break
        }
      }
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
  },
}
</script>


<template>
  <div class="color-picker">
    <SetGradient @deleteColor="deleteColorByID" />
    <ColorBind />
    <Sketch v-model="currentColor" />
  </div>
</template>


<style lang="less">
.color-picker {
    width: 1200px;
    margin: 40px auto;
    padding: 29px;
    background-color: var(--color-bg-tertiary);
    border: 1px solid #ccc;
    border-radius: 20px;
    .vc-sketch {
      padding: 0;
      width: 100%;
      height: 300px;
      margin-top: 20px;
      background-color: var(--color-bg-tertiary);
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
</style>