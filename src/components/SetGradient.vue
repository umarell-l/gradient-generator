<script>
import { mapState, mapWritableState } from 'pinia'
import { gradientStore } from '@/stores/gradient'
import { nextTick } from 'vue'
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
        const roulette = point.parentElement
        // 确定旋转中心
        const rotateCenter = [roulette.offsetLeft + 20 - document.documentElement.scrollLeft, roulette.offsetTop + 20 - document.documentElement.scrollTop]
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
        onMouseMove(e)

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
    // 预设改变时的响应函数
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
    },
    // 随机生成渐变色
    randomGenerating() {
      // 随机生成颜色函数
      function getRandomColor() {
        const r = Math.floor(Math.random() * 256)
        const g = Math.floor(Math.random() * 256)
        const b = Math.floor(Math.random() * 256)
        return [r, g, b]
      }
      const [r1, g1, b1] = getRandomColor()
      const [r2, g2, b2] = getRandomColor()
      const [r3, g3, b3] = getRandomColor()
      const c1 = {r:r1, g: g1, b: b1, a: 1, stop: 0, id: Date.now()}
      const c2 = {r:r2, g: g2, b: b2, a: 1, stop: Math.random() * 40 + 30, id: Date.now() + 1}
      const c3 = {r:r3, g: g3, b: b3, a: 1, stop: 100, id: Date.now() + 2}
      const c4 = {r:r1, g: g1, b: b1, a: 1, stop: 100, id: Date.now() + 3}
      if (this.type[0] === 'linear') {
        // 线性渐变时，取三种随机颜色
        this.type[1] = Math.floor(Math.random() * 360) + 'deg'
        this.gradientColors.splice(0, this.gradientColors.length, c1, c2, c3)
      } else if (this.type[0] === 'radial') {
        // 径向渐变时，取两种随机颜色
        this.type[1] = 'circle'
        this.gradientColors.splice(0, this.gradientColors.length, c1, c3)
      } else {
        // 锥形渐变时，取两种随机颜色，并且首尾相同
        this.type[1] = Math.floor(Math.random() * 360) + 'deg'
        this.gradientColors.splice(0, this.gradientColors.length, c1, c2, c4)
      }
      // 重置当前颜色id
      this.activeID = this.gradientColors[0].id
    },
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
    async presetIndex() {
      // 触发预设改变method
      this.presetChanged()
      await nextTick()
      const presetDomList = this.$refs['preset-list']
      const listTop = presetDomList.scrollTop
      const itemTop = presetDomList.children[this.presetIndex].offsetTop
      console.log(itemTop)
      if (itemTop < listTop + 10) {
        presetDomList.scrollTop = itemTop - 10
      } else if (itemTop - 80 > listTop) {
        presetDomList.scrollTop = itemTop - 50
      }
    },
    activeID() {
      const index = this.gradientColors.findIndex(color => {
        return color.id === this.activeID
      })
      const colorList = this.$refs['color-list']
      const listTop = colorList.scrollTop
      const itemTop = colorList.children[index].offsetTop
      if (itemTop < listTop) {
        colorList.scrollTop = itemTop
      } else if (itemTop - 80 > listTop) {
        colorList.scrollTop = itemTop - 70
      }
    }
  }
}
</script>

