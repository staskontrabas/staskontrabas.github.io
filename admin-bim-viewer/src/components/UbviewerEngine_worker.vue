<template>
    <canvas id="canvas" ref="canvas"></canvas>
</template>

<script>
// import Module from '@/plugins/UBViewer.js'
import * as JSZip from 'jszip'
import * as JSZipUtils from 'jszip-utils'

export default {
    name: 'UbviewerEngine',
    data: () => ({
        canvas: null,
        worker: null,
        offscreen: null,
        myModule: null,
        modelId: [],
        modelType: '',
        modelJsonType: '',
        token: '',
        CanvasWidth: 0,
        CanvasHeight: 0,
        devicePixelRatio: 1,
        collisions: false,
        filters: false,
        filterList: [],
        delta: [],
        deltaJson: null,
        modelName: {},
        deltaName: {}
    }),
    methods: {
        setCanvasSize(){
            this.canvas = this.$refs['canvas']
            let el = this.$el
            let parent = this.$parent.$el
            const devicePixelRatio = window.devicePixelRatio || 1
            const widthC = parent.offsetWidth// * devicePixelRatio
            const heightC = parent.offsetHeight// * devicePixelRatio
            this.CanvasWidth = widthC * devicePixelRatio
            this.CanvasHeight = heightC * devicePixelRatio
            this.devicePixelRatio = devicePixelRatio

            // this.canvas.style.width  = widthC + "px"
            // this.canvas.style.height = heightC + "px"
            this.canvas.width  = widthC
            this.canvas.height = heightC

            return {
                widthC,
                heightC
            }
        },
        getCanvasWidth(){
            return this.CanvasWidth
        },
        getCanvasHeight(){
            return this.CanvasHeight
        },
        getDevicePixelRatio(){
            return this.devicePixelRatio
        },
        displayAxes(v){
            this.myModule.setViewCubeVisible(v.value)
        },
        displayGrid(v){
            this.myModule.setGridVisible(v.value)
        },
        setSelectionMode(v){
            this.myModule.setSelectionMode(v.value)
        },
        selectObjectById(v){
            this.myModule.selectObjectById(v.value)
        },
        clearSelection(v){
            this.myModule.clearSelection()
        },
        loadCollisions(){
            if(this.collisions){
                return
            }
            return new Promise((resolve, reject) => {
                let list = this.modelId.map(m => {
                    return this.$store.dispatch('getFile', {
                        id: m + '/collisions.json',
                        token: this.token,
                        typeBlob: 'blob'
                    })
                    .then(res => {
                        return res.file.arrayBuffer()
                    })
                    .then(r => {
                        return this.createFile({
                            data: new Uint8Array(r),
                            name: m + '_collisions.json',
                            path: '/'
                        })
                    })
                    .then(res => {
                        this.myModule.loadCollisions('/' + m + '_collisions.json')
                        return true
                    })
                })

                Promise.all(list)
                .finally(r => {
                    console.log('load collisions end')
                    this.collisions = true
                    resolve(true)
                })
                .catch(e => {
                    console.log('load collisions error', e)
                    reject(e)
                })
            })
        },
        setCollisions(v){
            if(v.value == true){
                if(!this.collisions){
                    // let list = this.modelId.map(m => {
                    //     return this.$store.dispatch('getFile', {
                    //         id: m + '/collisions.json',
                    //         token: this.token,
                    //         typeBlob: 'blob'
                    //     })
                    //     .then(res => {
                    //         return res.file.arrayBuffer()
                    //     })
                    //     .then(r => {
                    //         return this.createFile({
                    //             data: new Uint8Array(r),
                    //             name: m + '_collisions.json',
                    //             path: '/'
                    //         })
                    //     })
                    //     .then(res => {
                    //         console.log('load collisions')
                    //         this.myModule.loadCollisions('/' + m + '_collisions.json')
                    //         return true
                    //     })
                    // })
                    // Promise.all(list)
                    // .finally(r => {
                    //     console.log('load collisions end')
                    //     this.collisions = true
                    //     this.myModule.setCollisionsVisible(true)
                    // })
                    // .catch(e => {
                    //     console.log('load collisions error', e)
                    // })
                    this.loadCollisions()
                        .then(res => {
                            this.myModule.setCollisionsVisible(true)
                        })
                        .catch(e => {
                            console.log('load collisions error', e)
                        })
                }
                else{
                    this.myModule.setCollisionsVisible(true)
                }
            }
            else{
                this.myModule.setCollisionsVisible(false)
            }
        },
        setWalkView(v){
            this.myModule.setWalkView(v.value)
        },
        setView(v){
            this.myModule[v.name]()
        },
        // updateCanvasSize(){
        //     this.setCanvasSize()
        // },
        // onObjectSelected(Id) {
        //     console.log(Id)
        // },
        onSelected(id) {
            console.log("SELECTED ID: ", id)
            window.parent.postMessage({
                action: 'onSelected',
                id: id
            }, "*")
        },
        loadFilters(){
            return new Promise(resolve => {
                //if(!this.filters){
                let no_filter = this.modelId.find(f => !this.filterList.some(s => f == s))

                if(no_filter){
                    new Promise(resolve => {
                        if(this.modelJsonType == 'json.zip'){
                            resolve(this.$store.dispatch('getFile', {
                                id: no_filter + '/json.zip',
                                token: this.token,
                                typeBlob: 'blob'
                            })
                            .then(res => {
                                return Promise.resolve(res.file)
                            })
                            .then(res => JSZip.loadAsync(res))
                            .then(zip => {
                                let filesList = Object.keys(zip.files)
                                return zip.file(filesList[0]).async("uint8array")
                            }))
                        }
                        else{
                            resolve(this.$store.dispatch('getFile', {
                                id: no_filter + '/json',
                                token: this.token,
                                typeBlob: 'blob'
                            })
                            .then(res => {
                                return res.file.arrayBuffer()
                            }))
                        }
                    })
                    .then(r => {
                        return this.createFile({
                            data: new Uint8Array(r),
                            name: no_filter + '_filters.json',
                            path: '/'
                        })
                    })
                    .then(r => {
                        this.myModule.loadInformJson('/' + no_filter + '_filters.json')
                        return true
                    })
                    .then(r => {
                        this.myModule.disableFilters()
                        return true
                    })
                    .then(r => {
                        this.filters = true
                        this.filterList = [...this.filterList, no_filter]
                        resolve(true)
                    })
                }
                else{
                    resolve(true)
                }
            })
        },
        onFilter(o){
            this.loadFilters()
            .then(r => {
                let value = o.value
                switch(value.filter){
                    case 'category':
                                    this.myModule.setCategoryFilter(value.name, value.active)
                                    break
                    case 'type':    this.myModule.setGroupFilter(
                                                        value.category,
                                                        value.name,
                                                        value.active
                                    )
                                    break
                    case 'clear':   this.myModule.clearFilters()
                                    break
                    case 'enable':  this.myModule.enableFilters()
                                    break
                    case 'disable': this.myModule.disableFilters()
                                    break
                    default: ;
                }
            })
        },
        onHideObject(a){
            let objs = new this.myModule.StringList()
            a.map(i => {
                objs.push_back(i)
            })
            this.myModule.hideObjects(objs)
            this.onGetHiddenObjects()
        },
        onShowObject(a){
            let objs = new this.myModule.StringList()
            a.map(i => {
                objs.push_back(i)
            })
            this.myModule.showObjects(objs)
            this.onGetHiddenObjects()
        },
        onRoomVisibility(d){
            if(d.value){
                this.myModule.showAllRooms()
            }
            else{
                this.myModule.hideAllRooms()
            }
        },
        onRoomVisibilityItem(d){
            this.myModule.setRoomVisibilityById(d.value.id, d.value.val)
            this.onGetHiddenObjects(d.value.id)
        },
        onSection(d){
            if(d.value){
                this.myModule.createSectionBox()
            }
            else{
                this.myModule.removeSectionBox()
            }
        },
        onComputeCollisions(d){
            let list_1 = new this.myModule.StringList()
            d.value.list_1.map(l => {
                list_1.push_back(l)
            })
            let list_2 = new this.myModule.StringList()
            d.value.list_2.map(l => {
                list_2.push_back(l)
            })
            // let res = this.myModule.computeCollisionsByComponentNames(list_1, list_2)
            let res = this.myModule.computeCollisionsByIds(list_1, list_2)
            window.parent.postMessage({
                action: 'saveCollisionReports',
                value: {...JSON.parse(res), group: d.value.group, rule: d.value.rule, part: d.value.part}
            }, "*")
        },
        onSetColorForObjects(d){
            let list = new this.myModule.StringList()
            d.value.list.map(l => {
                list.push_back(l)
            })
            this.myModule.setColorForObjects(list, d.value.color)
        },
        onSetColorsForObjects(d){
            this.myModule.setColorsForObjects(JSON.stringify(d.value))
        },
        onUnsetColorsForObjects(){
            this.myModule.unsetColorsForObjects()
        },
        onObjectsHighlight(d){
            let list = new this.myModule.StringList()
            d.value.list.map(l => {
                list.push_back(l)
            })
            this.myModule.setObjectsHighlight(list, d.value.active)
        },
        onShowObjectsOnly(d){
            if(d.value.active){
                this.myModule.disableCollisionsOnlyMode()
                let list = new this.myModule.StringList()
                d.value.list.map(l => {
                    list.push_back(l)
                })
                this.myModule.showObjectsOnly(list)
            }
            else{
                this.myModule.disableObjectsOnlyMode()
            }
        },
        onCreateSectionBoxForObjects(d){
            if(d.value.active){
                let list = new this.myModule.StringList()
                d.value.list.map(l => {
                    list.push_back(l)
                })
                this.myModule.createSectionBoxForObjects(list)
            }
            else{
                this.myModule.removeSectionBox()
            }
        },
        onCollisionsActive(d){
            let list = new this.myModule.StringList()
            d.value.list.map(l => {
                list.push_back(l)
            })
            this.myModule.setCollisionsActive(list, d.value.active)

            window.parent.postMessage({
                action: 'onRender',
                value: true
            }, "*")
        },
        onShowCollisionsOnly(d){
            if(d.value.active){
                this.myModule.disableObjectsOnlyMode()
                let list = new this.myModule.StringList()
                d.value.list.map(l => {
                    list.push_back(l)
                })
                this.myModule.showCollisionsOnly(list)
            }
            else{
                this.myModule.disableCollisionsOnlyMode()
            }
        },
        onCreateSectionBoxForCollisions(d){
            if(d.value.active){
                let list = new this.myModule.StringList()
                d.value.list.map(l => {
                    list.push_back(l)
                })
                this.myModule.createSectionBoxForCollisions(list)
            }
            else{
                this.myModule.removeSectionBox()
            }
        },
        onRemoveSectionBox(){
            this.myModule.removeSectionBox()
        },
        onLoadApplyFilters(v){
            window.parent.postMessage({
                action: 'onLoadApplyFilters',
                value: v.value
            }, "*")
        },
        onLoadModel(v){
            window.parent.postMessage({
                action: 'onLoadModel',
                value: v
            }, "*")
        },
        onReadyModel(v){
            window.parent.postMessage({
                action: 'onReadyModel',
                value: v.value
            }, "*")
        },
        onReadyExt(v){
            window.parent.postMessage({
                action: 'onReadyModel',
                value: v.value
            }, "*")
        },
        getRoomsColors(v){
            window.parent.postMessage({
                action: 'getRoomsColors',
                value: v.value
            }, "*")
        },
        onGetHiddenObjects(){
            let ar = []
            let objs = this.myModule.hiddenObjects()
            for(let i = 0, len = objs.size(); i < len; i++){
                ar = [...ar, objs.get(i)]
            }
            window.parent.postMessage({
                action: 'onGetHiddenObjects',
                value: ar
            }, "*")
        },
        onDelta(d){
            this.myModule.clear()
            if(!d.value){
                let model = this.modelName[this.modelId[0]]
                this.myModule.loadModel(model.name, model.path, model.pathJson)
            }
            else{
                if(!this.delta.find(f => d.id)){
                    this.delta = [d.id]
                    this.token = d.token
                    this.$store.dispatch('getFile', {
                        id: d.id + '/obj.zip',
                        token: d.token,
                        typeBlob: 'blob'
                    })
                    .then(res => {
                        return Promise.resolve(res.file)
                    })
                    .then(res => JSZip.loadAsync(res))
                    .then(zip => {
                        let filesList = Object.keys(zip.files)
                        return Promise.all(this.aqq(filesList, zip))
                    })
                    .then(res => {
                        let files = {
                            files: []
                        }
                        res.map(r => {
                            if(r.type == 'file'){
                                files.files.push(r)
                            }
                            else{
                                files[r.type] = r
                            }
                        })

                        return Promise.resolve(files)
                    })
                    .then(res => {
                        return new Promise((resolve) => {
                            this.createFile(res.mtl)
                            this.createFile(res.obj)
                            resolve(res)
                        })
                    })
                    .then(res => {
                        return new Promise((resolve) => {
                            let deltaJson = this.deltaJson
                            this.getDeltaJson()
                            .then(res => {
                                deltaJson = res
                                return this.getInformJson({id: d.id, type: d.prop.type})
                            })
                            .then(pathJson => {
                                this.deltaName[d.id] = {
                                    name: res.obj.name,
                                    path: res.obj.path,
                                    pathJson: pathJson
                                }
                                let model = this.modelName[this.modelId[0]]
                                this.myModule.loadDelta(
                                    model.name,
                                    model.path,
                                    model.pathJson,
                                    res.obj.name,
                                    res.obj.path,
                                    pathJson,
                                    deltaJson
                                )
                                resolve(true)
                            })
                        })
                    })
                }
                else{
                    let delta = this.deltaName[d.id]
                    let model = this.modelName[this.modelId[0]]
                    this.myModule.loadDelta(
                        model.name,
                        model.path,
                        model.pathJson,
                        delta.name,
                        delta.path,
                        delta.pathJson,
                        this.deltaJson
                    )
                }
            }
        },
        getDeltaJson(){
            return new Promise(resolve => {
                let delta = this.modelId[0]
                if(!this.deltaJson){
                    this.$store.dispatch('getFile', {
                        id: delta + '/delta.json',
                        token: this.token,
                        typeBlob: 'blob'
                    })
                    .then(res => {
                        return res.file.arrayBuffer()
                    })
                    .then(r => {
                        return this.createFile({
                            data: new Uint8Array(r),
                            name: delta + '_delta.json',
                            path: '/'
                        })
                    })
                    .then(r => {
                        this.deltaJson = '/' + delta + '_delta.json'
                        resolve('/' + delta + '_delta.json')
                    })
                }
                else{
                    resolve('/' + delta + '_delta.json')
                }
            })
        },
        getInformJson(params = {id: false, type: ''}){
            return new Promise(resolve => {
                let no_filter = params.id || this.modelId.find(f => !this.filterList.some(s => f == s))

                if(no_filter){
                    // this.$store.dispatch('getFile', {
                    //     id: no_filter + (params.type == 'rvt' ? '/mini.json' : '/json'),
                    //     token: this.token,
                    //     typeBlob: 'blob'
                    // })
                    // .then(res => {
                    //     return res.file.arrayBuffer()
                    // })
                    new Promise(resolve => {
                        this.$store.dispatch('getFile', {
                            id: no_filter + '/info',
                            token: this.token
                        })
                        .then(res => {
                            if(res.file.tags['mini.json']){
                                return this.$store.dispatch('getFile', {
                                    id: no_filter + '/mini.json',
                                    token: this.token,
                                    typeBlob: 'blob'
                                })
                                .then(res => {
                                    resolve(res.file.arrayBuffer())
                                })
                            }
                            else if(res.file.tags['json.zip']){
                                return this.$store.dispatch('getFile', {
                                    id: no_filter + '/json.zip',
                                    token: this.token,
                                    typeBlob: 'blob'
                                })
                                .then(res => {
                                    return Promise.resolve(res.file)
                                })
                                .then(res => JSZip.loadAsync(res))
                                .then(zip => {
                                    let filesList = Object.keys(zip.files)
                                    resolve(zip.file(filesList[0]).async("uint8array"))
                                })
                            }
                            else{
                                return this.$store.dispatch('getFile', {
                                    id: no_filter + '/json',
                                    token: this.token,
                                    typeBlob: 'blob'
                                })
                                .then(res => {
                                    resolve(res.file.arrayBuffer())
                                })
                            }
                        })
                        // if(this.modelJsonType == 'json.zip'){
                        //     resolve(this.$store.dispatch('getFile', {
                        //         id: no_filter + '/json.zip',
                        //         token: this.token,
                        //         typeBlob: 'blob'
                        //     })
                        //     .then(res => {
                        //         return Promise.resolve(res.file)
                        //     })
                        //     .then(res => JSZip.loadAsync(res))
                        //     .then(zip => {
                        //         let filesList = Object.keys(zip.files)
                        //         return zip.file(filesList[0]).async("uint8array")
                        //     }))
                        // }
                        // else{
                        //     resolve(this.$store.dispatch('common/getFileInfo', {id: no_filter + '/info'})
                        //         .then(res => {
                        //             let json = res.tags['mini.json']
                        //                 ? '/mini.json'
                        //                 : '/json'
                        //
                        //             return this.$store.dispatch('getFile', {
                        //                 id: no_filter + json,
                        //                 token: this.token,
                        //                 typeBlob: 'blob'
                        //             })
                        //         })
                        //         .then(res => {
                        //             return res.file.arrayBuffer()
                        //         })
                        //     )
                        // }
                    })
                    .then(r => {
                        return this.createFile({
                            data: new Uint8Array(r),
                            name: no_filter + '_filters.json',
                            path: '/'
                        })
                    })
                    .then(r => {
                        this.filters = true
                        this.filterList = [...this.filterList, no_filter]
                        resolve('/' + no_filter + '_filters.json')
                    })
                }
                else{
                    resolve('/' + no_filter + '_filters.json')
                }
            })
        },
        disableFilters(){
            this.myModule.disableFilters()
        },
        loadModel(v){
            this.modelJsonType = v.prop.json
            this.modelType = v.prop.type
            this.modelId = [...this.modelId, v.id]
            this.token = v.token
            this.worker.postMessage({
                action: 'loadModel',
                props: {
                    id: v.id,
                    token: v.token
                }
            })
            // this.$store.dispatch('getFile', {
            //     id: v.id + '/obj.zip',
            //     token: v.token,
            //     typeBlob: 'blob'
            // })
            // .then(res => {
            //     return Promise.resolve(res.file)
            // })
            // .then(res => JSZip.loadAsync(res))
            // .then(zip => {
            //     let filesList = Object.keys(zip.files)
            //     return Promise.all(this.aqq(filesList, zip))
            // })
            // .then(res => {
            //     let files = {
            //         files: []
            //     }
            //     res.map(r => {
            //         if(r.type == 'file'){
            //             files.files.push(r)
            //         }
            //         else{
            //             files[r.type] = r
            //         }
            //     })
            //
            //     return Promise.resolve(files)
            // })
            // .then(res => {
            //     console.log('createFile res ', res)
            //
            //     return new Promise((resolve) => {
            //         this.createFile(res.mtl)
            //         this.createFile(res.obj)
            //         console.log('crweate file')
            //         resolve(res)
            //     })
            // })
            // .then(res => {
            //     console.log('load model')
            //     window.parent.postMessage({
            //         action: 'onStartLoadFilters',
            //         value: true
            //     }, "*")
            //     return new Promise((resolve) => {
            //         this.getInformJson({id: v.id, type: v.prop.type})
            //         .then(pathJson => {
            //             this.modelName[v.id] = {
            //                 name: res.obj.name,
            //                 path: res.obj.path,
            //                 pathJson: pathJson
            //             }
            //             this.myModule.loadModel(res.obj.name, res.obj.path, pathJson)
            //             resolve(true)
            //         })
            //     })
            // })
            // .then(res => {
            //     return new Promise((resolve) => {
            //         this.disableFilters()
            //         resolve(true)
            //     })
            // })
            // .then(res => {
            //     this.onReadyModel(true)
            // })
        },
        loadExt(v){
            this.modelType = v.type
            this.modelId = [...this.modelId, v.id]
            this.token = v.token
            this.$store.dispatch('getFile', {
                id: v.id,
                token: v.token,
                typeBlob: 'blob'
            })
            .then(res => {
                return res.file.arrayBuffer()
            })
            .then(res => {

                return new Promise((resolve) => {
                    this.createFile({
                        data: new Uint8Array(res),
                        name: v.id + '_' + v.type,
                        path: '/'
                    })
                    resolve({name: v.id + '_' + v.type, path: '/'})
                })
            })
            .then(res => {
                return new Promise((resolve) => {
                    switch(v.type){
                        case 'dwg':
                            // this.myModule.loadDWG('/data/test2.dwg')
                            this.myModule.loadDWG(res.name)
                            break
                        case 'dxf':
                            this.myModule.loadDXF(res.path + res.name)
                            break
                        default: ;
                    }
                    resolve(true)
                })
            })
            .then(res => {
                this.onReadyExt(true)
            })
        },
        aqq(filesList, zip){
            let list = []
            filesList.map(i => {
                if(i.match('.obj')){
                    list.push(Promise.resolve(zip.file(i).async("uint8array"))
                        .then(r => {
                            return Promise.resolve({
                                type: 'obj',
                                path: '/',
                                name: i,
                                mainname: i.substring(0, i.length - 4),
                                basename: i.substring(0, i.length - 4),
                                data: r
                            })
                        }))
                }
                else if(i.match('.mtl')){
                    list.push(Promise.resolve(zip.file(i).async("uint8array"))
                        .then(r => {
                            return Promise.resolve({
                                type: 'mtl',
                                name: i,
                                path: '/',
                                mainname: i.substring(0, i.length - 4),
                                basename: i.substring(0, i.length - 4),
                                data: r
                            })
                        }))
                }
                else{
                    list.push(Promise.resolve(zip.file(i).async("uint8array"))
                        .then(r => {
                            let path = i.substring(i.indexOf('_'))
                                .split('\\')
                            let mainname = i.substring(0, i.indexOf('_'))
                            let name = path[path.length - 1]
                            return Promise.resolve({
                                type: 'file',
                                path: path.slice(0, path.length - 1).join('/'),
                                name: name,
                                mainname: mainname,
                                basename: name.substring(0, name.lastIndexOf('.')),
                                data: r
                            })
                        }))
                }
            })

            return list
        },
        createFile(file){
            // console.log('createFile(file){ ', file)
            let aDataArray = file.data//new Uint8Array(file.data)
            const aDataBuffer = this.myModule._malloc(aDataArray.length)
            this.myModule.HEAPU8.set(aDataArray, aDataBuffer)
            this.myModule['FS_createDataFile'](file.path, file.name, aDataArray, true, true)
            this.myModule._free(aDataBuffer)
        },
        receiveMessage(e){
            if(Object.prototype.hasOwnProperty.call(e.data, 'action')){
                switch(e.data.action){
                    case 'loadModel': this.loadModel(e.data)
                        break
                    case 'loadExt': this.loadExt(e.data)
                        break
                    case 'displayAxes': this.displayAxes(e.data)
                        break
                    case 'displayGrid': this.displayGrid(e.data)
                        break
                    case 'setSelectionMode': this.setSelectionMode(e.data)
                        break
                    case 'selectObjectById': this.selectObjectById(e.data)
                        break
                    case 'clearSelection': this.clearSelection(e.data)
                        break
                    case 'onLoadCollisions': this.loadCollisions()
                        break
                    case 'setCollisions': this.setCollisions(e.data)
                        break
                    case 'setWalkView': this.setWalkView(e.data)
                        break
                    case 'setView': this.setView(e.data)
                        break
                    case 'onFilter': this.onFilter(e.data)
                        break
                    case 'onSection': this.onSection(e.data)
                        break
                    case 'onHideObject': this.onHideObject(e.data.value)
                        break
                    case 'onShowObject': this.onShowObject(e.data.value)
                        break
                    case 'onGetHiddenObjects': this.onGetHiddenObjects(e.data.value)
                        break
                    case 'onRoomVisibility': this.onRoomVisibility(e.data)
                        break
                    case 'onRoomVisibilityItem': this.onRoomVisibilityItem(e.data)
                        break
                    case 'onComputeCollisions': this.onComputeCollisions(e.data)
                        break
                    case 'onCollisionsActive': this.onCollisionsActive(e.data)
                        break
                    case 'onShowCollisionsOnly': this.onShowCollisionsOnly(e.data)
                        break
                    case 'onCreateSectionBoxForCollisions': this.onCreateSectionBoxForCollisions(e.data)
                        break

                    case 'onSetColorForObjects': this.onSetColorForObjects(e.data)
                        break
                    case 'onSetColorsForObjects': this.onSetColorsForObjects(e.data)
                        break
                    case 'onUnsetColorsForObjects': this.onUnsetColorsForObjects(e.data)
                        break
                    case 'onObjectsHighlight': this.onObjectsHighlight(e.data)
                        break
                    case 'onShowObjectsOnly': this.onShowObjectsOnly(e.data)
                        break
                    case 'onCreateSectionBoxForObjects': this.onCreateSectionBoxForObjects(e.data)
                        break

                    case 'onRemoveSectionBox': this.onRemoveSectionBox()
                        break
                    case 'onDelta': this.onDelta(e.data)
                        break
                    default: ;
                }
            }
        },
        initEngine(){
            if(this.myModule === null){
                let cnvs = this.$refs['canvas']
                // let offscreen = cnvs.transferControlToOffscreen()
                new Module({
                    canvas: cnvs
                }).then(myModule => {
                    this.myModule = myModule

                    this.myModule.setGetCanvasWidthCallback(
                        () => this.getCanvasWidth()
                    )
                    this.myModule.setGetCanvasHeightCallback(
                        () => this.getCanvasHeight()
                    )

                    this.myModule.setOnSelectedCallback(
                        id => this.onSelected(id)
                    )
                    this.myModule.setOnProgressCallback(
                        v => this.onLoadModel(v)
                    )
                    this.myModule.setOnFiltersApplyCallback(
                        v => this.onLoadApplyFilters(v)
                    )

                    this.myModule.setViewCubeSize(40 / this.getDevicePixelRatio())
                    this.myModule.setSelectionMode(false)
                    this.myModule.resize()

                    window.parent.postMessage({action: 'ready'}, "*")
                    window.addEventListener("resize", this.onWindowResize, false)
                })
            }
        },
        onWindowResize(){
            this.setCanvasSize()
            this.myModule.setGetCanvasWidthCallback(
                () => this.getCanvasWidth()
            )
            this.myModule.setGetCanvasHeightCallback(
                () => this.getCanvasHeight()
            )
            this.myModule.resize()
        },
        workerMessage(e){
            if(Object.prototype.hasOwnProperty.call(e.data, 'action')){
                switch(e.data.action){
                    case 'ready': window.parent.postMessage({action: 'ready'}, "*")
                        break
                    case 'onStartLoadFilters': window.parent.postMessage({action: 'onStartLoadFilters'}, "*")
                        break
                    case 'onSelected': this.onSelected(e.data)
                        break
                    case 'onLoadApplyFilters': this.onLoadApplyFilters(e.data)
                        break
                    case 'onLoadModel': this.onLoadModel(e.data)
                        break
                    case 'onReadyModel': this.onReadyModel(e.data)
                        break
                    case 'getRoomsColors': this.getRoomsColors(e.data)
                        break
                    case 'onGetHiddenObjects': this.onGetHiddenObjects(e.data.value)
                        break
                    case 'saveCollisionReports': this.saveCollisionReports(e.data)
                        break
                    case 'onRender': this.onRender(e.data)
                        break
                    default: ;
                }
            }
        },
        initWorker(){
            this.worker = new Worker('./js/worker.js')
            this.offscreen = this.canvas.transferControlToOffscreen()

            this.worker.addEventListener("message", this.workerMessage, false)

            this.canvas.addEventListener('mousemove', (e) => {
                this.worker.postMessage({
                    action: 'mouseevent',
                    props: {
                        btn: e.button,
                        btns: e.buttons,
                        type: 8,
                        ex: e.layerX,
                        ey: e.layerY
                    }
                })
            })
            this.canvas.addEventListener('mousedown', (e) => {
                this.worker.postMessage({
                    action: 'mouseevent',
                    props: {
                        btn: e.button,
                        btns: e.buttons,
                        type: 6,
                        ex: e.layerX,
                        ey: e.layerY
                    }
                })
            })
            this.canvas.addEventListener('mouseup', (e) => {
                this.worker.postMessage({
                    action: 'mouseevent',
                    props: {
                        btn: e.button,
                        btns: e.buttons,
                        type: 5,
                        ex: e.layerX,
                        ey: e.layerY
                    }
                })
            })
            this.worker.postMessage({
                action: 'canvas',
                props: {
                    width: this.offscreen.width,
                    height: this.offscreen.height,
                    canvas: this.offscreen,
                    pxlratio: this.getDevicePixelRatio()
                }
            }, [this.offscreen])
        }
    },
    mounted(){
        window.addEventListener("message", this.receiveMessage, false)

        this.$nextTick(() => {
            setTimeout(this.setCanvasSize, 1000)
            // setTimeout(this.initEngine, 2000)
            setTimeout(this.initWorker, 2000)

        })
        // let worker = new Worker('../../worker.js')
    },
    beforeDestroy(){
        window.removeEventListener("message", this.receiveMessage, false)
        window.removeEventListener("message", this.onWindowResize, false)
    }
}
</script>

<style lang="less">
#canvas {
    width: 100%;
    height: 100%;
    display: block;
}
</style>
