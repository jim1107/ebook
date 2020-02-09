import { mapGetters, mapActions } from 'vuex'
import { themeList, addCss, removeAllCss, getReadTimeByMinute } from './book'
import { saveLocation, getBookmark } from './localStorage'
// 组件复用
export const ebookMixin = {
  computed: {
    ...mapGetters([
      'fileName',
      'menuVisible',
      'settingVisible',
      'defaultFontSize',
      'defaultFontFamily',
      'fontFamilyVisible',
      'defaultTheme',
      'bookAvailable',
      'progress',
      'section',
      'isPaginating',
      'currentBook',
      'navigation',
      'cover',
      'metadata',
      'paginate',
      'pagelist',
      'offsetY',
      'isBookmark'
    ]),
    themeList () {
      return themeList(this)
  },
    getSectionName () {
      return this.section ? this.navigation[this.section].label : ''
    }
  },
  methods: {
    ...mapActions([
      'setFileName',
      'setMenuVisible',
      'setSettingVisible',
      'setDefaultFontSize',
      'setDefaultFontFamily',
      'setFontFamilyVisible',
      'setDefaultTheme',
      'setBookAvailable',
      'setProgress',
      'setSection',
      'setIsPaginating',
      'setCurrentBook',
      'setNavigation',
      'setCover',
      'setMetadata',
      'setPaginate',
      'setPagelist',
      'setOffsetY',
      'setIsBookmark'
    ]),
    // 动态切换主题CSS样式
    initGlobalStyle () {
      removeAllCss()
      switch (this.defaultTheme) {
          case 'Default':
            addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
            break
          case 'Eye' :
            // console.log(process.env.VUE_APP_RES_URL)
            addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
            break
          case 'Night' :
            addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`)
            break
          case 'Gold' :
            addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`)
            break
          default:
             addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
            break
        }
    },
    // 刷新当前位置，获取进度变化
    refreshLocation () {
      const currentLocation = this.currentBook.rendition.currentLocation()
      if (currentLocation && currentLocation.start) {
        const startCfi = currentLocation.start.cfi
        const progress = this.currentBook.locations.percentageFromCfi(startCfi)
        // console.log(progress, currentLocation, startCfi)
        this.setProgress(Math.floor(progress * 100))
        // local storage
        this.setSection(currentLocation.start.index)
        saveLocation(this.fileName, startCfi)
        // 判断当前页是否是书签，some方法
        const bookmark = getBookmark(this.fileName)
        // console.log(bookmark)
        if (bookmark) {
          if (bookmark.some(item => item.cfi === startCfi)) {
            this.setIsBookmark(true)
          } else {
            this.setIsBookmark(false)
          }
        } else {
          this.setIsBookmark(false)
        }
        if (this.pagelist) {
          const totalPage = this.pagelist.length
          const currentPage = currentLocation.start.location
          if (currentPage && currentPage > 0) {
            this.setPaginate(currentPage + '/' + totalPage)
          } else {
            this.setPaginate('')
          }
        } else {
          this.setPaginate('')
        }
      }
    },
    // 通用显示的方法，回调
    display (target, cb) {
      if (target) {
          this.currentBook.rendition.display(target).then(() => {
            this.refreshLocation()
            if (cb) cb()
          })
      } else {
          this.currentBook.rendition.display().then(() => {
            this.refreshLocation()
            if (cb) cb()
          })
      }
  },
  // 隐藏菜单和标题
  hideTitleAndMenu () {
    // this.$store.dispatch('setMenuVisible', false)
    this.setMenuVisible(false)
    this.setSettingVisible(-1)
    this.setFontFamilyVisible(false) // 字体样式设置
  },
  getReasTimeText () {
    return this.$t('book.haveRead').replace('$1', getReadTimeByMinute(this.fileName))
  }
  }
}

export const storeHomeMixin = {
  computed: {
    ...mapGetters([
      'offsetY',
      'hotSearchOffsetY',
      'flapCardVisible'])
  },
  methods: {
    ...mapActions([
      'setOffsetY',
    'setHotSearchOffsetY',
    'setFlapCardVisible']),
    showBookDetail (book) {
      // 路由跳转
      this.$router.push({
        path: '/store/detail',
        query: {
          fileName: book.fileName,
          category: book.categoryText
        }
      })
    }
  }
}
