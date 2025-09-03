<script>
import { mapState } from 'pinia'
import { gradientStore } from '@/stores/gradient'
import PreviewBox from '@/components/PreviewBox.vue'
import ColorPicker from '@/components/ColorPicker.vue'
export default {
  components: {
    PreviewBox,
    ColorPicker
  },
  data() {
    return {
      gradientColor: '',
      copyMsg: 'copy',
      disappearTimer: null,
      dissipateTimer: null,
    }
  },
  methods: {
    copyCMD() {
      navigator.clipboard.writeText(`background-image: ${this.gradient};`)
      this.copyMsg = 'copied'
      this.success()
    },
    success() {
      const successBox = this.$refs.success
      successBox.style.opacity = 1
      successBox.style.display = 'block'
      clearTimeout(this.disappearTimer)
      clearTimeout(this.dissipateTimer)
      this.disappearTimer = setTimeout(() => {
        successBox.style.opacity = 0
        this.dissipateTimer = setTimeout(() => {
          successBox.style.display = 'none'
        }, 1000)
      }, 1000);
    }
  },
  computed: {
    ...mapState(gradientStore, [
      'type',
      'gradientColors',
    ]),
    // 最终效果
    gradient() {
      const colorList = this.gradientColors.map(color => {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a}) ${color.stop.toFixed(1)}%`
      }).join(', ')
      return `${this.type[0]}-gradient(${this.type[0] === 'conic' ? 'from ' : ''}${this.type[1]}, ${colorList})`
    }
  },
  watch: {
    gradient() {
      this.copyMsg = 'copy'
    }
  }
}
</script>

<template>
  <PreviewBox :gradientColor="gradient"></PreviewBox>
  <ColorPicker @changeBg="newGrident => gradientColor = newGrident"></ColorPicker>
  <button
    class="copy"
    @click="copyCMD"
    @mouseenter="$refs['gradient-data'].style.transform= 'scale(1)'"
    @mouseleave="$refs['gradient-data'].style.transform= 'scale(0)'">{{ copyMsg }}</button>
  <div class="gradient" ref="gradient-data">
    <ul class="css-command">
      <li v-for="num in 7" class="row">
        <div class="row-num">{{ num }}</div>
        <p class="row-data" v-if="num === 1">background-image: {{ gradient }};</p>
      </li>
    </ul>
  </div>
  <div class="copied" ref="success">复制成功</div>
</template>


<style scoped lang="less">
.copy {
  width: 60px;
  height: 36px;
  position: fixed;
  right: 10px;
  top: 13px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}
.gradient {
  width: calc(100% - 200px);
  height: 260px;
  background-color: #0007;
  position: fixed;
  top: 10px;
  right: 100px;
  transform-origin: 100% 0;
  transform: scale(0);
  transition: all 0.1s;
  .css-command {
    padding: 30px;
    color: #fff;
    .row {
      display: flex;
      .row-num {
        width: 30px;
        border-right: 1px solid #fff;
      }
      .row-data {
        padding-left: 20px;
        flex: 1;
      }
    }
  }
}
.copied {
  display: none;
  width: 200px;
  height: 60px;
  background-color: #0006;
  position: fixed;
  top: 320px;
  left: calc(50% - 100px);
  color: #fff;
  font-size: 20px;
  line-height: 58px;
  text-align: center;
  border: 1px solid #888;
  border-radius: 5px;
  opacity: 1;
  transition: all 1s;
}
</style>
