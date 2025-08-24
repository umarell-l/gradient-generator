<script>
import PreviewBox from '@/components/PreviewBox.vue'
import ColorPicker from '@/components/ColorPicker.vue'
export default {
  components: {
    PreviewBox,
    ColorPicker
  },
  data() {
    return {
      gradientColor: '#194d33'
    }
  }
}
</script>

<template>
  <PreviewBox :gradientColor="gradientColor"></PreviewBox>
  <ColorPicker @changeBg="newGrident => gradientColor = newGrident"></ColorPicker>
</template>


<style scoped lang="less">


</style>
