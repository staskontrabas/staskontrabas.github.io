importScripts('jszip.min.js')

let store = {
    token: '',
    model: null,
    listModel: [],
    filters: [],
    source: '',
    rooms: {
        list: [],
        colors: [],
        load: false
    },
    set properties(v){
        this._propeerties = v
        if(v.length){
            self.postMessage({
                action: 'initWorkerParams',
                value: true,
                msg: 'init worker params',
                data: v
            })
        }
    },
    get properties(){return this._propeerties}, //массив объектов
    levels: [],
    levelsMap: {},
    objectsMap: {}, //объект объектов
    classifierList: [],
    hiddenList: []
}


const sortObj = function(ar, prop){
    return ar.sort(function (a, b) {
        if (a[prop] > b[prop]) {
            return 1
        }
        if (a[prop] < b[prop]) {
            return -1
        }
        return 0
    })
}

const w_fetch = (params) => {
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


const getFileByVersion = (f) => {
    if(f.version == null){
        return f.files[0]
    }
    else{
        let file = f.files.find(i => i.id == f.version)
        return file ? file : f.files[0]
    }
}

const initFilters = (filters) => {
    let list = filters.map(f => {
        return {
            title: f.title,
            name: f.title,
            items: f.items.map(i => {
                return {
                    name:  i.title,
                    title: i.title,
                    active: false,
                    filter: 'category',
                    items: i.grouppedByElementTypes.map(t => {
                        return {
                            active: false,
                            filter: 'type',
                            category: i.title,
                            name: t.title,
                            title: t.title,
                            items: []
                        }
                    })
                }
            })
        }
    })
    let e = []
    list.map(bi => {
        if(store.filters.some(ai => ai.title == bi.title)){
            let e1 = []
            store.filters = store.filters.map(ai => {
                if(ai.title != bi.title){
                    return ai
                }
                else{
                    bi.items.map(bi1 => {
                        if(ai.items.some(ai1 => ai1.name == bi1.name)){
                            let e2 = []
                            ai.items = ai.items.map(ai1 => {
                                if(ai1.name != bi1.name){
                                    return ai1
                                }
                                else{
                                    bi1.items.map(bi2 => {
                                        if(!ai1.items.some(ai2 => ai2.name == bi2.name)){
                                            e2 = [...e2, bi2]
                                        }
                                    })
                                    ai1.items = [...ai1.items, ...e2]
                                    return ai1
                                }
                            })
                        }
                        else{
                            e1 = [...e1, bi1]
                        }
                    })
                    ai.items = [...ai.items, ...e1]
                    return ai
                }
            })
        }
        else{
            e = [...e, bi]
        }
    })
    store.filters = [...store.filters, ...e]

    return list
}

const setProperties = (o) => {
    let list = o['Elements']
        .map(e => {
            let elem = {}
            Object.entries(e).map(([key, value]) => {
                if(o.Source == 'IFC'){
                    value.Category = key
                }
                elem = {...value, object: key, id: value.Id || value.Guid}
            })
            return elem
    })
    return list
}
const buildObjectsMap = (o) => {
    let elems = {}
    o['Elements']
        .map(e => {
            Object.entries(e).map(([key, value]) => {
                let id = value.Id || value.Guid
                if(o.Source == 'IFC'){
                    value.Category = key
                }
                elems[id] = {...value, id: id, object: key, hidden: false}
            })
    })
    return elems
}

// const initParams = (d) => {
//     store.token = d.token
//     store.model = d.model
//     store.listModel = d.listModel
//
//     new Promise((resolve, reject) => {
//         resolve(setParams())
//     })
//     .then(() => {
//         console.log('!!!!!!!!!!!!>>>>')
//         self.postMessage({
//             action: 'initWorkerParams',
//             value: true,
//             msg: 'init worker params',
//             data: store.properties
//         })
//     })
//     .catch(er => {
//         self.postMessage({
//             action: 'initWorkerParams',
//             value: false,
//             msg: er
//         })
//     })
// }

const initParams = (d) => {
    store.token = d.token
    store.model = d.model
    store.listModel = d.listModel
    store.properties = []

    let promisesList = []
    if(store.model.type == 'consolidations'){
        store.listModel.map(l => {
            if(l.tags['json'] == 1){
                let id = getFileByVersion(l).url
                promisesList.push(w_fetch({
                    id: id,
                    tag: 'json',
                    type: 'text',
                    token: store.token
                })
                .then(res => {
                    return {
                        file: id,
                        json: res
                    }
                })
                )
            }
            else if(l.tags['json.zip'] == 1){
                let id = getFileByVersion(l).url
                promisesList.push(new Promise(resolve => {
                    w_fetch({
                        id: id,
                        tag: 'json.zip',
                        type: 'blob',
                        token: store.token
                    })
                    .then(res => {
                        return Promise.resolve(res)
                    })
                    .then(res => JSZip.loadAsync(res))
                    .then(zip => {
                        let filesList = Object.keys(zip.files)
                        return zip.file(filesList[0]).async("string")
                    })
                    .then(text => {
                        resolve({file: id, json: JSON.parse(text)})
                    })
                }))
            }
        })
    }
    else{
        store.listModel = [store.model]
        if(store.model.tags['json'] == 1){
            let id = getFileByVersion(store.model).url
            promisesList.push(w_fetch({
                id: id,
                tag: 'json',
                type: 'text',
                token: store.token
            })
            .then(res => {
                return {
                    file: id,
                    json: res
                }
            })
            )
        }
        else if(store.model.tags['json.zip'] == 1){
            let id = getFileByVersion(store.model).url
            promisesList.push(new Promise(resolve => {
                w_fetch({
                    id: id,
                    tag: 'json.zip',
                    type: 'blob',
                    token: store.token
                })
                .then(res => {
                    return Promise.resolve(res)
                })
                .then(res => JSZip.loadAsync(res))
                .then(zip => {
                    let filesList = Object.keys(zip.files)
                    return zip.file(filesList[0]).async("string")
                })
                .then(text => {
                    resolve({file: id, json: JSON.parse(text)})
                })
            }))
        }
    }
    Promise.all(promisesList)
    .then(res => {
        res.map(r => {

        console.log('>>>json.json', r)
        console.log('>>>model', store.model)
            store.source = r.json.Source || null
            getParameters({names: ['source']})
            let objects = setProperties(r.json)
            store.properties = [
                ...store.properties,
                ...objects
            ]

            if(store.source == 'Revit'){
                store.levelsMap[r.file] = {}
                r.json.Levels.map(l => {
                    store.levelsMap[r.file][l.Level.Id] = {
                        ...l,
                        items: objects.filter(f => f.Level == l.Level.Id).map(m => m.id)
                    }
                })
                let stack = {}
                objects.map(o => {
                    if(!store.levelsMap[r.file][o.Level]){
                        stack[o.Level] = stack[o.Level] || {
                            Level: {
                                Id: o.Level,
                                Name: 'Уровень ' + o.Level
                            },
                            items: []
                        }
                        stack[o.Level].items.push(o.id)
                    }
                })
                store.levelsMap[r.file] = {
                    ...store.levelsMap[r.file],
                    ...stack
                }
                if(r.json.ProjectStructure){
                    r.json.ProjectStructure
                        .map(l => {
                            if(l.Room){
                                store.rooms.list.push({
                                    Id: l.Room.Id,
                                    Name: l.Room.Name,
                                    active: true
                                })
                            }
                        })
                }
            }
            else if(store.source == 'IFC'){
                store.levelsMap[r.file] = {}
                r.json.ProjectStructure
                    .map(l => {
                        if(l.IfcBuildingStorey){
                            let level = l.IfcBuildingStorey
                            level.Level = {
                                Id: level.Guid,
                                Name: level.Name
                            }
                            store.levelsMap[r.file][level.Level.Id] = {
                                ...level,
                                items: objects.filter(f => f.ParentGuid == level.Level.Id).map(m => m.id)
                            }
                        }
                        if(l.IfcSpace){
                            store.rooms.list.push({
                                Id: l.IfcSpace.Guid,
                                Name: l.IfcSpace.LongName + ' ' + l.IfcSpace.Name,
                                active: true
                            })
                        }
                    })
                let stack = {}
                objects.map(o => {
                    if(!store.levelsMap[r.file][o.ParentGuid]){
                        stack[o.ParentGuid] = stack[o.ParentGuid] || {
                            Level: {
                                Id: o.ParentGuid,
                                Name: 'Уровень ' + o.ParentGuid
                            },
                            items: []
                        }
                        stack[o.ParentGuid].items.push(o.id)
                    }
                })

                store.levelsMap[r.file] = {
                    ...store.levelsMap[r.file],
                    ...stack
                }
            }
            else{
                ;
            }
            store.objectsMap = {...store.objectsMap, ...buildObjectsMap(r.json)}
            let filters = r.json.GrouppedByCategories || []
            initFilters(filters)
        console.log('properties', store.properties)
        console.log('objectsMap', store.objectsMap)
        console.log('store', store)
        })
    })
    .catch(er => {
        console.log('Error initParam:', er)
    })
    let classifierList = []
    let no_classifier = false
    if(store.model.type == 'consolidations'){
        store.listModel.map(l => {
            if(l.tags.hasOwnProperty('classifier.json')
                && l.tags['classifier.json'] == 1){
                classifierList.push(w_fetch({
                    id: getFileByVersion(l).url,
                    tag: 'classifier.json',
                    type: 'text',
                    token: store.token
                }))
            }
            else{
                no_classifier = true
            }
        })
    }
    else{
        if(store.model.tags.hasOwnProperty('classifier.json')
            && store.model.tags['classifier.json'] == 1){
            classifierList.push(w_fetch({
                id: getFileByVersion(store.model).url,
                tag: 'classifier.json',
                type: 'text',
                token: store.token
            }))
        }
    }
    Promise.all(classifierList)
    .then(res => {
        if(no_classifier){
            store.classifierList = 'none'
        }
        else{
            res.map(r => {
                store.classifierList = [
                    ...store.classifierList,
                    ...setProperties(r)
                ]
            })
        }
        console.log('!!!!!classifier', store.classifierList)
    })
}

var  wordSearch = function(str_search, tmp_data){
    let outIndex = [];

    console.log('str search = ',str_search);
    console.log('tmp_data = ',tmp_data[0]);

    for (let i=0;i<tmp_data.length;i++){
        let out = tmp_data[i]['Name'].includes(str_search);
        if (out==true)
            outIndex.push(i);
    }

    for (let i=0;i<tmp_data.length;i++){
        let out = tmp_data[i]['id'].includes(str_search);
        if (out==true)
            outIndex.push(i);
    }

    for (let i=0;i<tmp_data.length;i++){
        let out = tmp_data[i]['Category'].includes(str_search);
        if (out==true)
            outIndex.push(i);
    }

    console.log('outIndex = ',this.outIndex);
    return outIndex;
}

const getSearch = (d) => {
    console.log(' THIS IS WORKER ');

    console.log('properties = ',store.properties);
    console.log('SearchWord = ',d.value['SearchWord']);
    // console.log('TypeSearch = ',d.value['TypeSearch']);
    // console.log('choiceRegistr = ',d.value['choiceRegistr']);
    // console.log('choiceWholly = ',d.value['choiceWholly']);

    let tmp = store.properties;
    let outSearch = [];
    let outId = [];
    let listIndex = [];

    if (d.value['choiceRegistr'] == true){
        listIndex = wordSearch(d.value['SearchWord'], tmp);
    }
    else{
        let upSearchWord = d.value['SearchWord'].charAt(0).toUpperCase() + d.value['SearchWord'].slice(1);
        let listIndexOne = wordSearch(upSearchWord, tmp);

        d.value['SearchWord'] = d.value['SearchWord'].toLowerCase();
        let listIndexTwo = wordSearch(d.value['SearchWord'], tmp);

        let data = {};
        listIndexOne.concat(listIndexTwo).forEach(function(item) {
            data[item] = true;
        });
        let result = Object.keys(data);
        // console.log('result = ',result);
        listIndex = result;``
    }


    if (listIndex.length!=0)
    for (let i=0;i<listIndex.length;i++){
            let objSearch = {};
            let index = listIndex[i];
            objSearch.Name = tmp[index]['Name'];
            objSearch.id = tmp[index]['id'];
            objSearch.Category = tmp[index]['Category'];
            objSearch.Parameters = tmp[index]['Parameters'][0]['PropertyGroupTitle'];
            objSearch.ParametersAll = tmp[index]['Parameters'][0]['PropertyList'];
            outSearch.push(objSearch);
            outId.push(tmp[index]['id']);
    }


    // console.log('outSearch = ',outSearch);
    // console.log('outId = ',outId);

    self.postMessage({
        action: 'getParamSearch',
        listSearch: outSearch,
        listSearchId: outId
    })

}

const getObjectProperties = (id) => {
    // let prop = store.properties.filter(c => (c.Guid != undefined && c.Guid == id)
    //     || (c.Id != undefined && c.Id == id))
    //
    // let valueProp = !prop.length
    //     ? {
    //         Name: '',
    //         Properties: []
    //     }
    //     : prop[0]

    let valueProp = !store.objectsMap[id]
        ? {
            Name: '',
            Properties: []
        }
        : store.objectsMap[id]

    let prop = store.classifierList != 'none'
        ? store.classifierList.filter(c => (c.Guid != undefined && c.Guid == id)
            || (c.Id != undefined && c.Id == id))
        : []
    let valueClass = prop.length
        ? prop[0]
        : store.classifierList == 'none'
            ? id
                ? 'none'
                : null
            : null

    self.postMessage({
        action: 'getObjectProperties',
        properties: valueProp,
        classifierList: valueClass
    })
}

const getParameters = (d) => {
    let props = []
    d.names.map(n => {
        props.push({
            name: n,
            value: store[n]
        })
    })

    self.postMessage({
        action: 'getParameters',
        callback: d.callback || null,
        props
    })
}

const onGetHiddenObjects = (d) => {
    // let items = store.properties.filter(c => (c.Guid != undefined && d.value.some(s => c.Guid == s))
    //     || (c.Id != undefined && d.value.some(s => c.Id == s)))
    //
    // store.hiddenList = items.map(i => ({name: i.Name, id: i.Id || i.Guid}))
    let visibleList = store.hiddenList.filter(f => !d.value.some(s => s == f.id))
    visibleList.map(v => {
        store.objectsMap[v.id].hidden = false
    })

    store.hiddenList = d.value.map(dm => {
        console.log('onGetHiddenObjects dm', dm)
        store.objectsMap[dm].hidden = true
        return {
            name: store.objectsMap[dm].Name,
            id: dm
        }
    })

    getParameters({names: ['hiddenList']})
}

const buildDispatcher = (d) => {
    let root = {
        id: 'main',
        name: d.fname,
        parent: 0,
        hidden: false,
        type: 'node',
        children: store.listModel.map(mdl => {
            let fileId = getFileByVersion(mdl).url
            let levelsKeys = Object.keys(store.levelsMap[fileId])

            let levels = {
                id: fileId,
                name: mdl.name,
                parent: 'main',
                hidden: false,
                type: 'node',
                children: levelsKeys.map(lvl => {
                    let lvl_item = store.levelsMap[fileId][lvl]
                    let group = lvl_item.items
                        .map(i => store.objectsMap[i])
                        .reduce((r, i) => {
                            r[i.Name] = r[i.Name] || []
                            r[i.Name].push(i)
                            return r
                        }, {})

                    group = Object.entries(group).map(([k, v], gi) => {
                        return {
                            name: k,
                            id: 'gr_' + lvl_item.Level.Id + '_' + gi,
                            parent: lvl_item.Level.Id,
                            hidden: v.every(e => e.hidden),
                            type: 'group',
                            children: sortObj(v.map(c => ({
                                id: c.id,
                                name: c.Name + ' | ' + c.id,
                                type: 'item',
                                hidden: c.hidden,
                                parent: 'gr_' + lvl_item.Level.Id
                            })), 'name')
                        }
                    })
                    return {
                        name: lvl_item.Level.Name,
                        id: lvl_item.Level.Id,
                        parent: fileId,
                        hidden: group.every(e => e.hidden),
                        type: 'node',
                        children: sortObj(group, 'name')
                    }
                })
            }
            levels.hidden = levels.children.every(e => e.hidden)
            return levels
        })
    }
    if(store.model.type == 'consolidations'){
        root.hidden = root.children.every(e => e.hidden)
        self.postMessage({
            action: 'buildDispatcher',
            value: [root]
        })
    }
    else{
        self.postMessage({
            action: 'buildDispatcher',
            value: root.children
        })
    }
}

const onComputeParameters = (o) => {
    const type_of = (o, v) => {
        let list = []
        switch(o.type){
            case 'boolean': list = [o.value ? 1 : 0, v == 'Да' ? 1 : 0]
                break
            case 'list': ;
            case 'string': list = [o.value, v]
                break
            case 'integer': list = [parseInt(o.value), parseInt(v)]
                break
            case 'float': list = [Number(o.value), Number(v)]
                break
            default: ;
        }
        return list
    }
    const getEqual = (eq, values) => {
        let equal = false
        switch(eq){
            case 0: equal = values[1] > values[0]
                break
            case 1: equal = values[1] == values[0]
                break
            case 2: equal = values[1] < values[0]
                break
            case 3: equal = values[1] >= values[0]
                break
            case 4: equal = values[1] <= values[0]
                break
            case 5: equal = values[1] != values[0]
                break
            default: ;
        }
        return equal
    }

    let list = []

    if(o.source == 'Revit'){
        o.elements.map(e => {
            e.list.map(id => {
                let el = store.objectsMap[id]
                el.Parameters.map(p => {
                    p.PropertyList.map(prop => {
                        e.values.map(v => {
                            if(v.name.toLowerCase() == prop.Title.toLowerCase()){
                                let values = type_of(v, prop.Value)
                                let equal = getEqual(v.equal, values)
                                if(!equal){
                                    list.push({
                                        name: el.Name,
                                        id: el.Id,
                                        property: prop.Title,
                                        value: prop.Value,
                                        valueRule: v.type == 'boolean'
                                            ? values[0] || 0
                                                ? 'Да'
                                                : 'Нет'
                                            : values[0],
                                        part: o.part
                                    })
                                }
                            }
                        })
                    })
                })
            })
        })
    }
    if(o.source == 'IFC'){
        o.elements.map(e => {
            e.list.map(id => {
                let el = store.objectsMap[id]
                el.Properties.map(p => {
                    let pset = p.PropertySet || p.Quantities || []
                    pset.map(prop => {
                        e.values.map(v => {
                            if(v.name.toLowerCase() == prop.Name.toLowerCase()
                                || (Array.isArray(v.syn)
                                    ? v.syn.some(s => s.toLowerCase() == prop.Name.toLowerCase())
                                    : false
                                )
                                || (typeof v.syn == 'string' && v.syn.toLowerCase() == prop.Name.toLowerCase())
                            ){
                                let values = type_of(v, prop.NominalValue)
                                let equal = getEqual(v.equal, values)
                                if(!equal){
                                    list.push({
                                        name: el.Name,
                                        id: el.Guid,
                                        property: prop.Name,
                                        value: prop.NominalValue || prop.Value,
                                        valueRule: v.type == 'boolean'
                                            ? values[0] || 0
                                                ? 'Да'
                                                : 'Нет'
                                            : values[0],
                                        part: o.part
                                    })
                                }
                            }
                        })
                    })
                })
            })
        })
    }
    self.postMessage({
        action: 'saveCollisionReports',
        value: {
            group: o.group,
            rule: o.rule,
            part: o.part,
            parameters: list
        }
    })
}

const getRooms = () => {
    self.postMessage({
        action: 'getRooms',
        rooms: store.rooms
    })
}

self.postMessage({
    action: 'ready',
    value: true
})

self.onmessage = function(evt){
    switch(evt.data.action){
        case 'init': initParams(evt.data)
            break
        case 'getObjectProperties': getObjectProperties(evt.data.id)
            break
        case 'getParameters': getParameters(evt.data)
            break
        case 'onGetHiddenObjects': onGetHiddenObjects(evt.data)
            break
        case 'buildDispatcher': buildDispatcher(evt.data)
            break
        case 'onComputeParameters': onComputeParameters(evt.data.value)
            break
        case 'getRooms': getRooms(evt.data.value)
            break
        case 'getSearch': getSearch(evt.data)
            break
        default: ;
    }
}
