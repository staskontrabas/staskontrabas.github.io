<template>
    <canvas id="canvas" ref="canvas"></canvas>
</template>

<script>
import UBViewer from '@/plugins/UBViewer.js'
import * as JSZip from 'jszip'
import * as JSZipUtils from 'jszip-utils'
import {loadUBViewSceneFromBinData} from '@/utils/binloader'

export default {
    name: 'UbviewerEngine',
    data: () => ({
        canvas: null,
        UBViewer: null,
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
        deltaName: {},

        store: null,
        bindata: false
    }),
    methods: {
        setCanvasSize(){
            this.canvas = this.$refs['canvas']
            let el = this.$el
            let parent = this.$parent.$el
            const devicePixelRatio = window.devicePixelRatio || 1
            const widthC = parent.offsetWidth
            const heightC = parent.offsetHeight
            this.CanvasWidth = widthC
            this.CanvasHeight = heightC
            this.devicePixelRatio = devicePixelRatio

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
            this.UBViewer.setViewCubeVisible(v.value)
        },
        displayGrid(v){
            this.UBViewer.setGridVisible(v.value)
        },
        setSelectionMode(v){
            this.UBViewer.setSelectionMode(v.value)
        },
        selectObjectById(v){
            this.UBViewer.selectObjectById(v.value)
        },
        clearSelection(v){
            this.UBViewer.clearSelection()
        },
        onCalculateCollisions(){
            this.collisions = true
            window.parent.postMessage({
                action: 'onLoadCollisions',
                value: true
            }, "*")
        },
        loadCollisions(){
            console.log('loadCollisions run')
            return new Promise((resolve, reject) => {
                const getCollisions = () => {
                    this.$store.dispatch('getCollisions', {
                        token: this.token,
                        files: this.modelId,
                        url: ''
                    })
                    .then(res => {
                        console.log('getCollisions', res)
                        if(res.status == -1){
                                console.log('result', res.task_id)
                            resolve(res.task_id)
                        }
                        else if(res.status == -2){
                            console.log('get collisions error: ', res.message)
                            reject({message: res.message})
                        }
                        else{
                            setTimeout(getCollisions, 5000)
                        }
                    })
                    .catch(er => {
                        console.log('get collisions error: ', er)
                        reject({message: er})
                    })
                }
                getCollisions()

            })
        },
        getCollisions(){
            // this.UBViewer.calculateCollisions()
            let task_id = ''
            return new Promise((resolve, reject) => {
                if(this.collisions){
                    resolve(true)
                }
                else{
                    this.loadCollisions()
                    .then(res => {
                        console.log('getCollisions result', res)
                        task_id = res
                        return this.$store.dispatch('getCollisionsJson', {
                            token: this.token,
                            files: this.modelId,
                            url: '/' + task_id + '/collisions.json',
                            typeBlob: 'blob'
                        })
                    })
                    .then(res => {
                        return res.file.arrayBuffer()
                    })
                    .then(r => {
                        return this.createFile({
                            data: new Uint8Array(r),
                            name: task_id + '_collisions.json',
                            path: '/'
                        })
                    })
                    .then(res => {
                        console.log('load collisions')
                        this.UBViewer.loadCollisions('/' + task_id + '_collisions.json')
                        return true
                    })
                    .then(r => {
                        console.log('load collisions end')
                        this.collisions = true
                        window.parent.postMessage({
                            action: 'onLoadCollisions',
                            value: true
                        }, "*")
                        resolve(true)
                    })
                }
            })
        },
        loadBackground(id, sts){
            console.log('loadBackground run')
            return new Promise((resolve, reject) => {
                const getBackground = () => {
                    this.$store.dispatch('getBackground', {
                        token: this.token,
                        url: id
                    })
                    .then(res => {
                        console.log('getBackground', res)
                        if(res.status == -1){
                                console.log('result', res.id)
                            resolve(id)
                        }
                        else if(res.status == -2){
                            console.log('get Background error: ', res.message)
                            reject({message: res.message})
                        }
                        else{
                            setTimeout(getBackground, 5000)
                        }
                    })
                    .catch(er => {
                        console.log('get Background error: ', er)
                        reject({message: er})
                    })
                }
                if(sts == -1){
                    resolve(id)
                }
                else if(sts == -2){
                    reject({message: 'get background ERROR' })
                }
                else{
                    getBackground()
                }
            })
        },
        getBackground(){
            let task_id = ''
            return new Promise((resolve, reject) => {
                if(this.collisions){
                    resolve(true)
                }
                else{
                    this.$store.dispatch('getBackgroundId', {
                        token: this.token,
                        coord: {
                            lat: 55.753551,
                            lon: 37.618067,
                            siz: 0.5
                        }
                    })
                    .then(res => {
                        return this.loadBackground(res.id, res.status)
                    })
                    .then(res => {
                        return this.$store.dispatch('getBackground', {
                            token: this.token,
                            url: res + '/output',
                            typeBlob: 'blob'
                        })
                    })
                    .then(res => JSZip.loadAsync(res))
                    .then(zip => {
                        let filesList = Object.keys(zip.files)
                        return Promise.all(this.aqq(filesList, zip))
                    })
                    .then(res => {
                        console.log('zip out', res)
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
                            if(res.mtl){
                                this.createFile(res.mtl)
                            }
                            this.createFile(res.obj)
                            resolve(res)
                        })
                    })
                    .then(res => {
                        console.log('file name', res)
                        const bgTrsf = {
                            "Transformation": {
                                "translation": [100.0, 0.0, 0.0],
                                "rotation": [0.0, 0.0, 1.0, 90.0],
                                "scale": 1.0
                            }
                        }
                        this.UBViewer.loadBackground(res.obj.name, res.obj.path, JSON.stringify(bgTrsf))
                    })
                }
            })
        },
        // getCollisions(task_id){
        //     // this.UBViewer.calculateCollisions()
        //     return new Promise((resolve, reject) => {
        //         let list = this.modelId.map(m => {
        //             // return this.$store.dispatch('getFile', {
        //             //     id: m + '/collisions.json',
        //             //     token: this.token,
        //             //     typeBlob: 'blob'
        //             // })
        //             this.$store.dispatch('getCollisionsJson', {
        //                 token: this.token,
        //                 files: this.modelId,
        //                 url: '/' + task_id + '/collisions.json',
        //                 typeBlob: 'blob'
        //             })
        //             .then(res => {
        //                 return res.file.arrayBuffer()
        //             })
        //             .then(r => {
        //                 return this.createFile({
        //                     data: new Uint8Array(r),
        //                     name: m + '_collisions.json',
        //                     path: '/'
        //                 })
        //             })
        //             .then(res => {
        //                 console.log('load collisions')
        //                 this.UBViewer.loadCollisions('/' + m + '_collisions.json')
        //                 return true
        //             })
        //         })
        //
        //         Promise.all(list)
        //         .finally(r => {
        //             console.log('load collisions end')
        //             this.collisions = true
        //             resolve(true)
        //         })
        //         .catch(e => {
        //             console.log('load collisions error', e)
        //             reject(e)
        //         })
        //     })
        // },
        setCollisions(v){
            if(v.value == true){
                if(!this.collisions){
                    this.getCollisions()
                    .then(res => {
                        this.UBViewer.setCollisionsVisible(true)
                    })
                }
                else{
                    this.UBViewer.setCollisionsVisible(true)
                }
            }
            else{
                this.UBViewer.setCollisionsVisible(false)
            }
        },
        setWalkView(v){
            this.UBViewer.setWalkView(v.value)
        },
        setView(v){
            this.UBViewer[v.name]()
        },
        // updateCanvasSize(){
        //     this.setCanvasSize()
        // },
        // onObjectSelected(Id) {
        //     console.log(Id)
        // },
        onSelected(id) {
            console.log("SELECTED ID: ", id, id.size())
            let a = []
            for(let i = 0; i < id.size(); i++){
                a.push(id.get(i))
                console.log('SELECTED ID: ',id.get(i))
            }
            window.parent.postMessage({
                action: 'onSelected',
                id: a
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
                        this.UBViewer.loadInformJson('/' + no_filter + '_filters.json')
                        return true
                    })
                    .then(r => {
                        this.UBViewer.disableFilters()
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
                // console.log('ionFilter', o, value.filter)
                switch(value.filter){
                    case 'category':
                                    this.UBViewer.setCategoryFilter(value.name, value.active)
                                    break
                    case 'type':    this.UBViewer.setGroupFilter(
                                                        value.category,
                                                        value.name,
                                                        value.active
                                    )
                                    break
                    case 'clear':   this.UBViewer.clearFilters()
                                    break
                    case 'enable':  this.UBViewer.enableFilters()
                                    break
                    case 'disable': this.UBViewer.disableFilters()
                                    break
                    default: ;
                }
            })
        },
        onHideObject(a){
            let objs = new this.UBViewer.StringList()
            a.map(i => {
                objs.push_back(i)
            })
            this.UBViewer.hideObjects(objs)
            this.onGetHiddenObjects()
        },
        onShowObject(a){
            let objs = new this.UBViewer.StringList()
            a.map(i => {
                objs.push_back(i)
            })
            this.UBViewer.showObjects(objs)
            this.onGetHiddenObjects()
        },
        onRoomVisibility(d){
            if(d.value){
                this.UBViewer.showAllRooms()
            }
            else{
                this.UBViewer.hideAllRooms()
            }
        },
        onRoomVisibilityItem(d){
            // this.UBViewer.setRoomVisibilityById(d.value.id, d.value.val)
            let objs = new this.UBViewer.StringList()
            d.value.ids.map(i => {
                objs.push_back(i)
            })
            if(d.value.val){
                this.UBViewer.showRooms(objs)
            }
            else{
                this.UBViewer.hideRooms(objs)
            }
            // this.onGetHiddenObjects()
        },
        onSection(d){
            if(d.value){
                this.UBViewer.createSectionBox()
            }
            else{
                this.UBViewer.removeSectionBox()
            }
        },
        onComputeRepeat(d){
            let res = this.UBViewer.computeDuplicatedObjects()
            window.parent.postMessage({
                action: 'saveCollisionReports',
                value: {...JSON.parse(res), group: d.value.group, rule: d.value.rule, part: d.value.part}
            }, "*")
        },
        onComputeDistance(data){
            let params = {
                Lhs:{
                    Ids: data.value.lhs
                },
                Rhs:{
                    Ids: data.value.rhs
                },
                DistanceOperator: {
                    Method: data.value.Method,
                    SubMethod: data.value.SubMethod,
                }
            }
            if(data.value.MinDistance >= 0){
                params.DistanceOperator.MinDistance = data.value.MinDistance
            }
            if(data.value.MaxDistance >= 0){
                params.DistanceOperator.MaxDistance = data.value.MaxDistance
            }
            console.log('>>>onComputeDistance params', params)
            let res = this.UBViewer.checkMinMaxDistance(JSON.stringify(params))
            window.parent.postMessage({
                action: 'saveCollisionReports',
                value: {...JSON.parse(res), group: data.value.group, rule: data.value.rule, part: data.value.part}
            }, "*")
        },
        onComputeSpace(data){
            let lhs = JSON.stringify({Ids: data.value.lhs, Restrictions: data.value.axes})
            let rhs = JSON.stringify({Ids: data.value.rhs, Restrictions: data.value.axes})
            console.log('>>>onComputeSpace lhs, rhs', lhs, rhs)
            let res = this.UBViewer.computeSpatialCollisions(lhs, rhs)
            window.parent.postMessage({
                action: 'saveCollisionReports',
                value: {...JSON.parse(res), group: data.value.group, rule: data.value.rule, part: data.value.part}
            }, "*")
        },
        onComputeCollisions(d){
            this.getCollisions()
            .then(res => {
                let list_1 = new this.UBViewer.StringList()
                d.value.list_1.map(l => {
                    list_1.push_back(l)
                })
                let list_2 = new this.UBViewer.StringList()
                d.value.list_2.map(l => {
                    list_2.push_back(l)
                })
                let result = this.UBViewer.computeCollisionsByIds(list_1, list_2)
                window.parent.postMessage({
                    action: 'saveCollisionReports',
                    value: {...JSON.parse(result), group: d.value.group, rule: d.value.rule, part: d.value.part}
                }, "*")
            })
        },
        checkNumberOfObjectsIntoRooms(d){
            let roomIds = new this.UBViewer.StringList()
            d.value.roomIds.map(l => {
                roomIds.push_back(l)
            })
            let entityIds = new this.UBViewer.StringList()
            d.value.entityIds.map(l => {
                entityIds.push_back(l)
            })
            let res = this.UBViewer.checkNumberOfObjectsIntoRooms(roomIds, entityIds, d.value.controlNumber)
            window.parent.postMessage({
                action: 'saveCollisionReports',
                value: {...JSON.parse(res), group: d.value.group, rule: d.value.rule, part: d.value.part}
            }, "*")
        },
        onSetColorForObjects(d){
            let list = new this.UBViewer.StringList()
            d.value.list.map(l => {
                list.push_back(l)
            })
            this.UBViewer.setColorForObjects(list, d.value.color)
        },
        onSetColorsForObjects(d){
            this.UBViewer.setColorsForObjects(JSON.stringify(d.value))
        },
        onUnsetColorsForObjects(){
            this.UBViewer.unsetColorsForObjects()
        },
        onObjectsHighlight(d){
            let list = new this.UBViewer.StringList()
            d.value.list.map(l => {
                list.push_back(l)
            })
            this.UBViewer.setObjectsHighlight(list, d.value.active)
        },
        onShowObjectsOnly(d){
            if(d.value.active){
                // this.UBViewer.disableObjectsOnlyMode()
                let list = new this.UBViewer.StringList()
                d.value.list.map(l => {
                    list.push_back(l)
                })
                this.UBViewer.showObjectsOnly(list)
            }
            else{
                this.UBViewer.disableObjectsOnlyMode()
            }
        },
        onCreateSectionBoxForObjects(d){
            if(d.value.active){
                let list = new this.UBViewer.StringList()
                d.value.list.map(l => {
                    list.push_back(l)
                })
                this.UBViewer.createSectionBoxForObjects(list)
            }
            else{
                this.UBViewer.removeSectionBox()
            }
        },
        onCollisionsActive(d){
            let list = new this.UBViewer.StringList()
            d.value.list.map(l => {
                list.push_back(l)
            })
            this.UBViewer.setCollisionsActive(list, d.value.active)

            window.parent.postMessage({
                action: 'onRender',
                value: true
            }, "*")
        },
        onShowCollisionsOnly(d){
            if(d.value.active){
                this.UBViewer.disableObjectsOnlyMode()
                let list = new this.UBViewer.StringList()
                d.value.list.map(l => {
                    list.push_back(l)
                })
                this.UBViewer.showCollisionsOnly(list)
            }
            else{
                this.UBViewer.disableCollisionsOnlyMode()
            }
        },
        onCreateSectionBoxForCollisions(d){
            if(d.value.active){
                let list = new this.UBViewer.StringList()
                d.value.list.map(l => {
                    list.push_back(l)
                })
                this.UBViewer.createSectionBoxForCollisions(list)
            }
            else{
                this.UBViewer.removeSectionBox()
            }
        },
        onRemoveSectionBox(){
            this.UBViewer.removeSectionBox()
        },
        onLoadApplyFilters(v){
            window.parent.postMessage({
                action: 'onLoadApplyFilters',
                value: v
            }, "*")
        },
        onLoadModel(v){
            window.parent.postMessage({
                action: 'onLoadModel',
                value: v,
                bindata: this.bindata
            }, "*")
            this.getRoomsColors()
        },
        onReadyModel(v){
            window.parent.postMessage({
                action: 'onReadyModel',
                value: v,
                bindata: this.bindata
            }, "*")
            this.getRoomsColors()
        },
        onReadyExt(v){
            window.parent.postMessage({
                action: 'onReadyModel',
                value: v
            }, "*")
        },
        getRoomsColors(){
            new Promise(resolve => {
                resolve(this.UBViewer.getRoomsColors())
            })
            .then(res => {
                let colors = JSON.parse(res)
                window.parent.postMessage({
                    action: 'getRoomsColors',
                    value: colors.rooms
                }, "*")
            })
        },
        onGetHiddenObjects(){
            let ar = []
            let objs = this.UBViewer.hiddenObjects()
            for(let i = 0, len = objs.size(); i < len; i++){
                ar = [...ar, objs.get(i)]
            }
            window.parent.postMessage({
                action: 'onGetHiddenObjects',
                value: ar
            }, "*")
        },
        onDelta(d){
            this.UBViewer.clear()
            if(!d.value){
                let model = this.modelName[this.modelId[0]]
                this.UBViewer.loadModelAsync(model.name, model.path, model.pathJson)
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
                            if(res.mtl){
                                this.createFile(res.mtl)
                            }
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
                                if(this.bindata){
                                    return 'delta'
                                }
                                else{
                                    return this.getInformJson({id: d.id, type: d.prop.type})
                                }
                            })
                            .then(pathJson => {
                                this.deltaName[d.id] = {
                                    name: res.obj.name,
                                    path: res.obj.path,
                                    pathJson: deltaJson
                                }
                                let model = this.modelName[this.modelId[0]]
                                this.UBViewer.loadDelta(
                                    model.name,
                                    model.path,
                                    'model',
                                    res.obj.name,
                                    res.obj.path,
                                    pathJson,
                                    deltaJson
                                )
                                this.store = {
                                    filters: [],
                                    source: '',
                                    rooms: {
                                        list: []
                                    },
                                    properties: [], //массив объектов
                                    objectsMap: {}, //объект объектов
                                    levelsMap: {}
                                }

                                if(loadUBViewSceneFromBinData(d.id, res.obj.data.buffer, this.store)){
                                    window.parent.postMessage({
                                        action: 'onDeltaWorker',
                                        store: this.store
                                    }, "*")
                                        console.log('--------frame', this.store)
                                    this.store = null
                                }
                                else{
                                    console.log('--------frame no')
                                }

                                resolve(true)
                            })
                        })
                    })
                }
                else{
                    let delta = this.deltaName[d.id]
                    let model = this.modelName[this.modelId[0]]
                    this.UBViewer.loadDeltaAsync(
                        model.name,
                        model.path,
                        'model',
                        delta.name,
                        delta.path,
                        'delta',
                        delta.pathJson
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
        onScreenShot(data){
    return
            let fid = this.modelId[0]
            let point = this.modelName[fid].path + this.modelName[fid].name
            console.log('unlink point', point)
            this.UBViewer['FS'].unlink(point)
return

            this.UBViewer.makeScreenshot("screen.png")
            let screen = this.UBViewer.FS.readFile('screen.png')
            let blob = new Blob([screen], {type: "image/png"})
            let urlCreator = window.URL || window.webkitURL
            let imageUrl = urlCreator.createObjectURL(blob)


            let canvas = document.createElement('canvas')
            let context = canvas.getContext('2d')
            let image = new Image()
            let url = ''
            image.onload = function(){
                let prc = image.width / 500
                canvas.width = image.width / prc
                canvas.height = image.height / prc
                context.drawImage(image,0,0,image.width / prc,image.height / prc)

                canvas.toBlob((blob) => {
                    let urlCreator = window.URL || window.webkitURL
                    url = urlCreator.createObjectURL(blob)

                    window.parent.postMessage({
                        action: 'getScreenShot',
                        blob: url
                    }, "*")
                })
            }
            image.src = imageUrl
        },
        onInitMarker(data){
            // console.log('onSetMarkerColor',data.id, r, g, b)
            const marker = this.UBViewer.createMarker(data.id, data.size || 10)
            this.UBViewer.setMarkerColor(data.id, data.r, data.g, data.b, 0)
        },
        onCreateMarker(data){
            // console.log('onSetMarkerColor',data.id, r, g, b)
            const marker = this.UBViewer.createMarker(data.id, data.size || 10)
            this.UBViewer.setMarkerColor(data.id, data.r, data.g, data.b, 0)
            window.parent.postMessage({
                action: 'onCreateMarker',
                marker:{
                    eid: marker.id,
                    size: marker.size,
                    up: {
                        x: marker.up.x,
                        y: marker.up.y,
                        z: marker.up.z
                    },
                    dir: {
                        x: marker.dir.x,
                        y: marker.dir.y,
                        z: marker.dir.z
                    },
                    eye: {
                        x: marker.eye.x,
                        y: marker.eye.y,
                        z: marker.eye.z
                    },
                    dist: marker.dist,
                    clr: {
                        r: data.r,
                        g: data.g,
                        b: data.b
                    }
                }
            }, "*")
        },
        onAddMarker(data){
            let {id, size, up, dir, eye, dist} = data
            up = new this.UBViewer.gp_Dir(up)
            dir = new this.UBViewer.gp_Dir(dir)
            eye = new this.UBViewer.gp_Pnt(eye)
            const marker = this.UBViewer.Marker(id, size, up, dir, eye, dist)
            this.UBViewer.addMarker(marker)
        },
        onShowAllMarkers(){
            this.UBViewer.showAllMarkers()
        },
        onHideAllMarkers(){
            this.UBViewer.hideAllMarkers()
        },
        onShowMarker(data){
            this.UBViewer.showMarker(data.id)
        },
        onHideMarker(data){
            this.UBViewer.hideMarker(data.id)
        },
        onGotoMarker(data){
            this.UBViewer.gotoMarker(data.id)
        },
        onSetMarkerColor(data){
            this.UBViewer.setMarkerColor(data.id, data.r, data.g, data.b, data.a)
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
            this.UBViewer.disableFilters()
        },
        loadModel(v){
            console.log('FRAME loadModel', v)
            this.modelJsonType = v.prop.json
            this.modelType = v.prop.type
            this.modelId = [...this.modelId, v.id]
            this.token = v.token

            this.$store.dispatch('getFile', {
                id: v.id + (v.prop.type == 'zip' ? '' : '/obj.zip'),
                token: v.token,
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
                console.log('createFile res ', res)
                return new Promise((resolve) => {
                    if(res.files.length){
                        res.files.map(file => {
                            this.createFile(file)
                        })
                    }
                    if(res.mtl){
                        this.createFile(res.mtl)
                    }

                    this.store = {
                        filters: [],
                        source: '',
                        rooms: {
                            list: []
                        },
                        properties: [], //массив объектов
                        objectsMap: {}, //объект объектов
                        levelsMap: {}
                    }
                    if(loadUBViewSceneFromBinData(v.id, res.obj.data.buffer, this.store)){
                        this.bindata = true
                        window.parent.postMessage({
                            action: 'propertiesModel',
                            store: this.store
                        }, "*")
                    }

                    this.createFile(res.obj)
                    resolve({files: res})
                })
            })
            .then(res => {
                console.log('load model')
                window.parent.postMessage({
                    action: 'onStartLoadFilters',
                    value: true
                }, "*")
                return new Promise((resolve) => {
                    if(!this.bindata && v.prop.type != 'zip'){
                        this.getInformJson({id: v.id, type: v.prop.type})
                        .then(pathJson => {
                            resolve({
                                name: res.files.obj.name,
                                path: res.files.obj.path,
                                pathJson: pathJson
                            })
                        })
                    }
                    else{
                        window.parent.postMessage({
                            action: 'onStartLoadFilters',
                            value: true
                        }, "*")
                        resolve({
                            name: res.files.obj.name,
                            path: res.files.obj.path,
                            pathJson: ''
                        })
                    }
                })
            })
            .then(res => {
                this.store = null
                this.modelName[v.id] = res
                if(v.prop.type == 'zip'){
                    this.UBViewer.loadOBJ(res.name, res.path)
                    window.parent.postMessage({
                        action: 'onReadyModel',
                        value: v,
                        bindata: false
                    }, "*")
                }
                else{
                    this.UBViewer.loadModelAsync(res.name, res.path, res.pathJson)
                }
            })
            .then(res => {
                return new Promise((resolve) => {
                    this.disableFilters()
                    resolve(true)
                })
            })
            // .then(res => {
            //     // this.getBackground()
            //     this.onReadyModel(true)
            // })
        },
        loadExt(v){
            console.log('FRAME load ', v.type)
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
                console.log('createFile res ', res)

                return new Promise((resolve) => {
                    this.createFile({
                        data: new Uint8Array(res),
                        name: v.id + '_' + v.type,
                        path: '/'
                    })
                    console.log('create file')
                    resolve({name: v.id + '_' + v.type, path: '/'})
                })
            })
            .then(res => {
                // console.log('load d' + v.type, res)
                return new Promise((resolve) => {
                    switch(v.type){
                        case 'dwg':
                            // this.UBViewer.loadDWG('/data/test2.dwg')
                            this.UBViewer.loadDWG(res.name)
                            break
                        case 'dxf':
                            this.UBViewer.loadDXF(res.path + res.name)
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
                if(i.split('.').pop() === 'obj'){
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
                else if(i.split('.').pop() === 'mtl'){
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
                            let path = i.split('/')
                            let mainname = i.substring(0, i.indexOf('_'))
                            return Promise.resolve({
                                type: 'file',
                                path: '/' + path[0],
                                name: path[1],
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
            // let aDataArray = file.data
            // const aDataBuffer = this.UBViewer._malloc(aDataArray.length)
            // this.UBViewer.HEAPU8.set(aDataArray, aDataBuffer)
            // this.UBViewer['FS_createDataFile'](file.path, file.name, aDataArray, true, true)
            // this.UBViewer._free(aDataBuffer)
            this.UBViewer['FS'].writeFile(file.path + file.name, file.data)
        },
        onClearFS(data){
            this.modelId.map(mid => {
                let point = this.modelName[mid].path + this.modelName[mid].name
                this.UBViewer['FS'].unlink(point)
            })
            this.delta.map(did => {
                let point = this.deltaName[did].path + this.deltaName[did].name
                this.UBViewer['FS'].unlink(point)
            })
            // this.UBViewer.abort()

            window.parent.postMessage({
                action: 'onClearFS'
            }, "*")
        },
        receiveMessage(e){
            if(Object.prototype.hasOwnProperty.call(e.data, 'action')){
                switch(e.data.action){
                    case 'loadModel':
                        this.loadModel(e.data)
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
                    case 'onComputeRepeat': this.onComputeRepeat(e.data)
                        break
                    case 'onComputeSpace': this.onComputeSpace(e.data)
                        break
                    case 'onComputeDistance': this.onComputeDistance(e.data)
                        break
                    case 'checkNumberOfObjectsIntoRooms': this.checkNumberOfObjectsIntoRooms(e.data)
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
                    case 'onScreenShot': this.onScreenShot(e.data)
                        break

                    case 'onInitMarker': this.onInitMarker(e.data)
                        break
                    case 'onCreateMarker': this.onCreateMarker(e.data)
                        break
                    case 'onShowMarker': this.onShowMarker(e.data)
                            break
                    case 'onHideMarker': this.onHideMarker(e.data)
                            break
                    case 'onShowAllMarkers': this.onShowAllMarkers(e.data)
                            break
                    case 'onHideAllMarkers': this.onHideAllMarkers(e.data)
                            break
                    case 'onGotoMarker': this.onGotoMarker(e.data)
                            break
                    case 'onSetMarkerColor': this.onSetMarkerColor(e.data)
                            break
                    case 'onClearFS': this.onClearFS(e.data)
                            break
                    default: ;
                }
            }
        },
        initEngine(){
            if(this.UBViewer === null){
                let cnvs = this.$refs['canvas']
                // let offscreen = cnvs.transferControlToOffscreen()
                new UBViewer({
                    canvas: cnvs
                }).then(ubviewer => {
                    console.log('UBViewer', ubviewer)
                    this.UBViewer = ubviewer

                    this.UBViewer.setGetCanvasWidthCallback(
                        () => this.getCanvasWidth()
                    )
                    this.UBViewer.setGetCanvasHeightCallback(
                        () => this.getCanvasHeight()
                    )

                    this.UBViewer.showProxyObjects(true)
                    let VK_LeftButton = 1 << 13
                    let VK_CTRL = 1 <<  9
                    let MouseGesture_SelectRectangle = 1
                    this.UBViewer.setMouseGesture( VK_LeftButton | VK_CTRL,  MouseGesture_SelectRectangle)

                    this.UBViewer.setOnSelectedCallback(
                        id => this.onSelected(id)
                    )
                    // this.UBViewer.setOnProgressCallback(
                    //     v => this.onLoadModel(v)
                    // )
                    this.UBViewer.setOnModelLoadedCallback(
                        v => this.onLoadModel(v)
                    )
                    this.UBViewer.setOnFiltersApplyCallback(
                        v => this.onLoadApplyFilters(v)
                    )
                    this.UBViewer.setCollisionsCallback(
                        v => this.onCalculateCollisions(v)
                    )
                    // this.UBViewer.setCollisionMargin(-5.0)

                    this.UBViewer.setViewCubeSize(40 / this.getDevicePixelRatio())
                    this.UBViewer.setSelectionMode(false)
                    this.UBViewer.resize()

                    window.parent.postMessage({action: 'ready'}, "*")
                    window.addEventListener("resize", this.onWindowResize, false)
                })
            }
        },
        onWindowResize(){
            this.setCanvasSize()
            this.UBViewer.setGetCanvasWidthCallback(
                () => this.getCanvasWidth()
            )
            this.UBViewer.setGetCanvasHeightCallback(
                () => this.getCanvasHeight()
            )
            this.UBViewer.resize()
        },
    },
    mounted(){
        window.addEventListener("message", this.receiveMessage, false)
    window.addEventListener("unload", (e) => {
        console.log('+55++++++++++++++++++++++++++++++++++++++++++++++ close')
        // this.UBViewer.forceExitRuntime()
        this.UBViewer = null
        console.log('+55+ this.UBViewer', this.UBViewer)
    }, false)
        this.$nextTick(() => {
            setTimeout(this.setCanvasSize, 1000)
            setTimeout(this.initEngine, 2000)

        })
        // let worker = new Worker('../../worker.js')
    },
    beforeDestroy(){
        window.removeEventListener("message", this.receiveMessage, false)
        window.removeEventListener('resize', this.onWindowResize, false)
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
