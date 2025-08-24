<script>
export default {
  emits: ['changeType', 'changeDegree', 'editDegree', 'changeShape'],
  props: {
    type: String,
    param: String,
  },
  methods: {
    editDegree(e) {
      const input = e.target
      const onChange = () => {
        const newDegree = Math.max(0, Math.min(359, parseInt(input.value)))
        if (isNaN(newDegree)) {
          input.value = parseInt(this.param)
        }
        else {
          this.$emit('editDegree', newDegree)
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
  }
}
</script>

<template>
  <div class="set-gradient">
    <div class="setting">
      <div class="gradient-type" @click="$emit('changeType')">{{ type }}</div>
      <div class="gradient-degree" v-show="type === 'linear'">
        <div class="set-degree" @mousedown="$emit('changeDegree', $event)">
          <div class="point" :style="{'transform': `rotate(${parseInt(param)}deg)`}"></div>
        </div>
        <div class="degree-label"><input type="text" :value="parseInt(param)" @focus="editDegree">°</div>
      </div>
      <div class="gradient-shape" v-show="type === 'radial'">
        <div class="set-shape" @click="$emit('changeShape')" :style="{'width': `${(param === 'ellipse') ? 60 : 40}px`}"></div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
:root {
  --set-gradient-width: 100%;
  --set-gradient-height: 120px;
  --set-gradient-bottom: 20px;

  --set-type-width: 160px;
  --set-type-height: 46px;
  --set-type-border: 2px;
  --set-type-radius: 10px;
  .set-gradient {
    width: var(--set-gradient-width);
    height: var(--set-gradient-height);
    // background-color: pink;
    margin-bottom: var(--set-gradient-bottom);
    display: flex;
    justify-content: start;
    align-items: center;
    .setting {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: start;
      .gradient-type {
        width: var(--set-type-width);
        height: var(--set-type-height);
        margin-bottom: 20px;
        background-color: #eee;
        border: var(--set-type-border) solid #ddd;
        border-radius: var(--set-type-radius);
        line-height: calc(var(--set-type-height) - 6px);
        text-align: center;
        color: #777;
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
  }
}
</style>