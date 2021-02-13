
/**
 * proxy设置响应式
 * effects 依赖收集 只更新变动的值 不这样做的话 就只能全部更新
 */
export class ToyVue {
    constructor(config) {
        this.el = document.querySelector(config.el)
        this.data = reactive(config.data)
       for(let name in config.methods){
           this[name] = ()=>{
               config.methods[name].call(this.data) // 把data对象绑到mthods上 这样在methods里面才能this.inputData
               console.log(this,'this>')
           }
       }
        this.x(this.el)
    }

    x(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.trim().match(/^{{([\s\S]+)}}$/g)) {
                const name = RegExp.$1
                effect(() => (node.textContent = this.data[name]))
            }
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            let attributes = node.attributes
            for (let attribute of attributes) {
                // v-model="data"
                if (attribute.name === 'v-model') {
                    const value = attribute.value
                    effect(() => (node.value = this.data[value]))
                    node.addEventListener('click', event => this.data[value] = node.value)
                }
                // v-bind:title="xxx"
                if(attribute.name.match(/^v\-bind:([\s\S]+)$/)){
                    const name = RegExp.$1
                    const value = attribute.value
                    effect(()=>node.attribute(name,this.data[value]))

                }
                //v-on:
                if(attribute.name.match(/^v\-on:([\s\S]+)$/)){
                    const name = RegExp.$1
                    const value = attribute.value
                    node.addEventListener(name,this[value])
                }
            }
        }

        if (node.childNodes && node.childNodes.length) {
            for (let child of node.childNodes) {
                this.x(child)
            }
        }
    }

}

let effects = new Map

var status = null

const effect = (fn) => {
    // effects.push(fn)
    status = fn
    fn()
    status = null
}

const reactive = (object) => {
    let observed = new Proxy(object, {
        get(object, property) {
            if (status) {
                if (!effects.has(object)) {
                    effects.set(object, new Map)
                }
                if (!effects.get(object).has(property)) {
                    effects.get(object).set(property, [])
                }
                effects.get(object).get(property).push(status)
            }
            return object[property]
        },
        set(object, property, value) {
            object[property] = value
            for (let effect of effects.get(object).get(property)) {
                effect()
            }
            return value
        }
    })
    return observed
}

// let dummy
// const counter = reactive({num:0}) // 初始化
// effect(()=>alert(counter.num)) // 依赖收集

// counter.num = 1

