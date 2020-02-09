<template>
    <div class="ebook-reader">
        <div class="ebook-reader-mask"
        @click="onMaskClick"
        @touchmove = "move"
        @touchend = "moveEnd"
        @mousedown.left="onMouseEnter"
        @mousemove.left="onMouseMove"
        @mouseup.left="onMouseEnd"></div>
        <div id="read"></div>
    </div>
</template>

<script>
import { getFontFamily, saveFontFamily,
         getFontSize, saveFontSize,
         getTheme, saveTheme,
         getLocation } from '../../utils/localStorage'
import { flatten } from '../../utils/book'
import { ebookMixin } from '../../utils/mixin'
import Epub from 'epubjs'
global.ePub = Epub
export default {
    mixins: [ebookMixin],
    methods: {
        // 1 鼠标进入
        // 2 鼠标进入后的移动
        // 3鼠标从移动状态松手
        // 4鼠标还原
        onMouseEnter (e) {
            this.mouseState = 1
            this.mouseStartTime = e.timeStamp
            e.preventDefault()
            e.stopPropagation()
        },
        onMouseMove (e) {
            if (this.mouseState === 1) {
                this.mouseState = 2
            } else if (this.mouseState === 2) {
                let offsetY = 0
                if (this.firstOffsetY) {
                    offsetY = e.clientY - this.firstOffsetY
                    this.setOffsetY(offsetY)
                } else {
                    this.firstOffsetY = e.clientY
                }
            }
            e.preventDefault()
            e.stopPropagation()
        },
        // 移动结束的事件
        onMouseEnd (e) {
            if (this.mouseState === 2) {
                this.setOffsetY(0)
                this.firstOffsetY = null
                this.mouseState = 3
            } else {
                this.mouseState = 4
            }
            const time = e.timeStamp - this.mouseStartTime
            if (time < 200) {
                this.mouseState = 4
            }
            e.preventDefault()
            e.stopPropagation()
        },
        // 移动中事件
        move (e) {
            let offsetY = 0
            if (this.firstOffsetY) {
                offsetY = e.changedTouches[0].clientY - this.firstOffsetY
                this.setOffsetY(offsetY)
            } else {
                this.firstOffsetY = e.changedTouches[0].clientY
            }
            // 禁止调用默认方法和传播
            e.preventDefault()
            e.stopPropagation()
        },
        moveEnd (e) {
            this.setOffsetY(0)
            this.firstOffsetY = null
        },
        // 蒙版 点击事件
        onMaskClick (e) {
            // console.log(e)
            if (this.mouseState && (this.mouseState === 2 || this.mouseState === 3)) {
                return
            }
            const offsetX = e.offsetX
            const width = window.innerWidth
            if (offsetX > 0 && offsetX < width * 0.3) {
                this.prevPage()
            } else if (offsetX > 0 && offsetX > width * 0.7) {
                this.nextPage()
            } else {
                this.toggleTitleAndMenu()
            }
        },
        prevPage () {
            if (this.rendition) {
                this.rendition.prev().then(() => {
                    this.refreshLocation()
                })
                this.hideTitleAndMenu()
            }
        },
        nextPage () {
            if (this.rendition) {
                this.rendition.next().then(() => {
                    this.refreshLocation()
                })
                this.hideTitleAndMenu()
            }
        },
        toggleTitleAndMenu () {
            // this.$store.dispatch('setMenuVisible', !this.menuVisible)
            this.setMenuVisible(!this.menuVisible)
            if (this.menuVisible) {
                this.setSettingVisible(-1)
            }
            this.setFontFamilyVisible(false)
        },
    initFontSize () {
        let fontSize = getFontSize(this.fileName)
        if (!fontSize) {
            saveFontSize(this.fileName, this.defaultFontSize)
        } else {
            this.rendition.themes.fontSize(fontSize)
            this.setDefaultFontSize(fontSize)
        }
        },
initFontFamily () {
        let font = getFontFamily(this.fileName)
        if (!font) {
            saveFontFamily(this.fileName, this.defaultFontFamily)
        } else {
            this.rendition.themes.font(font)
            this.setDefaultFontFamily(font)
        }
},
// 主题初始化
initTheme () {
        let defaultTheme = getTheme(this.fileName)
        if (!defaultTheme) {
            defaultTheme = this.themeList[0].name
            saveTheme(this.fileName, defaultTheme)
        }
        this.setDefaultTheme(defaultTheme)
        this.themeList.forEach(theme => {
            this.rendition.themes.register(theme.name, theme.style)
        })
        this.rendition.themes.select(defaultTheme)
},
// 渲染初始化
initRendtion () {
        this.rendition = this.book.renderTo('read', {
            width: innerWidth,
            height: innerHeight,
            method: 'default' // 左右翻页阅读模式
            // flow:'scrolled'
        })
        const location = getLocation(this.fileName)
            // console.log(location)
            this.display(location, () => {
            this.initTheme()
            this.initFontSize()
            this.initFontFamily()
            this.initGlobalStyle()
        })
        // 引入字体
        this.rendition.hooks.content.register(contents => {
        Promise.all([
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`),
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/cabin.css`),
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`),
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`)
        ]).then(() => {
            // console.log(process.env)
            console.log('字体全部加载完成')
        })
    })
},
// 手势初始化
initGesture () {
        this.rendition.on('touchstart', event => {
        this.touchStartX = event.changedTouches[0].clientX
        this.touchStartTime = event.timeStamp
        })
    this.rendition.on('touchend', event => {
    const offsetX = event.changedTouches[0].clientX -
    this.touchStartX
    const time = event.timeStamp - this.touchStartTime
    console.log(offsetX, time)
    if (offsetX > 40 && time < 1000) {
    this.prevPage()
    } else if (offsetX < -40 && time < 1000) {
        this.nextPage()
    } else {
        this.toggleTitleAndMenu()
    }
    event.preventDefault()
    event.stopPropagation()
    })
},
// 解析电子书内容
    parseBook () {
        this.book.loaded.cover.then(cover => {
            this.book.archive.createUrl(cover).then(url => {
                this.setCover(url)
            })
        })
        this.book.loaded.metadata.then(metadata => {
            this.setMetadata(metadata)
        })
        this.book.loaded.navigation.then(nav => {
            const navItem = flatten(nav.toc)
            function find (item, level = 0) {
                return !item.parent ? level : find(navItem.filter(parentItem =>
                parentItem.id === item.parent)[0], ++level)
                }
            navItem.forEach(item => {
                item.level = find(item)
            })
            this.setNavigation(navItem)
        })
    },
    initEpub () {
        const url = `${process.env.VUE_APP_RES_URL}/epub/` + this.fileName + '.epub'
        this.book = new Epub(url)
        console.log(url)
        this.setCurrentBook(this.book)
        this.initRendtion()
        this.initGesture()
        this.parseBook() // 解析电子书内容
        // 分页
        this.book.ready.then(() => {
            return this.book.locations.generate(750 * (window.innerWidth / 375) * (getFontSize(this.fileName) / 16))
        }).then(locations => {
            this.navigation.forEach(nav => {
                nav.pagelist = []
            })
            locations.forEach(item => {
                const loc = item.match(/\[(.*)\]!/)[1]
                this.navigation.forEach(nav => {
                    if (nav.href) {
                        const href = nav.href.match(/^(.*)\.html$/)[1]
                        if (href === loc) {
                            nav.pagelist.push(item)
                        }
                    }
                })
                let currentPage = 1
                this.navigation.forEach((nav, index) => {
                    if (index === 0) {
                        nav.page = 1
                    } else {
                        nav.page = currentPage
                    }
                    currentPage += nav.pagelist.length + 1
                })
            })
            this.setPagelist(locations)
            console.log(this.navigation)
            this.setBookAvailable(true)
            this.refreshLocation()
        })
        }
    },
    mounted () {
        this.setFileName(this.$route.params.fileName.split('|').join('/')).then(() => {
            this.initEpub()
        })
    }
}
</script>

<style lang="scss" scoped>
    @import "../../assets/styles/global.scss";
    .ebook-reader {
        width: 100%;
        height:100%;
        overflow:hidden;
        .ebook-reader-mask {
            position:absolute;
            top:0;
            left:0;
            background:transparent;
            z-index:150;
            width:100%;
            height:100%;
        }
    }
</style>
