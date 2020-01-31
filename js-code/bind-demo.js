// 模拟 bind
Function.prototype.bind1 = function () {
    // 将参数拆解为数组
    const args = Array.prototype.slice.call(arguments)

    // 获取 this（数组第一项）
    const t = args.shift()

    // fn1.bind(...) 中的 fn1
    const self = this

    // 返回一个函数
    return function () {
        return self.apply(t, args)
    }
}
//自己手写
Function.prototype.bind2 = function(){
    const args = Array.prototype.slice.call(arguments);
    const t = args.shift();
    const that = this;
    return function(){
        return that.apply(t,args);
    }
}
function fn1(a, b, c) {
    console.log('this', this)
    console.log(a, b, c)
    return 'this is fn1'
}

const fn2 = fn1.bind2({x: 100}, 110, 20, 330)
const res = fn2()
console.log(res)
