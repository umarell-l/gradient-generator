<script>
export default {
  emits: ['switchType', 'adjustDegree', 'setDegree', 'switchShape', 'changeID', 'deleteColor'],
  props: {
    activeID: Number,
    gradientColors: Object,
    type: Array,
  },
  methods: {
    setDegree(e) {
      const input = e.target
      const onChange = () => {
        const newDegree = Math.max(0, Math.min(359, parseInt(input.value)))
        if (isNaN(newDegree)) {
          input.value = parseInt(this.type[1])
        }
        else {
          this.$emit('setDegree', newDegree)
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
    }
  },
  mounted() {
    this.$refs['set-colors'].onselectstart = () => false
  }
}
</script>

<template>
  <div class="set-gradient">
    <div class="setting">
      <button class="gradient-type" @click.prevent="$emit('switchType')">{{ type[0] }}</button>
      <div class="gradient-degree" v-show="type[0] !== 'radial'">
        <div class="set-degree" @mousedown="$emit('adjustDegree', $event)">
          <div class="point" :style="{'transform': `rotate(${parseInt(type[1])}deg)`}"></div>
        </div>
        <div class="degree-label"><input type="text" :value="parseInt(type[1])" @focus="setDegree">°</div>
      </div>
      <div class="gradient-shape" v-show="type[0] === 'radial'">
        <div class="set-shape" @click="$emit('switchShape')" :style="{'width': `${(type[1] === 'ellipse') ? 60 : 40}px`}"></div>
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
          @click.self="$emit('changeID', color.id)">
          {{ parseInt(color.stop) }}
          <button class="delete" @click="$emit('deleteColor', color.id)">×</button>
        </li>
      </ul>
      <!-- <div style="height: 500px;width: 50px;">nihao nihaonih aoaf q 9i poh efnv disal fy l9q23r onuo fhca isolhk3d129rhi</div> -->
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
      padding: 1px var(--set-item-padding);
      border-right: 1px solid #eee;
      transform: translateZ(0);
      overflow-y: auto;
      .color-list {
        display: flex;
        flex-wrap: wrap;
        .color {
          position: relative;
          height: 40px;
          width: 40px;
          border: 3px solid #666;
          border-radius: 8px;
          margin-right: 60px;
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
          border: 3px solid #333;
          box-shadow: 0 0 0 1px #333;
        }
      }
    }
  }
}
</style>