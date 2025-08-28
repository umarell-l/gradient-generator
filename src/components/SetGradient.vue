<script>
import { mapState, mapWritableState } from 'pinia'
import { gradientStore } from '@/stores/gradient'
export default {
  emits: ['deleteColor'],
  data() {
    return {
      typeIndex: 0,
      types: [
        ['linear', '90deg'],
        ['radial', 'ellipse'],
        ['conic', '0deg']
      ]
    }
  },
  methods: {
    // 切换渐变类型
    switchType() {
      // 将当前的参数更新至types数组中
      this.types[this.typeIndex][1] = this.type[1]
      // 直接切换到类型对象数组中下一项
      if (this.typeIndex === this.types.length - 1) {
        this.typeIndex = 0
      } else {
        this.typeIndex++
      }
      this.type[0] = this.types[this.typeIndex][0]
      this.type[1] = this.types[this.typeIndex][1]
    },
    // 旋转调节线性/锥形渐变方向
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
          this.type[1] = `${rot}deg`
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
    },
    // 输入调节线性/锥形渐变方向
    setDegree(e) {
      const input = e.target
      const onChange = () => {
        const newDegree = Math.max(0, Math.min(359, parseInt(input.value)))
        if (isNaN(newDegree)) {
          input.value = parseInt(this.type[1])
        }
        else {
          this.type[1] = parseInt(newDegree) + 'deg'
        }
      }
      input.addEventListener('keydown', (e1) => {
        if (e1.key === 'Enter') {
          onChange()
          input.removeEventListener('blur', onChange)
          input.blur()
        }
      })
      input.addEventListener('blur', onChange)
    },
    // 将当前渐变色添加至预设
    addPreset() {
      const type = JSON.parse(JSON.stringify(this.type))
      const gradientColors = JSON.parse(JSON.stringify(this.gradientColors))
      this.presetList.push({type, gradientColors})
      this.presetIndex = this.presetList.length - 1
    },
    // 删除当前渐变色
    deletePreset() {
      // 保留最后一个预设
      if (this.presetList.length > 1) {
        this.presetList.splice(this.presetIndex, 1)
        if (this.presetIndex === this.presetList.length - 1) {
          this.presetChanged()
        }
        else {
          this.presetIndex = this.presetList.length - 1
        }
      }
    },
    presetChanged() {
      const activePreset = this.presetList[this.presetIndex]
      // 给gradientColors赋值为指定预设中的渐变色
      this.gradientColors = activePreset.gradientColors
      // 给type赋值为给定预设中的类型
      this.type = activePreset.type
      // 将activeID置为渐变色中第一个颜色
      this.activeID = this.gradientColors[0].id
      // 改变types以及typeIndex
      const index = this.types.findIndex(type => type[0] === this.type[0])
      this.types[index][1] = this.type[1]
      this.typeIndex = index
    }
  },
  computed: {
    ...mapState(gradientStore, [
      'currentColor',
      'presetList'
    ]),
    ...mapWritableState(gradientStore, [
      'presetIndex',
      'type',
      'gradientColors',
      'activeID',
    ]),
    presetGradient() {
      return this.presetList.map(preset => {
        const colorList = preset.gradientColors.map(color => {
          return `rgb(${color.r}, ${color.g}, ${color.b}) ${color.stop}%`
        }).join(', ')
        return `${preset.type[0]}-gradient(${preset.type[0] === 'conic' ? 'from ' : ''}${preset.type[1]}, ${colorList})`
      })
    }
  },
  created() {
    const index = this.types.findIndex(type => type[0] === this.type[0])
    this.types[index][1] = this.type[1]
    this.typeIndex = index
  },
  mounted() {
    this.$refs['set-colors'].onselectstart = () => false
  },
  watch: {
    // 当前预设改变
    presetIndex() {
      // 触发预设改变method
      this.presetChanged()
    },
  }
}
</script>

<template>
  <div class="set-gradient">
    <div class="setting">
      <button class="gradient-type" @click.prevent="switchType">{{ type[0] }}</button>
      <div class="gradient-degree" v-show="type[0] !== 'radial'">
        <div class="set-degree" @mousedown="adjustDegree">
          <div class="point" :style="{'transform': `rotate(${parseInt(type[1])}deg)`}"></div>
        </div>
        <div class="degree-label"><input type="text" :value="parseInt(type[1])" @focus="setDegree">°</div>
      </div>
      <div class="gradient-shape" v-show="type[0] === 'radial'">
        <div class="set-shape" @click="type[1] = (type[1] === 'ellipse') ? 'circle' : 'ellipse'" :style="{'width': `${(type[1] === 'ellipse') ? 60 : 40}px`}"></div>
      </div>
    </div>
    <div class="set-colors" ref="set-colors">
      <ul class="color-list">
        <li
          class="color"
          v-for="color of this.gradientColors"
          :key="color.id"
          :style="{'background-color': `rgb(${color.r}, ${color.g}, ${color.b})`}"
          :class="{'active': color.id === activeID}"
          @click.self="activeID = color.id">
          {{ parseInt(color.stop) }}
          <button class="delete" @click="$emit('deleteColor', color.id)">×</button>
        </li>
      </ul>
    </div>
    <div class="preset">
      <div class="option">
        <button class="add-preset" @click="addPreset">+</button>
        <button class="delete-preset" @click="deletePreset">×</button>
      </div>
      <ul class="preset-list">
        <li
          v-for="(preset, index) in presetList"
          class="preset-item"
          :class="{'active': index === presetIndex}"
          :key="preset.id"
          :style="{'background': presetGradient[index]}"
          @click="presetIndex = index"></li>
      </ul>
    </div>
  </div>
