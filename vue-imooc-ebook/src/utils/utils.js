// 工具方法
export function px2rem (px) {
    const ratio = 375 / 10
    return px / ratio
}

export function realPx (pxNum) {
    const maxWidth = window.innerWidth > 500 ? 500 : window.innerWidth
    return pxNum * (maxWidth / 375)
}
