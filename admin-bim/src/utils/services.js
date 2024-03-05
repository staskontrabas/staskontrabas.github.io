import store from '@/store'

export const service = {
    traverseTree,
    createMap,
    createTreeForSidebar,
    getListPath,
    createTreeForSidebar1,
}

export const createAvatarChar = function(v, size = 30, fontSize = 18){
    let char = v.slice(0, 1)
    char = char.toUpperCase()

    let canvas = document.createElement('canvas')

    canvas.width = size
    canvas.height = size

    let ctx = canvas.getContext('2d')

    ctx.beginPath()
    ctx.fillStyle = "#e55d4a"
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold " + (fontSize) + "px Arial"
    ctx.textAlign = 'center'
    ctx.fillText(char, size / 2, (size / 2) + ((fontSize * 0.70) / 2))

    let avatar = canvas.toDataURL()

    canvas = null
    return avatar
}

export const sortObj = function(ar, prop){
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

function createTree(map){
    let tree = createTreePart(map)
    let groups = tree.filter(m => m.data.group)
    let folders = tree.filter(m => !m.data.group)
    return [...groups, ...folders]
}

function createTreeForSidebar(map, currentF = 0, stop = 24, options = {}){
    let tree = createTreePart(map, currentF, stop, 0, 0, options)
    let groups = tree.filter(m => m.data.group)
    let folders = tree.filter(m => !m.data.group)
    return [...groups, ...folders]
}

function createTreeForSidebar1(map, currentF = 0, stop = 24, options = {}){
    let tree = createTreePart(map, currentF, stop, 0, 0, options)
    let groups = tree.filter(m => m.data.group)
    let folders = tree.filter(m => !m.data.group)
    return {
        original: map,
        tree: tree,
        groups: groups,
        folders: folders,
    }
}

function createTreePart(map, currentF, stop, parent = 0, level = 0, options){
    let tree = []
    let list = map.filter(i => i.parent == parent)
    list.map(m => {
        if(m.parent == parent){
            let item = {
                title: m.name,
                data: {
                    ...m,
                    parent: parent,
                    group: !!m.group,
                    list: !!m.group ? m.folders || [] : null
                },
                isExpanded: m.isExpanded,
                isSelected: m.id == currentF ? true : false,
                children: level == stop ? [] : createTreePart(map, currentF, stop, m.id, level + 1)
            }
            item = {...item, ...options}
            tree.push(item)
        }
    })
    return sortObj(tree, 'order')
}

function traverseTree(ar, parent = 0){
    let list = []
    ar.map(i => {
        if(!i.is_deleted){
            let key = 'folders'
            let {[key]: folders, ...item} = i

            item.parent = item.parent == item.id ? 0 : item.parent
            item.group = false
            item.toGroup = false
            list.push(item)

            if(folders && folders.length){
                folders = traverseTree(folders, item.id)
                list = [...list, ...folders]
            }
        }
    })
    return list
}

function createMap(tree){
    let list = traverseTree(tree)
    return list
}

function getListPath(map){
    let groups = map.filter(m => m.group)
    let folders = map.filter(m => !m.group)

    groups = groups.map(g => {
        return {
            group: g.name,
            folders: traverseMap(folders, g.id)
        }
    })
    folders = traverseMap(folders)
    return {
            groups: groups,
            folders: folders
        }
}

function traverseMap(map, parent = 0, path = ''){
    let list = []
    map.map(m => {
        if(m.parent == parent){
            let fullPath = path + '/' + m.name
            list.push(fullPath)
            let next = traverseMap(map, m.id, fullPath)
            list = [...list, ...next]
        }
    })
    return list
}

export const html2text = function(html){
    let tag = document.createElement('div')
    tag.innerHTML = html

    return tag.innerText
}

export const checklicense = function(prop){
    if(prop === null){
        return true
    }
    let currentLicense = store.state.administration.currentLicense
    if(currentLicense === null){
        return false
    }
    let config = store.state.administration.configLicense
    if(!config[prop]){
        return true
    }
    return (config[prop].code <= currentLicense.pcode)
}

export const getAccess = function(i, power, ar){
    let access = power == 'or' ? false : true
    ar.map(a => {
        if(power == 'or'){
            access = access || ((i >> a) & 1)
        }
        if(power == 'and'){
            access = access && ((i >> a) & 1)
        }
    })
    return !!access
}

export const setPermission = function(o){
    let permission = 0
        | (o.can_create_project ? 1 : 0)
        | ((o.can_delete_project ? 1 : 0) << 1)
        | ((o.can_add_client ? 1 : 0) << 2)
        | ((o.can_add_subcontractor ? 1 : 0) << 3)
        | ((o.can_send_project ? 1 : 0) << 4)
        | ((o.can_manage_users ? 1 : 0) << 5)
        | ((o.can_manage_company ? 1 : 0) << 6)
        | ((o.can_manage_projects ? 1 : 0) << 7)
    return permission
}

export const setAccessFolderFile = function(o){
    let createrID = o.userID
    let permission = 0
    let perms = (o.perms || [])
        .find(fu => fu.id + '' == o.itemID)
    let users = perms
        ? perms.users
            ? JSON.parse(JSON.stringify(perms.users))
            : []
        : []
    let user = users.find(u => u.id + '' == createrID)

    if(!perms || !user){
        let admin = false
        let groups = o.adminPerms
        groups.map(g => {
            if(g.id == '1' || g.id == '2'){
                if(g.users.some(s => s.id + '' == createrID)){
                    admin = true
                    permission = 15
                }
            }
        })
        if(!admin){
            if(createrID == o.created_by){
                permission = 15
            }
        }
    }
    else{
        permission = 0
            | (user.can_open ? 1 : 0)
            | ((user.can_edit ? 1 : 0) << 1)
            | ((user.can_download ? 1 : 0) << 2)
            | ((user.can_comment ? 1 : 0) << 3)
    }

    return permission
}
