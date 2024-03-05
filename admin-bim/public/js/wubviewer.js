importScripts('jszip.min.js')

let store = {
    token: '',
    api: {
        cloud: ''
    },
    model: null,
    listModel: [],
    filters: [],
    source: '',
    rooms: {
        list: [],
        colors: [],
        load: false
    },
    delta: [],
    deltaProperty: [],
    deltaList: {
        list: [],
        del: 0,
        mod: 0,
        add: 0
    },
    set properties(v){
        this._properties = v
        if(v.length){
            self.postMessage({
                action: 'initWorkerParams',
                value: true,
                msg: 'init worker params',
                data: v
            })
        }
    },
    get properties(){return this._properties}, //массив объектов
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
    return fetch(store.api.cloud + params.id + '/' + params.tag, {
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
    let elems = []
    list.map(part => {
        if(store.filters.some(ai => ai.title == part.title)){
            let e1 = []
            store.filters = store.filters.map(ai => {
                if(ai.title != part.title){
                    return ai
                }
                else{
                    part.items.map(part1 => {
                        if(ai.items.some(ai1 => ai1.name == part1.name)){
                            let e2 = []
                            ai.items = ai.items.map(ai1 => {
                                if(ai1.name != part1.name){
                                    return ai1
                                }
                                else{
                                    part1.items.map(part2 => {
                                        if(!ai1.items.some(ai2 => ai2.name == part2.name)){
                                            e2 = [...e2, part2]
                                        }
                                    })
                                    ai1.items = [...ai1.items, ...e2]
                                    return ai1
                                }
                            })
                        }
                        else{
                            e1 = [...e1, part1]
                        }
                    })
                    ai.items = [...ai.items, ...e1]
                    return ai
                }
            })
        }
        else{
            elems = [...elems, part]
        }
    })
    store.filters = [...store.filters, ...elems]

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
    if(o.ProjectStructure){
        if(o.Source == 'Revit'){
            o.ProjectStructure.map(p => {
                let cat = p.Room ? 'Room' : false
                if(cat){
                    list = [...list, {
                        ...p[cat],
                        object: cat,
                        id: p[cat].Id
                    }]
                }
            })
        }
        if(o.Source == 'IFC'){
            o.ProjectStructure.map(p => {
                let cat = (p.IfcBuilding ? 'IfcBuilding' : false) || (p.IfcSpace ? 'IfcSpace' : false)
                if(cat){
                    list = [...list, {
                        ...p[cat],
                        object: cat,
                        Category: cat,
                        id: p[cat].Guid
                    }]
                }
            })
        }
    }
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
    if(o.ProjectStructure){
        if(o.Source == 'Revit'){
            o.ProjectStructure.map(p => {
                let cat = p.Room ? 'Room' : false
                if(cat){
                    elems[p[cat].Id] = {
                        ...p[cat],
                        object: cat,
                        id: p[cat].Id,
                        hidden: false
                    }
                }
            })
        }
        if(o.Source == 'IFC'){
            o.ProjectStructure.map(p => {
                let cat = (p.IfcBuilding ? 'IfcBuilding' : false) || (p.IfcSpace ? 'IfcSpace' : false)
                if(cat){
                    elems[p[cat].Guid] = {
                        ...p[cat],
                        object: cat,
                        Category: cat,
                        id: p[cat].Guid,
                        hidden: false
                    }
                }
            })
        }
    }
    return elems
}

const initStore = (d) => {
    store.token = d.token
    store.api.cloud = d.api
    store.model = d.model
    store.listModel = d.listModel
    store.properties = []
}

const initParams = (d) => {
    store.listModel = d.listModel
    let promisesList = []
    if(store.model.type == 'consolidations'){
        store.listModel.map(l => {
            if(l.tags['json'] == 1){
                // let id = getFileByVersion(l).url
                promisesList.push(w_fetch({
                    id: l.id,
                    tag: 'json',
                    type: 'text',
                    token: store.token
                })
                .then(res => {
                    return {
                        file: l.id,
                        json: res
                    }
                })
                )
            }
            else if(l.tags['json.zip'] == 1){
                // let id = getFileByVersion(l).url
                promisesList.push(new Promise(resolve => {
                    w_fetch({
                        id: l.id,
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
                        resolve({file: l.id, json: JSON.parse(text)})
                    })
                }))
            }
        })
    }
    else{
        store.listModel = [store.model]
        if(store.model.tags['json'] == 1){
            // let id = getFileByVersion(store.model).url
            promisesList.push(w_fetch({
                id: l.id,
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

    setClassifier()
}

const setClassifier = () => {
    let classifierList = []
    let no_classifier = false

    store.listModel.map(l => {
        if(l.tags.hasOwnProperty('classifier.json')
            && l.tags['classifier.json'] == 1){
            classifierList.push(w_fetch({
                id: l.id, //getFileByVersion(l).url,
                tag: 'classifier.json',
                type: 'text',
                token: store.token
            }))
        }
        else{
            no_classifier = true
        }
    })
    // if(store.model.type == 'consolidations'){
    //     store.listModel.map(l => {
    //         if(l.tags.hasOwnProperty('classifier.json')
    //             && l.tags['classifier.json'] == 1){
    //             classifierList.push(w_fetch({
    //                 id: getFileByVersion(l).url,
    //                 tag: 'classifier.json',
    //                 type: 'text',
    //                 token: store.token
    //             }))
    //         }
    //         else{
    //             no_classifier = true
    //         }
    //     })
    // }
    // else{
    //     if(store.model.tags.hasOwnProperty('classifier.json')
    //         && store.model.tags['classifier.json'] == 1){
    //         classifierList.push(w_fetch({
    //             id: getFileByVersion(store.model).url,
    //             tag: 'classifier.json',
    //             type: 'text',
    //             token: store.token
    //         }))
    //     }
    // }
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


var mergeList = function(listOne,listTwo){
    let data = {};
    let tmpList = [];

    listOne.concat(listTwo).forEach(function(item) {
        data[item] = true;
    });
    let result = Object.keys(data);
    tmpList = result;

    return tmpList;
}


var searchParameters = function(str_search, tmp_data, typeData){
    let met_search = false;
    let propList = []

    for (let i=0;i<tmp_data.length;i++){

        console.log('typeData = ',typeData);

        met_search = tmp_data[i][typeData].includes(str_search);

        if (met_search == true){
            let objProp = {};
            objProp.Name = tmp_data[i]['Name'];
            objProp.id = tmp_data[i]['id'];
            objProp.Category = tmp_data[i]['Category'];
            propList.push(objProp);
        }
    }

    return propList;
}

var searchProperty = function(str_search, tmp_data, typeData){
    let met_search = false;
    let propList = [];


    for (let i=0;i<tmp_data.length;i++){
        for (let j=0;j<tmp_data[i]['Parameters'].length;j++){
            met_search = tmp_data[i]['Parameters'][j]['PropertyGroupTitle'].includes(str_search);
            if (met_search == true){
                // for (let k=0;k<tmp_data[i]['Parameters'][j]['PropertyList'].length;k++){
                    let objProp = {};
                    let k=0;
                    objProp.Name = tmp_data[i]['Name'];
                    objProp.id = tmp_data[i]['id'];
                    objProp.Category = tmp_data[i]['Category'];
                    let objList = {};
                    objList.PropertyGroupTitle = tmp_data[i]['Parameters'][j]['PropertyGroupTitle'];
                    objList.Title = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Title'];
                    objList.Units = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Units'];
                    objList.Value = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Value'];
                    objProp.Parameters = objList;
                    objProp.PropertyGroupTitle = tmp_data[i]['Parameters'][j]['PropertyGroupTitle'];
                    objProp.Title = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Title'];
                    objProp.Units = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Units'];
                    objProp.Value = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Value'];
                    // objProp.Met = tmp_data[i]['Parameters'][j]['PropertyGroupTitle'];
                    // objProp.MetName = 'PropertyGroupTitle';
                    propList.push(objProp)
                // }
                console.log('End yess ');
            }
            else{
                for (let k=0;k<tmp_data[i]['Parameters'][j]['PropertyList'].length;k++){
                    met_search = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Title'].includes(str_search);
                    let objProp = {};

                    if (met_search == true){
                        objProp.Met = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Title'];
                        objProp.MetName = 'Title';
                    }

                    met_search = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Units'].includes(str_search);
                    if (met_search == true){
                        objProp.Met = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Units'];
                        objProp.MetName = 'Units';
                    }

                    met_search = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Value'].includes(str_search);
                    if (met_search == true){
                        objProp.Met = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Value'];
                        objProp.MetName = 'Value';
                    }

                    if (met_search == true){
                        console.log('yess three');
                        objProp.Name = tmp_data[i]['Name'];
                        objProp.id = tmp_data[i]['id'];
                        objProp.Category = tmp_data[i]['Category'];

                        let objList = {};
                        objList.PropertyGroupTitle = tmp_data[i]['Parameters'][j]['PropertyGroupTitle'];
                        objList.Title = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Title'];
                        objList.Units = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Units'];
                        objList.Value = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Value'];
                        objProp.Parameters = objList;

                        objProp.PropertyGroupTitle = tmp_data[i]['Parameters'][j]['PropertyGroupTitle'];
                        objProp.Title = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Title'];
                        objProp.Units = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Units'];
                        objProp.Value = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Value'];
                        propList.push(objProp);

                    }
                }
            }
        }
    }


    return propList;

}


var searchProperties = function(str_search, tmp_data, typeData){
    let met_search = false;
    let propList = []


    for (let i=0;i<tmp_data.length;i++){
        if (met_search == true)
            break;
        met_search = tmp_data[i]['Name'].includes(str_search);

        met_search = tmp_data[i]['id'].includes(str_search);

        met_search = tmp_data[i]['Category'].includes(str_search);

        if (met_search == true){
            console.log('yess name');
            let objProp = {};
            objProp.Name = tmp_data[i]['Name'];
            objProp.id = tmp_data[i]['id'];
            objProp.Category = tmp_data[i]['Category'];
            let objList = {};
            objList.PropertyGroupTitle = tmp_data[i]['Parameters'][0]['PropertyGroupTitle'];
            objList.Title = tmp_data[i]['Parameters'][0]['PropertyList'][0]['Title'];
            objList.Units = tmp_data[i]['Parameters'][0]['PropertyList'][0]['Units'];
            objList.Value = tmp_data[i]['Parameters'][0]['PropertyList'][0]['Value'];
            objProp.Parameters = objList;

            objProp.PropertyGroupTitle = tmp_data[i]['Parameters'][0]['PropertyGroupTitle'];
            objProp.Title = tmp_data[i]['Parameters'][0]['PropertyList'][0]['Title'];
            objProp.Units = tmp_data[i]['Parameters'][0]['PropertyList'][0]['Units'];
            objProp.Value = tmp_data[i]['Parameters'][0]['PropertyList'][0]['Value'];
            propList.push(objProp);
            break;
        }
        else{
            for (let i=0;i<tmp_data.length;i++){
                for (let j=0;j<tmp_data[i]['Parameters'].length;j++){
                    if (met_search == true)
                        break;
                    met_search = tmp_data[i]['Parameters'][j]['PropertyGroupTitle'].includes(str_search);
                    if (met_search == true){
                        // for (let k=0;k<tmp_data[i]['Parameters'][j]['PropertyList'].length;k++){
                            let objProp = {};
                            let k=0;
                            objProp.Name = tmp_data[i]['Name'];
                            objProp.id = tmp_data[i]['id'];
                            objProp.Category = tmp_data[i]['Category'];
                            let objList = {};
                            objList.PropertyGroupTitle = tmp_data[i]['Parameters'][j]['PropertyGroupTitle'];
                            objList.Title = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Title'];
                            objList.Units = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Units'];
                            objList.Value = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Value'];
                            objProp.Parameters = objList;
                            objProp.PropertyGroupTitle = tmp_data[i]['Parameters'][j]['PropertyGroupTitle'];
                            objProp.Title = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Title'];
                            objProp.Units = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Units'];
                            objProp.Value = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Value'];
                            // objProp.Met = tmp_data[i]['Parameters'][j]['PropertyGroupTitle'];
                            // objProp.MetName = 'PropertyGroupTitle';
                            propList.push(objProp)
                        // }
                        console.log('End yess ');
                        break;
                    }
                    else{
                        for (let k=0;k<tmp_data[i]['Parameters'][j]['PropertyList'].length;k++){
                            met_search = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Title'].includes(str_search);
                            let objProp = {};

                            // if (met_search == true){
                            //     objProp.Met = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Title'];
                            //     objProp.MetName = 'Title';
                            // }

                            met_search = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Units'].includes(str_search);
                            // if (met_search == true){
                            //     objProp.Met = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Units'];
                            //     objProp.MetName = 'Units';
                            // }

                            met_search = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Value'].includes(str_search);
                            // if (met_search == true){
                            //     objProp.Met = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Value'];
                            //     objProp.MetName = 'Value';
                            // }

                            if (met_search == true){
                                console.log('yess three');
                                objProp.Name = tmp_data[i]['Name'];
                                objProp.id = tmp_data[i]['id'];
                                objProp.Category = tmp_data[i]['Category'];

                                let objList = {};
                                objList.PropertyGroupTitle = tmp_data[i]['Parameters'][j]['PropertyGroupTitle'];
                                objList.Title = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Title'];
                                objList.Units = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Units'];
                                objList.Value = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Value'];
                                objProp.Parameters = objList;

                                objProp.PropertyGroupTitle = tmp_data[i]['Parameters'][j]['PropertyGroupTitle'];
                                objProp.Title = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Title'];
                                objProp.Units = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Units'];
                                objProp.Value = tmp_data[i]['Parameters'][j]['PropertyList'][k]['Value'];
                                propList.push(objProp);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }


    console.log('propList = ',propList);
    return propList;

}


const getSearch = (d) => {
    console.log(' THIS IS WORKER ');

    console.log('properties = ',store.properties);
    // console.log('SearchWord = ',d.value['SearchWord']);
    // console.log('TypeSearch = ',d.value['TypeSearch']);

    let tmp = store.properties;
    let outId = [];
    let listProperty = [];


    if (d.value['choiceRegistr'] == true){
        if (d.value['TypeSearch'] == 'id'){
            listProperty = searchParameters(d.value['SearchWord'], tmp,d.value['TypeSearch']);
        }
        if (d.value['TypeSearch'] == 'Name'){
            listProperty = searchParameters(d.value['SearchWord'], tmp,d.value['TypeSearch']);
        }
        if (d.value['TypeSearch'] == 'Parameters'){
            listProperty = searchProperty(d.value['SearchWord'], tmp,d.value['TypeSearch']);
        }
        if (d.value['TypeSearch'] == 'Category'){
            listProperty = searchParameters(d.value['SearchWord'], tmp,d.value['TypeSearch']);
        }

    }
    else{

        if(!d.value['SearchWord'].match(/^\d+$/)){
           let listProp = [];
           let listPropTwo = [];
           let listPropThree = [];

           let upSearchWord = d.value['SearchWord'].charAt(0).toUpperCase() + d.value['SearchWord'].slice(1);
            if (d.value['TypeSearch'] == 'id'){
                listProp = searchParameters(upSearchWord, tmp,d.value['TypeSearch']);
            }
            if (d.value['TypeSearch'] == 'Name'){
                listProp = searchParameters(upSearchWord, tmp,d.value['TypeSearch']);
            }
            if (d.value['TypeSearch'] == 'Parameters'){
                listProp = searchProperty(upSearchWord, tmp,d.value['TypeSearch']);
            }
            if (d.value['TypeSearch'] == 'Category'){
                listProp = searchParameters(upSearchWord, tmp,d.value['TypeSearch']);
            }


            d.value['SearchWord'] = d.value['SearchWord'].toLowerCase();
            if (d.value['TypeSearch'] == 'id'){
                listPropTwo = searchParameters(d.value['SearchWord'], tmp,d.value['TypeSearch']);
            }
            if (d.value['TypeSearch'] == 'Name'){
                listPropTwo = searchParameters(d.value['SearchWord'], tmp,d.value['TypeSearch']);
            }
            if (d.value['TypeSearch'] == 'Parameters'){
                listPropTwo = searchProperty(d.value['SearchWord'], tmp,d.value['TypeSearch']);
            }
            if (d.value['TypeSearch'] == 'Category'){
                listPropTwo = searchParameters(d.value['SearchWord'], tmp,d.value['TypeSearch']);
            }


            let SearchWordUp = d.value['SearchWord'].toUpperCase();
            console.log(SearchWordUp);
            if (d.value['TypeSearch'] == 'id'){
                listPropThree = searchParameters(SearchWordUp, tmp,d.value['TypeSearch']);
            }
            if (d.value['TypeSearch'] == 'Name'){
                listPropThree = searchParameters(SearchWordUp, tmp,d.value['TypeSearch']);
            }
            if (d.value['TypeSearch'] == 'Parameters'){
                listPropThree = searchProperty(SearchWordUp, tmp,d.value['TypeSearch']);
            }
            if (d.value['TypeSearch'] == 'Category'){
                listPropThree = searchParameters(SearchWordUp, tmp,d.value['TypeSearch']);
            }
            console.log(listPropThree);

            listProperty = listProp;

            if (listPropTwo.length!=0){
                listProp.push(listPropTwo);
                listProperty = listProp;
            }

            if ((listPropThree.length!=0) && (listProperty.length!=0)){
                listProp.push(listPropThree);
                listProperty = listProp;
            }

            if ((listPropThree.length!=0) && (listProperty.length==0) && (listPropTwo.length==0)){
                listProperty = listPropThree;
            }

            if ((listPropThree.length!=0) && (listProperty.length==0) && (listPropTwo.length!=0)){
                listPropTwo.push(listPropThree);
                listProperty = listPropTwo;
            }

        }
        else{
            if (d.value['TypeSearch'] == 'id'){
                listProperty = searchParameters(d.value['SearchWord'], tmp,d.value['TypeSearch']);
            }
            if (d.value['TypeSearch'] == 'Name'){
                listProperty = searchParameters(d.value['SearchWord'], tmp,d.value['TypeSearch']);
            }
            if (d.value['TypeSearch'] == 'Parameters'){
                listProperty = searchProperty(d.value['SearchWord'], tmp,d.value['TypeSearch']);
            }
            if (d.value['TypeSearch'] == 'Category'){
                listProperty = searchParameters(d.value['SearchWord'], tmp,d.value['TypeSearch']);
            }
        }

    }

    console.log('listProperty = ',listProperty);

    self.postMessage({
        action: 'getParamSearch',
        listSearch: listProperty,
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
        // console.log('onGetHiddenObjects dm', dm)
        store.objectsMap[dm].hidden = true
        return {
            name: store.objectsMap[dm].Name,
            id: dm
        }
    })

    getParameters({names: ['hiddenList']})
}

const buildDispatcher = (d) => {
    console.log('===========buildDispatcher', d, store)
    let listModel = store.listModel.length ? store.listModel : [store.model]
    let root = {
        id: 'main',
        name: d.fname,
        parent: 0,
        hidden: false,
        type: 'node',
        children: listModel.map(mdl => {
            let fileId = mdl.id //getFileByVersion(mdl).url
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
                        type: 'level',
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

const computeParameters = (o, isvalue = false, bool = 'OR') => {
    let list = []
    o.elements.map(e => {
        e.list.map(id => {
            let el = store.objectsMap[id]
            if(!el){
                return id
            }
            let listTmp = []
            let equalFlag = true
            el.Parameters.map(p => {

                (p.PropertyList || p.Properties || []).map(prop => {
                    e.values.map(v => {
                        if(v.name.toLowerCase() == (prop.Title || prop.Name).toLowerCase()){
                            let values = type_of(v, prop.Value)
                            let equal = getEqual(v.equal, values)
                            if(equal == isvalue){
                                listTmp.push({
                                    name: el.Name,
                                    id: el.Id,
                                    property: prop.Title || prop.Name,
                                    value: prop.Value,
                                    valueRule: v.type == 'boolean'
                                        ? values[0] || 0
                                            ? 'Да'
                                            : 'Нет'
                                        : values[0],
                                    part: o.part
                                })
                            }
                            else{
                                equalFlag = false
                            }
                        }
                    })
                })
            })
            if(bool == 'AND' && !e.values.length){
                list = [...list, id]
            }
            else if(bool == 'AND' && e.values.length){
                if(equalFlag){
                    list = [...list, id]
                }
            }
            else{
                list = [...list, ...listTmp]
            }
        })
    })
    return list
}

const getVersionFile = (mod) => {
    if(mod.version == null){
        return 1
    }
    let vers = mod.files.find(fl => fl.id == mod.version)
    if(!vers){
        return 1
    }
    else{
        return vers.version
    }
}

const onDelta = (data) => {
    let deltaurl = ''
    store.model.files.map(fl => {
        if(fl.version == getVersionFile()){
            deltaurl = fl.url
        }
    })

    w_fetch({
        id: deltaurl,
        tag: 'delta.json',
        type: 'text',
        token: store.token
    })
    .then(res => {
        store.delta = res.Elements
        let mod = []
        let del = []
        let add = []
        let list = !store.delta ? [] : store.delta
        list.map( d => {
            if(d.Status == 'modified'){
                let elem = store.objectsMap[d.Id || d.Guid]
                deltaList.mod++
                let parameters = []
                mod.push({
                    id: d.Id,
                    name: elem ? elem.Name : d.Name,
                    status: d.Status,
                    color: 'yellow',
                    parameters: parameters
                })
            }
            else if(d.Status == 'deleted'){
                deltaList.del++
                del.push({
                    id: d.Id,
                    name: d.Name,
                    status: d.Status,
                    color: 'red'
                })
            }
            else{
                deltaList.add++
                add.push({
                    id: d.Id,
                    name: d.Name,
                    status: d.Status,
                    color: 'green'
                })
            }
        })
        deltaList.list = [...mod, ...del, ...add]
        deltaList.list = deltaList.list.map(d => {
            return {
                ...d,
                name: d.id + ' | ' + d.name,
                active: false,
                quantity: []
            }
        })
        return true
    })
    .then(() => {
        self.postMessage({
            action: 'onDeltaCallback',
            deltalist: store.deltaList
        })
    })
}

const onComputeParameters = (o) => {
    let list = computeParameters(o)
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

const onComputeNumberObjRooms = (data) => {
    let roomIds = computeParameters({elements: data.value.roomIds, source: store.source}, true, 'AND').map(i => i).filter((f, i, ar) => ar.indexOf(f) === i)

    console.log('>>>worker 0', roomIds)
    let entityIds = computeParameters({elements:data.value. entityIds, source: store.source}, true, 'AND').map(i => i).filter((f, i, ar) => ar.indexOf(f) === i)
    console.log('>>>worker 1', roomIds, entityIds)

    self.postMessage({
        ...data.value,
        action: 'onComputeNumberObjRooms',
        roomIds: roomIds,
        entityIds: entityIds
    })
}

const onComputeDistance = (data) => {
    let lhs = computeParameters({elements: data.value.elementslhs, source: store.source}, true, 'AND').map(i => i).filter((f, i, ar) => ar.indexOf(f) === i)
    let rhs = computeParameters({elements: data.value.elementsrhs, source: store.source}, true, 'AND').map(i => i).filter((f, i, ar) => ar.indexOf(f) === i)
    self.postMessage({
        action: 'onComputeDistanceUbviewer',
        data: data.value,
        lhs: lhs,
        rhs: rhs
    })
}

const onComputeSpace = (data) => {
    let lhs = computeParameters({elements: data.value.elementslhs, source: store.source}, true, 'AND').map(i => i).filter((f, i, ar) => ar.indexOf(f) === i)
    let rhs = computeParameters({elements: data.value.elementsrhs, source: store.source}, true, 'AND').map(i => i).filter((f, i, ar) => ar.indexOf(f) === i)
    self.postMessage({
        action: 'onComputeSpaceUbviewer',
        data: data.value,
        lhs: lhs,
        rhs: rhs
    })
}

const getRooms = () => {
    self.postMessage({
        action: 'getRooms',
        rooms: store.rooms
    })
}

const setPropertiesModel = (data) => {
    store.filters = [...store.filters, ...data.store.filters]
    store.levelsMap = {...store.levelsMap, ...data.store.levelsMap}
    store.objectsMap = {...store.objectsMap, ...data.store.objectsMap}
    store.properties = [...store.properties, ...data.store.properties]
    store.rooms.list = [...store.rooms.list, ...data.store.rooms.list]
    store.source = data.store.source

        console.log('-------Worker Init', store)
    setClassifier()
}

self.postMessage({
    action: 'ready',
    value: true
})
// let connected = false;
// self.addEventListener("connect", e => {
//   e.source.addEventListener("message", ev => {
//     if (ev.data === "start") {
//       if (connected === false) {
//         e.source.postMessage('worker init')
//         connected = true
//       } else {
//         e.source.postMessage('worker already inited')
//       }
//     }
//   }, false)
//   e.source.start()
// }, false)

self.onmessage = function(evt){
    switch(evt.data.action){
        case 'init': initStore(evt.data)
            break
        case 'initParams': initParams(evt.data)
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
        case 'onComputeSpace': onComputeSpace(evt.data)
            break
        case 'onComputeDistance': onComputeDistance(evt.data)
            break
        case 'onComputeNumberObjRooms': onComputeNumberObjRooms(evt.data)
            break
        case 'onDelta': onDelta(evt.data)
            break
        case 'setPropertiesModel': setPropertiesModel(evt.data)
            break
        default: ;
    }
}
