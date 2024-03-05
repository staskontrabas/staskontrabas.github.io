importScripts('UBViewer.js')
importScripts('jszip.min.js')

let mdl = null

const api_fetch = (params) => {
    return fetch('https://cloud.ubdev.ru/api/v1/files/' + params.id + '/' + params.tag, {
        method: 'GET',
        headers: {authorization: 'Bearer ' + params.token}
    })
    .then(response => {
        if(params.type == 'blob'){
            return response.blob().then(blob => {
                if(response.ok){
                    return blob
                }
                if(!response.ok){
                    if(response.status === 401){
                        console.log('status === 401')
                    }
                    const error = {
                        message: (data && data.message) || response.statusText,
                        status: response.status,
                        data: data
                    }
                    return Promise.reject(error)
                }
            })
        }
        if(params.type == 'text'){
            return response.text().then(text => {
                let data = text// && JSON.parse(text)
                if(data){
                    try{
                        data = JSON.parse(text || null)
                    }
                    catch(e){
                        data = {code: 1000, error: 'error: No JSON format'}
                    }
                }
                if (!response.ok) {
                    if (response.status === 401) {
                        //logout();
                        //location.reload(true)
                    }
                    const error = {
                        message: (data && data.message) || response.statusText,
                        status: response.status,
                        data: data
                    }
                    //console.log('error', error)
                    return Promise.reject(error)
                }
                return data
            })
        }
    })
}

const getFile = (params) => {
    // params = {
    //     type: 'text' || 'blob',
    //     id: 'file_id',
    //     token: 'token',
    //     tag: 'file_tag'
    // }
    return new Promise((resolve, reject) => {
        api_fetch(params)
        .then(res => {
            resolve(res)
        })
        .catch(er => reject(er))
    })
}

const aqq = (filesList, zip) => {
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
}

const createFile = (file) => {
    let aDataArray = file.data
    const aDataBuffer = mdl._malloc(aDataArray.length)
    mdl.HEAPU8.set(aDataArray, aDataBuffer)
    mdl['FS_createDataFile'](file.path, file.name, aDataArray, true, true)
    mdl._free(aDataBuffer)
}
const getInformJson = (params) => {
    return new Promise(resolve => {
        new Promise(resolve => {
            getFile({
                id: params.id,
                type: 'text',
                tag: 'info',
                token: params.token
            })
            .then(res => {
                if(res.tags['mini.json']){
                    return getFile({
                        id: params.id,
                        tag: 'mini.json',
                        token: params.token,
                        type: 'blob'
                    })
                    .then(res => {
                        resolve(res.arrayBuffer())
                    })
                }
                else if(res.tags['json.zip']){
                    return getFile({
                        id: params.id,
                        tag: 'json.zip',
                        token: params.token,
                        type: 'blob'
                    })
                    .then(res => {
                        return Promise.resolve(res)
                    })
                    .then(res => JSZip.loadAsync(res))
                    .then(zip => {
                        let filesList = Object.keys(zip.files)
                        resolve(zip.file(filesList[0]).async("uint8array"))
                    })
                }
                else{
                    return getFile({
                        id: params.id,
                        tag: 'json',
                        token: params.token,
                        type: 'blob'
                    })
                    .then(res => {
                        resolve(res.arrayBuffer())
                    })
                }
            })
        })
        .then(r => {
            return createFile({
                data: new Uint8Array(r),
                name: 'json',
                path: '/'
            })
        })
        .then(r => {
            // this.filters = true
            // this.filterList = [...this.filterList, no_filter]
            resolve('/json')
        })
    })
}

const onLoadApplyFilters = (v) => {
    self.postMessage({
        action: 'onLoadApplyFilters',
        value: v
    })
}

const initCanvas = (data) => {
    new Module({
        canvas: data.canvas
    }).then(m => {
        mdl = m
        m.setGetCanvasWidthCallback(() => data.width)
        m.setGetCanvasHeightCallback(() => data.height)
        m.setGetDevicePixelRatioCallback(() => data.pxlratio)
        // module.setGetDevicePixelRatioCallback(pxlRt(data.pxlratio))

        m.setOnFiltersApplyCallback(
            v => onLoadApplyFilters(v)
        )
        m.setViewCubeSize(40 / data.pxlratio)
        m.setSelectionMode(false)
        m.resizeEvent()
        self.postMessage({action: 'ready'})
    })
}

const mouseEvent = (data) => {
    if(mdl){
        let event = new mdl.EmscriptenMouseEvent()
        event.targetX = data.ex
        event.targetY = data.ey
        event.button  = data.btn
        event.buttons = data.btns
        mdl.mouseEvent(data.type, event)
    }
}

const onReadyModel = (v) => {
    self.postMessage({
        action: 'onReadyModel',
        value: v
    })
    getRoomsColors()
}

const getRoomsColors = () => {
    new Promise(resolve => {
        resolve(mdl.getRoomsColors())
    })
    .then(res => {
        let colors = JSON.parse(res)
        self.postMessage({
            action: 'getRoomsColors',
            value: colors.rooms
        })
    })
}

const initModel = (data) => {
    getFile({
        id: data.id,
        type: 'blob',
        tag: 'obj.zip',
        token: data.token
    })
    .then(blob => JSZip.loadAsync(blob))
    .then(zip => {
        let filesList = Object.keys(zip.files)
        return Promise.all(aqq(filesList, zip))
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
            createFile(res.mtl)
            createFile(res.obj)
            resolve(res)
        })
    })
    .then(res => {
        self.postMessage({
            action: 'onStartLoadFilters',
            value: true
        })

        return new Promise((resolve) => {
            getInformJson({
                id: data.id,
                token: data.token
            })
            .then(pathJson => {
                mdl.loadModel(res.obj.name, res.obj.path, pathJson)
                resolve(true)
            })
        })
    })
    .then(res => {
        return new Promise((resolve) => {
            mdl.disableFilters()
            resolve(true)
        })
    })
    .then(res => {
        onReadyModel(true)
    })
    .catch(er => {
        console.log('er', er)
    })
}

self.onmessage = function(evt){
    switch(evt.data.action){
        case 'canvas': initCanvas(evt.data.props)
            break
        case 'mouseevent': mouseEvent(evt.data.props)
            break
        case 'loadModel': initModel(evt.data.props)
            break
        default: ;
    }
}
