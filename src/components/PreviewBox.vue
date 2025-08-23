<template>
  <div class="preview-box">
    <div class="background"></div>
    <div class="preview" :style="{'background': gradientColor}"></div>
  </div>
</template>

<script>
export default {
  props: {
    gradientColor: String,
  }
}
</script>


<style lang="less">
.preview-box {
  width: 100%;
  height: 200px;
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
}
</style>