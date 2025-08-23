
<script>
import { Sketch, Photoshop, EditableInput } from '@ckpack/vue-color'
import ColorBind from './ColorBind.vue'
import html2canvas from 'html2canvas'
export default {
  components: {
    Sketch,
    ColorBind
  },
  data() {
    return {
      currentColor: {
        hex: "#47D18C",
        hex8: "#47D18CFF",
        hsl: { h: 150, s: 0.6, l: 0.55, a: 1 },
        hsv: { h: 150, s: 0.66, v: 0.82, a: 1 },
        rgba: { r: 71, g: 209, b: 140, a: 1 },
        a: 1
      }
    }
  }
}
</script>


<template>
  <div class="color-picker">
    <ColorBind
      @changeColor="newGrident => $emit('changeBg', newGrident)"
      @IDChanged="newColor => currentColor = newColor"
      :currentColor/>
    <Sketch
      v-model="currentColor"
    />
  </div>
</template>


<style lang="less">
:root {
  --picker-width: 1200px;
  --picker-height: 800px;
  --bind-height: 50px;
  .color-picker {
    width: var(--picker-width);
    height: var(--picker-height);
    margin: 30px auto;
    padding: 28px;
    border: 2px solid #999999;
    border-radius: 20px;
    .vc-sketch {
      padding: 0;
      width: 1134px;
      height: 300px;
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