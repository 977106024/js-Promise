class Dep{
    constructor(){
        this.arr = []
    }
    subscribe(fn){
        this.arr.push(fn)
    }
    release(){
        for(let i=0;i<this.arr.length;i++){
            this.arr[i].apply(this,arguments)
        }
    }
}

const obj = new Dep()
obj.subscribe(function(color,sex){
    console.log(`颜色是${color}`)
    console.log(`性别是${sex}`)
})

obj.release('红色','人妖')