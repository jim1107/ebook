// 工具方法
// 将像素转化为rem
export function px2rem (px) {
    const ratio = 375 / 10
    return px / ratio
}

// 根据屏幕缩放比例，计算出真实像素
export function realPx (pxNum) {
    const maxWidth = window.innerWidth > 500 ? 500 : window.innerWidth
    return pxNum * (maxWidth / 375)
}