<template>
  <div class="set-gradient">
    <div class="setting">
      <button class="gradient-type" @click.prevent="switchType">{{ type[0] }}</button>
      <div class="gradient-degree" v-show="type[0] !== 'radial'">
        <div class="set-degree" @mousedown="adjustDegree" :style="
        {'background-color': `var(--roulette-${(type[0] === 'linear') ? 'linear' : 'conic'}-bg)`, 'border-radius': `var(--roulette-${(type[0] === 'linear') ? 'linear' : 'conic'}-radius)`}">
          <div class="point" :style="{'transform': `rotate(${parseInt(type[1])}deg)`}"></div>
        </div>
        <div class="degree-label"><input type="text" :value="parseInt(type[1])" @focus="setDegree">°</div>
      </div>
      <div class="gradient-shape" v-show="type[0] === 'radial'">
        <div class="set-shape" @click="type[1] = (type[1] === 'ellipse') ? 'circle' : 'ellipse'" :style="{'width': `${(type[1] === 'ellipse') ? 70 : 50}px`}"></div>
      </div>
    </div>
    <div class="set-colors" ref="set-colors">
      <ul class="color-list" ref="color-list">
        <li
          class="color"
          v-for="color of this.gradientColors"
          :key="color.id"
          :style="{'background-color': `rgb(${color.r}, ${color.g}, ${color.b})`, 'color': (Math.max(color.r, color.g, color.b) > 160) ? '#000' : '#fff'}"
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
      <ul class="preset-list" ref="preset-list">
        <li
          v-for="(preset, index) in presetList"
          class="preset-item"
          :class="{'active': index === presetIndex}"
          :key="preset.id"
          :style="{'background': presetGradient[index]}"
          
          @click="presetIndex = index"></li>
      </ul>
      <div class="random">
        <button @click="randomGenerating">&#8635</button>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.set-gradient {
  width: 100%;
  height: 120px;
  margin-bottom: 20px;
  display: flex;
  justify-content: start;
  align-items: center;
  .setting {
    // height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
    padding-right: 30px;
    border-right: 1px solid #ddd;
    .gradient-type {
      width: 160px;
      height: 50px;
      margin-bottom: 10px;
      border-radius: 10px;
      line-height: 44px;
      color: #555;
      font-size: 20px;
      font-weight: 700;
      cursor: pointer;
      &:hover {
        color: var(--color-accent);
      }
    }
    .gradient-degree, .gradient-shape {
      width: 100%;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      .set-degree {
        position: relative;
        width: 50px;
        height: 50px;
        border-radius: var(--roulette-linear-radius);
        box-shadow: var(--roulette-shadow);
        .point {
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #fff;
          position: absolute;
          top: 6px;
          left: 20px;
          transform-origin: 5px 19px;
        }
      }
      .degree-label {
        width: 50px;
        font-size: 18px;
        font-weight: 700;
        input {
          width: 36px;
          border: none;
          padding-right: 3px;
          margin: 2px;
          text-align: right;
          font-size: 18px;
          font-weight: 700;
          outline: none;
          &:focus {
            outline: 2px solid #000;
            border-radius: 5px;
          }
        }
      }
      .set-shape {
        height: 50px;
        background-color: var(--roulette-radial-bg);
        border-radius: 50%;
        box-shadow: var(--roulette-shadow);
        cursor: pointer;
      }
    }
  }
  .set-colors {
    flex: 0.5;
    height: 100%;
    padding: 0 30px;
    border-right: 1px solid #ddd;
    .color-list {
      display: flex;
      flex-wrap: wrap;
      height: 100%;
      padding: 1px;
      transform: translateZ(0);
      overflow-y: auto;
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 3px;
      }
      .color {
        position: relative;
        height: 40px;
        width: 40px;
        border-radius: 8px;
        margin-right: 60px;
        margin-bottom: 10px;
        line-height: 40px;
        text-align: center;
        cursor: default;
        transition: all 0.2s;
        .delete {
          position: absolute;
          left: 37px;
          width: 40px;
          border: none;
          box-shadow: none;
          color: #aaa;
          line-height: 40px;
          font-size: 20px;
          cursor: pointer;
          &:hover {
            color: #777;
          }
        }
      }
      .active {
        box-shadow: var(--roulette-shadow);
        font-size: 18px;
      }
    }
  }
  .preset {
    display: flex;
    flex: 0.5;
    padding: 0 10px 0 30px;
    height: 100%;
    .option {
      width: 40px;
      margin-right: 10px;
      button {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.2s;
        &:hover {
          color: var(--color-text-tertiary);
          font-size: 24px;
        }
      }
      .add-preset {
        color: var(--color-text-success);
        margin: 10px 0 20px 0;
        &:hover {
          background-color: var(--color-success);
        }
      }
      .delete-preset {
        color: var(--color-text-danger);
        &:hover {
          background-color: var(--color-danger);
        }
      }
    }
    .preset-list {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      margin-right: 20px;
      height: 100%;
      overflow: auto;
      transform: translateZ(0);
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 3px;
      }
      .preset-item {
        width: 60px;
        height: 60px;
        margin: 10px;
        border-radius: 10px;
        transition: all 0.2s;
        box-shadow: inset 0 0 50px #fffc;
        &:hover {
          transform: translateY(-3px);
          box-shadow: none;
        }
      }
      .active {
        box-shadow: 4px 7px 8px #1a1a1966;
        &:hover {
          box-shadow: 4px 7px 8px #1a1a1966;
        }
      }
    }
    .random {
      width: 60px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      button {
        width: 60px;
        height: 100%;
        border-radius: 10px;
        font-size: 30px;
        font-weight: 700;
        cursor: pointer;
        &:hover {
          color: var(--color-accent);
        }
      }
    }
  }
}
</style>