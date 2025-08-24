<script>
export default {
  props: {
    gradientColor: String,
  },
  methods: {
    resizePreview(e) {
      if (e.target.className === 'drag') {
        const previewBox = e.target.parentElement
        const onMouseMove = (e2) => {
          previewBox.style.height = Math.max(300, e2.clientY + document.documentElement.scrollTop + 5) + 'px'
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
  <div class="preview-box" @mousedown="resizePreview">
    <div class="background"></div>
    <div class="preview" :style="{'background': gradientColor}"></div>
    <div class="drag"></div>
  </div>
</template>

<style lang="less">
.preview-box {
  width: 100%;
  height: 300px;
  position: relative;
  // background-color: #2f90ba;
  .background, .preview {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }
  .background {
    background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),linear-gradient(-45deg, #ccc 25%, transparent 25%),linear-gradient(45deg, transparent 75%, #ccc 75%),linear-gradient(-45deg, transparent 75%, #ccc 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  }
  .drag {
    position: absolute;
    width: 100%;
    height: 10px;
    bottom: 0px;
    cursor: row-resize;
    transition: all 0.2s;
    &:hover {
      background-color: #0003;
    }
  }
}
</style>