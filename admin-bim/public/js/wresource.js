console.log('open wrecource')

let store = {
    levels: null,
    hiddenList: []
}

const getFile = (d) => {
    store.hiddenList = d.hiddenList
    if(store.levels){
        getfile({levels: buildTree(d.filters)})
        return
    }

    let prmslist = []
    d.urllist.map(u => {
        prmslist.push(fetch(d.api + u + d.tag, {
            method: 'GET',
            headers: {authorization: 'Bearer ' + d.token}
        })
        .then(res => {
            return res.text()
        }))
    })

    // fetch(d.url, {
    //     method: 'GET',
    //     headers: {authorization: 'Bearer ' + d.token}
    // })
    // .then(res => {
    //     return res.text()
    // })
    Promise.all(prmslist)
    .then(result => {
        let levels = []
        result.map(res => {
            levels.push(...JSON.parse(res).levels)
        })
        store.levels = getMap(levels)
        getfile({levels: buildTree(d.filters)})
    })
    .catch(er => {
        console.log('getfile error', er)
    })
}

const getfile = (d) => {
    self.postMessage({
        action: 'buildtree',
        map: d.levels
    })
}

self.onmessage = function(evt){
    switch(evt.data.action){
        case 'getfile': getFile(evt.data)
            break
        case 'buildtree': getfile({levels: buildTree(evt.data.filters)})
            break
        case 'onVisibile': onVisibile(evt.data.item, evt.data.hidden, evt.data.filters)
            break
        case 'onHidden': onHidden(evt.data)
            break
        case 'onVisibleAll': onVisibleAll(evt.data)
            break
        default: ;
    }
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
const onHidden = (d) => {
    let visibleList = store.hiddenList.filter(f => !d.list.some(s => s.id == f.id))
    visibleList.map(v => {
        store.levels.items[v.id].hidden = false
    })
    store.hiddenList = d.list
    d.list.map(h => {
        store.levels.items[h.id].hidden = true
    })
    getfile({levels: buildTree(d.filters)})
}

const getMap = (ar) => {
    let map = {
        level: [],
        cat: [],
        group: [],
        items: {}
    }
    ar.map((l, li) => {
        let lid = l.id || 'l-' + li
        map.level.push({
            id: lid,
            name: l.lname || '---',
            type: 'level',
            parent: 0,
            hidden: false,
            node: 'level'
        })
        l.categories.map((c, ci) => {
            let cid = 'c-' + li + ci
            map.cat.push({
                id: cid,
                name: c.cname,
                type: 'cat',
                parent: lid,
                level: l.lname || '---',
                hidden: false,
                node: 'level'
            })
            c.items.map((g, gi) => {
                let gid = 'g-' + li + ci + gi
                map.group.push({
                    id: gid,
                    name: g.gname,
                    type: 'group',
                    parent: cid,
                    level: l.lname || '---',
                    cat: c.cname,
                    hidden: false,
                    node: 'level'
                })
                g.items.map((e, ei) => {
                    map.items[e] = {
                        id: e,
                        name: g.gname + ' | ' + e,
                        type: 'item',
                        parent: gid,
                        level: l.lname || '---',
                        cat: c.cname,
                        group: g.gname,
                        hidden: false,
                        node: 'item'
                    }
                })
            })
        })
    })
    let stack = map.level.reduce((r, i) => {
        r[i.name] = r[i.name] || []
        r[i.name].push(i)
        return r
    }, {})
    stack = Object.values(stack).map(m => {
        let item = m[0]
        return item
    })
    map.level = sortObj(stack, 'name')
    map.cat = sortObj(map.cat, 'name')
    map.group = sortObj(map.group, 'name')

    store.hiddenList.map(h => {
        map.items[h.id].hidden = true
    })
    return map
}

const buildTree = (filters) => {
    let levels = []
    if(store.levels){
        const createTree = (map, filters, values, ind) => {
            let list = []
            if(filters[ind] == 'items'){
                list = Object.values(map.items)
                list = list.filter(f => values.every(e => {
                    return e.value == f[e.attr]
                }))
                list = sortObj(list, 'name')
            }
            else{
                list = map[filters[ind]]
                    .filter(f => (values.every(e => {
                        return e.value == f[e.attr]
                    })))
                    .reduce((r, i) => {
                        return r.some(s => s.name == i.name)
                            ? r
                            : [...r, i]
                    }, [])
                    .map(i => {
                        let children = createTree(map, filters, [...values, {
                            attr: filters[ind],
                            value: i.name
                        }], (ind + 1))

                        return {
                            ...i,
                            hidden: children.every(e => e.hidden),
                            children
                        }
                    })
            }
            return list
        }

        // levels = store.levels[filters[0]].reduce((r, i) => {
        //     r[i.name] = r[i.name] || []
        //
        //     r[i.name].push(i)
        //     return r
        // }, {})
        //
        // console.log('>>>levels', levels)
        levels = store.levels[filters[0]]
            .reduce((r, i) => {
                return r.some(s => s.name == i.name) ? r : [...r, i]
            }, [])
            .map(m => {
                m.children = createTree(store.levels, filters, [{
                    attr: filters[0],
                    value: m.name
                }], 1)
                m.hidden = m.children.every(e => e.hidden)
                return m
            })

// console.log('>>>levels', levels)
// console.log('>>>test', test)
        // levels = Object.values(levels).map(l => {
        //     let item = l[0]
        //     item.children = createTree(store.levels, filters, [{
        //         attr: filters[0],
        //         value: item.name
        //     }], 1)
        //     item.hidden = item.children.every(e => e.hidden)
        //     return item
        // })

    //     levels = Object.values(levels).map(l => {
    //         let item = l[0]
    //         item.children = createTree(store.levels, filters, [{
    //             attr: filters[0],
    //             value: item.name
    //         }], 1)
    //         item.hidden = item.children.every(e => e.hidden)
    //         return item
    }
    return levels
}

const onVisibile = (i, hidden, filters) => {
    const getItems = (i) => {
        let  list = []
        if(i.type != 'group'){
            i.children.map(c => {
                list = [...list, ...getItems(c)]
            })
        }
        else{
            list = i.children.map(c => c.id)
        }
        return list
    }
    let items = []
    if(i.type == 'item'){
        items = [i.id]
        store.levels.items[i.id].hidden = hidden
    }
    else{
        items = getItems(i)
        items.map(it => {
            store.levels.items[it].hidden = hidden
        })
    }

    self.postMessage({
        action: 'buildSelected',
        levels: buildTree(filters),
        items: items,
        hidden: hidden
    })
}

const onVisibleAll = (v) => {
    let list = []
    if(v.value){
        list = store.hiddenList.filter(f => store.levels.items[f.id]).map(i => i.id)
    }
    else{
        list = Object.keys(store.levels.items).filter(f => !store.hiddenList.some(s => s.id == f))
    }

    self.postMessage({
        action: 'onVisibleAll',
        value: v.value,
        list: list
    })
}

self.postMessage({
    action: 'initworker'
})