</template>

<style lang="less">
:root {
  --set-gradient-width: 100%;
  --set-gradient-height: 120px;
  --set-gradient-bottom: 20px;

  --set-type-width: 160px;
  --set-type-height: 50px;
  --set-type-border: 2px;
  --set-type-radius: 10px;
  --set-item-padding: 30px;
  .set-gradient {
    width: var(--set-gradient-width);
    height: var(--set-gradient-height);
    margin-bottom: var(--set-gradient-bottom);
    display: flex;
    justify-content: start;
    align-items: center;
    .setting {
      // height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: start;
      padding-right: var(--set-item-padding);
      border-right: 1px solid #eee;
      .gradient-type {
        width: var(--set-type-width);
        height: var(--set-type-height);
        margin-bottom: 20px;
        background-color: #eee;
        border: var(--set-type-border) solid #ccc;
        border-radius: var(--set-type-radius);
        line-height: calc(var(--set-type-height) - 6px);
        text-align: center;
        color: #555;
        font-size: 20px;
        font-weight: 700;
        cursor: pointer;
      }
      .gradient-degree, .gradient-shape {
        width: 100%;
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        .set-degree {
          position: relative;
          width: 40px;
          height: 40px;
          border: 4px solid #333;
          border-radius: 20px;
          cursor: pointer;
          .point {
            width: 10px;
            height: 10px;
            border-radius: 5px;
            background-color: #333;
            position: absolute;
            top: -7px;
            right: 11px;
            transform-origin: 5px 23px;
          }
        }
        .degree-label {
          width: 50px;
          font-size: 18px;
          font-weight: 700;
          input {
            width: 36px;
            text-align: right;
            font-size: 18px;
            font-weight: 700;
            outline: none;
            border: none;
            padding-right: 3px;
            margin: 2px;
            &:focus {
              outline: 2px solid #000;
              border-radius: 5px;
            }
          }
        }
        .set-shape {
          height: 40px;
          border: 4px solid #333;
          border-radius: 50%;
          cursor: pointer;
        }
      }
    }
    .set-colors {
      flex: 0.5;
      height: 100%;
      padding: 0 var(--set-item-padding);
      border-right: 1px solid #eee;
      .color-list {
        display: flex;
        flex-wrap: wrap;
        height: 100%;
        padding: 1px;
        transform: translateZ(0);
        overflow-y: auto;
        .color {
          position: relative;
          height: 40px;
          width: 40px;
          border: 3px solid #aaa;
          border-radius: 8px;
          margin-right: 50px;
          margin-bottom: 10px;
          line-height: 34px;
          text-align: center;
          cursor: default;
          .delete {
            position: absolute;
            left: 37px;
            width: 40px;
            background-color: transparent;
            border: none;
            color: #aaa;
            line-height: 34px;
            font-size: 20px;
            cursor: pointer;
            &:hover {
              color: #777;
            }
          }
        }
        .active {
          border: 3px solid #555;
          box-shadow: 0 0 0 1px #555;
        }
      }
    }
    .preset {
      display: flex;
      flex: 0.5;
      padding: 0 var(--set-item-padding);
      height: 100%;
      .option {
        width: 40px;
        margin-right: 10px;
        button {
          width: 40px;
          height: 40px;
          background-color: #eee;
          border: 2px solid #cccccc;
          border-radius: 6px;
          font-weight: 700;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.1s;
        }
        .add-preset {
          background-color: #6db4d5;
          border: 2px solid #61a4c3;
          color: #fff;
          margin: 10px 0 20px 0;
          &:hover {
            background-color: #66abcb;
          }
        }
        .delete-preset {
          background-color: #d5b16d;
          border: 2px solid #ae9058;
          color: #f00;
          &:hover {
            background-color: #c8a668;
          }
        }
      }
      .preset-list {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        height: 100%;
        overflow: auto;
        .preset-item {
          width: 60px;
          height: 60px;
          margin: 10px;
          border: 3px solid #ccc;
          border-radius: 10px;
        }
        .active {
          border: 3px solid #666;
          box-shadow: 0 0 0 1px #666;
        }
      }
    }
  }
}
</style>