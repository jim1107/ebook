<template>
<div class="ebook-bookmark" ref="bookmark">
  <div class="ebook-bookmark-text-wrapper">
    <div class="ebook-bookmark-down-wrapper" ref="iconDown">
      <span class="icon-down"></span>
    </div>
    <div class="ebook-bookmark-text">{{text}}</div>
  </div>
  <div class="ebook-bookmark-icon-wrapper" :style="isFixed ? fixedStyle : {}">
    <bookmark :color="color" :width="15" :height="35"></bookmark>
  </div>
</div>
</template>

<script>
import { realPx } from '../../utils/utils'
import Bookmark from '../common/Bookmark'
import { ebookMixin } from '../../utils/mixin'
import { getBookmark, saveBookmark } from '../../utils/localStorage'
const BLUE = '#346cbc'
const WHITE = '#fff'
export default {
  mixins: [ebookMixin],
  data () {
    return {
      text: '',
      color: WHITE,
      isFixed: false
    }
  },
  components: {
    Bookmark
  },
  computed: {
    height () {
      return realPx(35)
    },
    threshold () {
      return realPx(55)
    },
    fixedStyle () {
      return {
        position: 'fixed',
        top: 0,
        right: `${(window.innerWidth - this.$refs.bookmark.clientWidth) / 2}px`
      }
    }
  },
  watch: {
    offsetY (v) {
      if (!this.bookAvailable || this.menueVisible || this.settingVisibke >= 0) {
        return
      }
      // 状态2 未达到临界状态,标签相对运动，显得静止
      if (v >= this.height && v <= this.threshold) {
        this.beforeThreshould(v)
      } else if (v >= this.threshold) {
        // 状态3 超越临界状态
        this.afterThreshould(v)
      } else if (v > 0 && v < this.height) {
        // 状态1 归位操作
        this.beforeHight(v)
      } else if (v === 0) {
        this.restore()
      }
    },
    isBookmark  (isBookmark) {
      if (isBookmark) {
        this.color = BLUE
        this.isFixed = true
      } else {
        this.color = WHITE
        this.isFixed = false
      }
    }
  },
  methods: {
    // 获取书签组件对应的内容
    addBookmark () {
      this.bookmark = getBookmark(this.fileName)
      if (!this.bookmark) {
        this.bookmark = []
      }
      const currentLocation = this.currentBook.rendition.currentLocation()
      const cfibase = currentLocation.start.cfi.replace(/!.*/, '')
      const cfistart = currentLocation.start.cfi.replace(/.*!/, '').replace(/\)$/, '')
      const cfiend = currentLocation.end.cfi.replace(/.*!/, '').replace(/\)$/, '')
      const cfirange = `${cfibase}!,${cfistart},${cfiend})`
      this.currentBook.getRange(cfirange).then(range => {
        const text = range.toString().replace(/\s\s/g, '')
        this.bookmark.push({
          cfi: currentLocation.start.cfi,
          text: text
        })
        saveBookmark(this.fileName, this.bookmark)
      })
      console.log(cfirange)
    },
    // 删除书签
    removeBookmark () {
     const currentLocation = this.currentBook.rendition.currentLocation()
     const cfi = currentLocation.start.cfi
     this.bookmark = getBookmark(this.fileName)
     if (this.bookmark) {
       saveBookmark(this.fileName, this.bookmark.filter(item => item.cfi !== cfi))
     }
     this.setIsBookmark(false)
    },
    // 归位
    restore () {
      setTimeout(() => {
        this.$refs.bookmark.style.top = `${-this.height}px`
        this.$refs.iconDown.style.transform = 'rotate(0deg)'
      }, 200)
      if (this.isFixed) {
        this.setIsBookmark(true)
        this.addBookmark()
      } else {
        this.setIsBookmark(false)
        this.removeBookmark()
      }
    },
    // 状态1
    beforeHight (v) {
      if (this.isBookmark) {
        this.text = this.$t('book.pulldownDeleteMark')
        this.color = BLUE
        this.isFixed = true
      } else {
        this.text = this.$t('book.pulldownAddMark')
        this.color = WHITE
        this.isFixed = false
      }
    },
    // 状态2方法
    beforeThreshould (v) {
      this.$refs.bookmark.style.top = `${-v}px`
      if (this.isBookmark) {
        this.text = this.$t('book.pulldownDeleteMark')
        this.color = BLUE
      } else {
        this.text = this.$t('book.pulldownAddMark')
        this.color = WHITE
      }
      const iconDown = this.$refs.iconDown
      if (iconDown.style.transform === 'rotate(180deg)') {
        iconDown.style.transform = 'rotate(0deg)'
      }
    },
    // 状态3方法
    afterThreshould (v) {
      this.$refs.bookmark.style.top = `${-v}px`
        if (this.isBookmark) {
          this.text = this.$t('book.releaseDeleteMark')
          this.color = WHITE
          this.isFixed = false
        } else {
          this.text = this.$t('book.releaseAddMark')
          this.color = BLUE
          this.isFixed = true
        }
        const iconDown = this.$refs.iconDown
        if (iconDown.style.transform === '' ||
        iconDown.style.transform === 'rotate(0deg)') {
          iconDown.style.transform = 'rotate(180deg)'
        }
    }
  }
}
</script>

<style lang = "scss" scoped>
  @import "../../assets/styles/global.scss";
  .ebook-bookmark {
    position: absolute;
    top: px2rem(-35);
    left:0;
    z-index:200;
    width:100%;
    height:px2rem(35);
    background:gray;
    .ebook-bookmark-text-wrapper {
      position:absolute;
      right:px2rem(45);
      bottom:0;
      display:flex;
      .ebook-bookmark-down-wrapper {
        font-size:px2rem(14);
        color:white;
        transition:all .2s linear;
        @include center;
      }
      .ebook-bookmark-text {
        font-size:px2rem(14);
        color:white;
      }
    }
    .ebook-bookmark-icon-wrapper {
      position:absolute;
      right:0;
      bottom:0;
      margin-right:px2rem(15);
    }
  }
</style>
