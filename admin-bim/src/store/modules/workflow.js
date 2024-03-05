import { http, api } from '@/utils/define'
import { service, setAccessFolderFile } from '@/utils/services'
import router from '@/router'

const state = {
    workflow_project: '',
    projects: [],
    folders: [],
    folderTree: [],
    currentFolder: 0,
    docs: [],
    taskList: [],
    groups: [],
    foldersMap: [],
    isExpandedList: [],

    listDocs: [],
    listSocket: [],
    fileTypeConversion: ['ifc', 'rvt', 'zip', 'ifcxml'],
    fileTypeList: ['ifc', 'rvt', 'zip', 'ifcxml', 'doc', 'consolidations', '3ds', 'bmp', 'csv', 'dae', 'docx', 'dwg', 'dxf', 'iges', 'jpg', 'pdf', 'png', 'step', 'stl', 'stp', 'tiff', 'xls', 'svg'],
    filesIdViewer: [],

    activeProject: null,
    active: {},

    commentList: [],
    activeComment: false,
    commentState: {
        status: false,
        markerStack: [],
        commentActive: '',
        commentInput: ''
    },

// part of marker
    markerHelper: {
        value: 0,
        status: false
    },
    markerStack: [],
    markerList: [],
    markerEdit: false,



    draft: false,
    draftBbox: {
        x: 0,
        y: 0,
        w: 0,
        h: 0
    },
    draftList: [],
    draftSelected: '',
    draftHover: '',
    pdfInit: false,
    pdfPage: false,
    viewerPage: false,

    activeGroup: false,
    activeFolder: false,
    activeFolderName: '',
    openFolder: 0,

    templates_collision: []
}

const mutations = {
    setFilesIdViewer(state, payload){
        state.filesIdViewer = payload
    },
    openFolder(state, payload){
        state.openFolder = payload
    },
    setTaskList(state, payload){
        state.taskList = payload
    },
    setCurrentFolder(state, payload){
        state.currentFolder = payload
    },
    setExpanded(state, payload){
        state.isExpandedList = payload
    },
    setMarkerHelper(state, payload){
        state.markerHelper = payload
    },
    addMarker(state, payload){
        state.markerStack = [...state.markerStack, payload]
    },
    clearMarkerStack(state, payload){
        state.markerStack = []
    },
    updateMarkerStack(state, payload){
        state.markerStack = payload
    },
    setMarkerList(state, payload){
        state.markerList = payload
    },
    editMarker(state, payload){
        state.markerEdit = payload
    },

    setActiveProject(state, payload){
        state.activeProject = payload
    },
    setActiveGroup(state, payload){
        state.activeGroup = payload
    },
    setActiveFolder(state, payload){
        state.activeFolder = payload.id
        state.activeFolderName = payload.name
    },
    setActive(state, payload){
        state.active = payload
    },
    saveChange(state, payload){
        let projects = state.projects.map(item => item.id == payload.params.id ? Object.assign({}, payload.params) : item)
        state.projects = projects
    },
    setComments(state, payload){
        state.commentList = payload
    },
    addComment(state, payload){
        state.commentList = payload
    },
    setActiveComment(state, payload){
        state.activeComment = payload
    },
    saveCommentState(state, payload){
        state.commentState = {...state.commentState, ...payload}
    },
    setDraft(state, payload){
        state.draft = payload
    },
    setDraftBbox(state, payload){
        state.draftBbox = {...state.draftBbox, ...payload}
    },
    setDraftSelected(state, payload){
        state.draftSelected = payload
    },
    setDraftHover(state, payload){
        state.draftHover = payload
    },
    setPdfInit(state, payload){
        state.pdfInit = payload
    },
    setPdfPage(state, payload){
        state.pdfPage = payload
    },
    setViewerPage(state, payload){
        state.viewerPage = payload
    },
    updateComment(state, payload){
        state.commentList = payload
    },
    setTableType(state, payload){
        state[payload.name] = payload.value
    },
    addGroup(state, payload){
        state.groups.push(payload)
    },
    updateGroup(state, payload){
        state.groups = payload
    },
    setProjectItems(state, payload){
        state.groups = payload
    },
    setProject(state, payload){
        state.projects = payload
    },
    setGroups(state, payload){
        state.groups = payload
    },
    setFolders(state, payload){
        state.folders = payload
    },
    setFolderTree(state, payload){
        state.folderTree = payload
    },
    setFoldersMap(state, payload){
        state.foldersMap = payload
    },
    setDocs(state, payload){
        state.docs = payload || []
    },
    setListSocket(state, payload){
        state.listSocket = payload
    },
    setListDocs(state, payload){
        state.listDocs = payload
    },
    setCollisionTemplates(state, payload){
        state.templates_collision = payload
    }
}

const actions = {
    createXml({rootState, commit}, body){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.post(http['cloud'], api['create_xml'], body, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                resolve(res)
            },
                er => {
                    console.log('create_xml er', er)
                    resolve(er)
                }
            )
        })
    },
    checkCreateXml({rootState, dispatch, commit}, payload){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.get(http['cloud'], api['create_xml'], {
                id: payload.task_id
            }, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                resolve(res)
            },
                er => {
                    console.log('check create_xml er', er)
                    resolve(er)
                }
            )
        })
    },
    getCollisionTemplates({rootState, commit}){
        let token = rootState.auth.access_token

        api.get(http['cloud'], api['templates'], {}, {
            authorization: 'Bearer ' + token
        })
        .then(res => {
            let tmpl = res || []
            commit('setCollisionTemplates', tmpl)
        },
            er => {
                console.log('get templates collisions error', er)
            }
        )
    },
    updateCollisionTemplates({rootState, dispatch, commit}, pld){
        let token = rootState.auth.access_token

        return api.post(http['cloud'], api['templates'], pld, {
            authorization: 'Bearer ' + token
        }, 'PUT')
        .then(res => {
            dispatch('getCollisionTemplates')
            return true
            // let tnpl = res || []
            // commit('setCollisionTemplates', tmpl)
        },
            er => {
                console.log('update templates collisions error', er)
                return er
            }
        )
    },
    deleteCollisionTemplates({rootState, dispatch, commit}, pld){
        let token = rootState.auth.access_token

        return api.post(http['cloud'], api['template'] + '/' +  pld.id, {}, {
            authorization: 'Bearer ' + token
        }, 'DELETE')
        .then(res => {
            dispatch('getCollisionTemplates')
            return true
            // let tnpl = res || []
            // commit('setCollisionTemplates', tmpl)
        },
            er => {
                console.log('update templates collisions error', er)
                return er
            }
        )
    },
    getHistory({rootState, commit}, payload){
        let token = rootState.auth.access_token
        let user = rootState.administration.user
        let project = rootState.workflow.activeProject

        return new Promise((resolve) => {
            api.get(http['project'], api['messages'], {
                typ: 0,
                id: user.company.toString(),
                prj: project.id.toString(),
                did: payload.did.toString(),
                ver: parseInt(payload.version),
                frm: null,
                siz: '100',
                lid: null
            }, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                resolve({
                    version: parseInt(payload.version),
                    created: payload.created,
                    msgs: res.msgs
                })
            },
                er => {
                    console.log('get history er', er)
                    resolve(er)
                }
            )
        })
    },
    async getProjects({rootState, dispatch, commit}, payload){
        let token = rootState.auth.access_token
        const {type_id, id} = payload

        return new Promise((resolve, reject) => {
            api.get(http['project'], api['projects'] + 'projects', {}, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                    let list = res || []
                    commit('setProject', list)
                },
                er => {
                    console.log('get projects er', er)
                    if(er.status == 401) {
                        dispatch('auth/refresh')
                        .then(res => {
                            dispatch('getProjects', payload)
                        })
                    }
                }
            )
            .then(res => {
                resolve('ok', res)
            })
            .catch(err => {
                reject('error', err)
            })
        })
    },
    addProject({rootState, dispatch}, payload){
        let token = rootState.auth.access_token
        const {type_id, id, uuid, body} = payload

        api.post(http['project'], api['projects'] + 'project/' +  uuid + '/info', body, {
            authorization: 'Bearer ' + token
        })
        .then(() => {
            dispatch('getProjects', {type_id, id})
        })
    },
    updateProject({rootState, dispatch}, payload){
        let token = rootState.auth.access_token
        const {type_id, id, uuid, body} = payload

        return new Promise((resolve, reject) => {
            api.post(http['project'], api['projects'] + 'project/' +  uuid + '/info', body, {
                authorization: 'Bearer ' + token
            })
            .then(() => {
                dispatch('getProjects', {type_id, id})
                resolve('ok')
            })
            .catch(er => {
                reject('error')
            })
        })
    },
    removeProject({rootState, state, commit, dispatch}, payload){
        let token = rootState.auth.access_token
        const {uuid} = payload

        return new Promise((resolve) => {
            resolve(api.remove(http['project'], api['projects'] + 'project/' + uuid, {}, {
                authorization: 'Bearer ' + token
            }))
        })
    },
    getProjectSize({rootState, state, commit}, pld){
        let token = rootState.auth.access_token
        const id = rootState.administration.company.id
        let params = id + '/' + pld.id

        return new Promise((resolve) => {
            resolve(api.get(http['cloud'], api['project_size'] + params, {}, {
                authorization: 'Bearer ' + token
            }))
        })
    },
    getRemovedFiles({rootState, state, commit}){
        let token = rootState.auth.access_token
        const type_id = 'c'
        const id = rootState.administration.company.id
        let params = type_id + '/' + id + '/trash'

        return new Promise((resolve) => {
            resolve(api.get(http['project'], api['projects'] + params, {}, {
                authorization: 'Bearer ' + token
            }))
        })
    },
    restoreFiles({rootState, state, commit}, payload){
        let token = rootState.auth.access_token
        const type_id = 'c'
        const id = rootState.administration.company.id

        let params = type_id + '/'
            + id + '/'
            + payload.uuid
            + '/attachment/trash/'
            + payload.fileType + '/'
            + payload.fileId

        return new Promise((resolve) => {
            api.post(http['project'], api['projects'] + params, {}, {
                authorization: 'Bearer ' + token
            })
            .then(
                res => {
                    resolve({
                        fileType: payload.fileType,
                        name: payload.fileName,
                        id: payload.fileId,
                        status: 1
                    })
                },
                er => {
                    resolve({
                        fileType: payload.fileType,
                        name: payload.fileName,
                        id: payload.fileId,
                        status: 0,
                        text: er.data.error
                    })
                }
            )
        })
    },
    addConsolidation({rootState, state, commit}, payload){
        let token = rootState.auth.access_token
        const type_id = 'c'
        const id = rootState.administration.company.id
        const uuid = state.activeProject.id

        let params = type_id + '/'
            + id + '/'
            + uuid + '/'
            + 'consolidation'

        return new Promise((resolve) => {
            api.post(http['project'], api['projects'] + params, payload.body, {
                authorization: 'Bearer ' + token
            }, 'PUT')
            .then(
                res => {
                    resolve(res)
                },
                er => {
                    resolve({
                        status: 0,
                        text: er.data.error
                    })
                }
            )
        })
    },
    removeRemovedFiles({rootState, state, commit}, payload){
        let token = rootState.auth.access_token
        const type_id = 'c'
        const id = rootState.administration.company.id

        let params = type_id + '/'
            + id + '/'
        switch(payload.action){
            case 'trash': params += 'trash'
                break
            case 'project': params += payload.uuid + '/attachment/trash/'
                break
            case 'file': params += payload.uuid + '/attachment/trash/file/' + payload.fileId
                break
            case 'folder': params += payload.uuid + '/attachment/trash/folder/' + payload.fileId
                break
            default: params += payload.uuid + '/attachment/trash/file/' + payload.fileId
        }

        return new Promise((resolve) => {
            api.post(http['project'], api['projects'] + params, {}, {
                authorization: 'Bearer ' + token
            }, 'DELETE')
            .then(
                res => {
                    resolve({
                        fileType: payload.fileType,
                        name: payload.fileName,
                        id: payload.fileId,
                        status: 1
                    })
                },
                er => {
                    resolve({
                        fileType: payload.fileType,
                        name: payload.fileName,
                        id: payload.fileId,
                        status: 0,
                        text: er.data.error
                    })
                }
            )
        })
    },
    setMarkerHelper({state,commit}, payload){
        let value = (!state.markerStack.length ? !state.markerList.length ? 0 : state.markerList[state.markerList.length - 1].value : state.markerStack[state.markerStack.length - 1].value) + 1
        let marker = {
            value: value,
            status: false,
            x: 0,
            y: 0
        }
        marker = {...marker, ...payload}
        commit('setMarkerHelper', marker)
    },
    addMarker({state, commit, dispatch}, payload){
        let count = state.markerHelper.value
        let id = (new Date().getTime()).toString()
        let marker = {
            id: id,
            x: payload.x,
            y: payload.y,
            w: 0,
            h: 0,
            value: count
        }
        dispatch('setMarkerHelper', {status: false})
        commit('addMarker', marker)
    },
    updateMarker({state, commit}, payload){
        let list = state.markerStack
        list = list.map(i => i.id == payload.id ? {...i, ...payload} : i)
        commit('updateMarkerStack', list)
    },
    setMarkerList({state, commit}, payload){
        let list = [...state.markerList, ...payload]
        commit('setMarkerList', list)
    },
    removeMarker({state, commit}, payload){
        let list = state.markerStack
        list = list.filter(i => i.id != payload)
        if(list.length){
            let value = state.markerList.length + 1
            let listValue = list
            list = listValue.map((i, j) => ({...i, value: value + j}))
        }
        commit('updateMarkerStack', list)
    },

    dropNode({state, commit}, payload){
        let list = []
        if(payload.drop){
            list = payload.list.map(i => {
                i.data.position = i.path[i.path.length - 1]
                if(!(i.path.length - 1)){
                    i.data.parent = 0
                }
                else{
                    let str = '[' + i.path.slice(0, -1).join(',') + ']'
                    i.data.parent = payload.list.filter(n => n.pathStr == str)[0].data.id
                }
                return i
            })
        }
        else{
            list = [...payload.list]
        }
        commit('updateGroup', list)
    },
    setExpanded({state, commit}, payload){
        commit('setExpanded', payload)
        let map = state.foldersMap.map(i => payload.filter(j => j == i.id).length ?
                                        {...i, isExpanded: true} : {...i, isExpanded: false})
        // console.log('this is map (in wf.js)', map)
        commit('setFoldersMap', map)
    },
    getFile({rootState, commit}, payload){
        let token = rootState.auth.access_token

        return new Promise((resolve) => {
            api.get(http['cloud'], api['getfile'] + payload.id, {}, {
                authorization: 'Bearer ' + token,
            }, true)
            .then(res => {
                resolve({id: payload.id, file: res})
            },
                er => 'empty'
            )
        })
    },
    getFileByTag({rootState, commit}, payload) {
        let token = rootState.auth.access_token
        let tag = payload.tag
        let file_url = payload.id // url файла, не id физического файла на помойке

        return api.get(http['cloud'], api['getfile'] + file_url + '/' + tag, {}, {
            authorization: 'Bearer ' + token,
        })
    },
    // getFileByTempToken({rootState, commit}, payload) {
    //     let file_id = payload.id
    //     let access_query = payload.access_query

    //     return api.get(http['cloud'], api['getfile'] + payload.id, {}, {
    //             authorization: 'Bearer ' + token, 
    //         })
    // },
    getFileInfo({rootState, commit}, payload) {
        // console.log('get file info', payload)
        let token = rootState.auth.access_token
        let file_url = payload

        return api.get(http['cloud'], api['getfile'] + file_url + '/info', {}, {
            authorization: 'Bearer ' + token,
        })
    },
    getFolders({rootState, dispatch, commit}){
        let token = rootState.auth.access_token
        const project_id = state.activeProject ? state.activeProject.id : null

        // TODO: не всегда успевает загрузиться state перед выполнением getFolders
        if (!project_id) {
            commit('setFolders', [])
            return null
        }

        return api.get(http['project'], api['projects'] + 'project/' + project_id + '/folders', {}, {
            authorization: 'Bearer ' + token,
        })
        .then(res => {
            commit('setFolders', res || [])
            return res
        })
    },
    getFoldersByProjectId({rootState, dispatch, commit}, project_id){
        let token = rootState.auth.access_token
        return api.get(http['project'], api['projects'] + 'project/' + project_id + '/folders', {}, {
            authorization: 'Bearer ' + token,
        })
    },
    createFoldersMap({rootState, state, dispatch, commit}){
        let folders = state.folders || []
        let groups = state.groups || []
        let user = rootState.administration.user
        let adminPerms = rootState.administration.groupPermissions
        let folderPerms = rootState.administration.folderPermissions
        let filePerms = rootState.administration.filesPermissions

        let map = service.createMap(folders)

        groups = groups.map(g => {
            g.id = 'group_' + g.name
            g.parent = 0
            g.group = g.id
            g.toGroup = 'root'

            if(g.folders && g.folders.length){
                g.folders.map(l => {
                    map = map.map(f => {
                        if(f.id == l.folder){
                            f.parent = g.id
                            f.toGroup = g.id
                        }
                        return f
                    })
                })
            }
            return g
        })

        let listDocs = []
        let listSocket = []

        map.map(i => {
            if(i.files){
                i.files.map(f => {
                    if(!f.is_deleted){
                        let reg = /{.*}/
                        let props = f.name.match(reg)
                        let name = ''
                        let name_short = ''
                        let type = ''
                        let inwork = false
                        let url = ''

                        let arName = f.name.split('.')
                        name = f.name
                        type = arName.splice(-1, 1)[0] || 'type'
                        if(!state.fileTypeList.some(s => s == type)){
                            type = 'unknown'
                        }
                        if(f.consolidations){
                            type = 'consolidations'
                        }

                        name_short = arName.join('.')
                        url = !f.version
                            ? f.files && f.files.length
                                ? f.files[0].url
                                : 1
                            : f.files.filter(v => v.id == f.version)[0].url

                        inwork = state.fileTypeConversion.some(s => s == type) ? true : false
                        // if(inwork){
                        //     if(!state.listSocket.some(s => s.inworkId == f.id)){
                        //         //console.log('ssososososososososos ', f.id, url)
                        //         listSocket.push({
                        //             inworkId: f.id,
                        //             url: url,
                        //             socketId: ''
                        //         })
                        //     }
                        //     else{
                        //         state.listSocket.map(s => {
                        //             if(s.inworkId == f.id){
                        //                 inwork = f.inwork
                        //             }
                        //         })
                        //     }
                        // }
                        if(inwork){
                            listSocket.push({
                                inworkId: f.id,
                                url: url,
                                socketId: ''
                            })
                        }

                        listDocs.push({
                            ...f,
                            inwork: false,//inwork,
                            status_file: -1,
                            tags: [],
                            type: type,
                            name_short: name_short,
                        })
                    }
                })
            }
        })
        //listSocket = [...state.listSocket, ...listSocket]

        map = [...groups, ...map]
        map = map.map(i => {
            return {
                ...i,
                isExpanded: state.isExpandedList.filter(j => j == i.id).length,
            }
        })

        Promise.all([
            commit('setFoldersMap', map),
            commit('setListDocs', listDocs),
            commit('setListSocket', listSocket)
        ])
        .then(() => {
            if(state.listSocket.length){
                dispatch('onSocket')
            }
        })
    },
    onSocket({rootState, state, dispatch, commit}, payload){
        let token = rootState.auth.access_token
        // let list = []
        state.listSocket.map(s => {
            if(s.url && !s.socketId){
                s.socketId = new WebSocket(http['socket_files']
                        + api['socket_files']
                        + s.url
                )
                s.socketId.onmessage = function(e){
                    let response = JSON.parse(e.data)
                    let close = false

                    let listDocs = state.listDocs.map(i => {
                        if(i.id == s.inworkId){

                            if(i.inwork && response.tags){
                                if(response.tags['next.version.json'] && response.tags['next.version.json'] == 1){
                                    Promise.all([
                                        dispatch('getFolders'),
                                        dispatch('getGroups')
                                    ])
                                    .finally(res => {
                                        dispatch('createFoldersMap')
                                    })
                                }
                            }

                            i.status_file = response.sts
                            switch(response.sts){
                                case -1:
                                    i.inwork = false
                                    i.tags = response.tags || {}
                                    close = true
                                    break
                                case 0:
                                    i.inwork = true
                                    i.tags = response.tags || {}
                                    break
                                case 1:
                                    i.inwork = false
                                    i.tags = response.tags
                                    close = true
                                    break
                                case 2:
                                    i.inwork = true
                                    i.tags = response.tags
                                    break
                                case 3:
                                    i.inwork = false
                                    close = true
                                    i.tags = response.tags
                                    break
                                default: {
                                    i.inwork = false
                                    i.tags = response.tags || {}
                                    close = true
                                }
                            }
                        }
                        return i
                    })
                    commit('setListDocs', listDocs)
                    if(close){
                        if(s.socketId.readyState != 2 || s.socketId.readyState != 3){
                            s.socketId.close()
                        }
                    }
                }
                s.socketId.onopen = function(e){
                    s.socketId.send(token)
                }
                s.socketId.onclose = function(e){
                    dispatch('socketClose', s.inworkId)
                }
            }
        })
    },
    socketClose({state, commit}, id){
        let list = state.listSocket.map(s => {
            if(s.inworkId == id){
                s.socketId = ''
            }
            return s
        })
        //list = list.filter(s => s.inworkId != id)
        commit('setListSocket', list)
    },
    convertationTag({rootState, commit}, pld){
        let token = rootState.auth.access_token
        const uuid = pld.uuid
        const tag = pld.tag
        let params = uuid + '/' + tag
        let attachment = pld.force ? '?force=true' : ''
        let body = pld.body || {}//pld.force ? {force: true} : {}
        return new Promise((resolve) => {
            api.post(http['cloud'], api['getfile'] + params + attachment, body, {
                authorization: 'Bearer ' + token,
            })
            .then(res => {
                resolve(res)
            },
                er => {
                    resolve(er)
                }
            )
        })
    },
    fixModel({rootState, state, commit}, payload){
        let token = rootState.auth.access_token
        let file_id = payload.id

        return new Promise((resolve) => {
            api.post(http['project'], api['projects'] + 'document/' + file_id + '/fix', {}, {
                authorization: 'Bearer ' + token,
            })
            .then(res => {
                resolve(res)
            },
                er => 'er'
            )
        })
    },
    getClue({rootState, state, commit}, body){
        let token = rootState.auth.access_token

        return new Promise((resolve, reject) => {
            api.post(http['project'], api['class_error'], body, {
                authorization: 'Bearer ' + token,
            })
            .then(res => {
                resolve(res)
            },
                er => {
                    reject(null)
                }
            )
        })
    },
    getAttributes({rootState, state, commit}, payload){
        let token = rootState.auth.access_token
        return new Promise((resolve, reject) => {
            api.get(http['project'], api['attr_error'], payload, {
                authorization: 'Bearer ' + token,
            })
            .then(res => {
                resolve(res)
            },
                er => {
                    reject(null)
                }
            )
        })
    },
    getParameters({rootState, state, commit}, payload){
        let token = rootState.auth.access_token
        return new Promise((resolve, reject) => {
            api.get(http['project'], api['attr_error'], payload, {
                authorization: 'Bearer ' + token,
            })
            .then(res => {
                resolve(res)
            },
                er => {
                    reject(null)
                }
            )
        })
    },
    getDelta({rootState, state, commit}, payload){
        let token = rootState.auth.access_token
        let file_id = payload.id

        return new Promise((resolve) => {
            api.post(http['project'], api['projects'] + 'document/' + file_id + '/delta', {}, {
                authorization: 'Bearer ' + token,
            })
            .then(res => {
                resolve(res)
            },
                er => 'er'
            )
        })
    },
    createTree({state, commit}, ar){
        let folders = ar || state.folders
        let expanded = state.currentFolder
        let selected = state.currentFolder

        expanded = expanded.split('/').slice(1)
        let expandedList = []
        expanded.map(i => {
            let str = expandedList.join('') + '/' + i
            expandedList.push(str)
        })

        let id = 1

        const createTree = (a, g = false) => {
            let group = g || false
            let result = []
            let level = {result}
            a.map(path => {
                let arPath = path.split('/').slice(1, 3)
                let opened = expandedList.filter(i => i == path).length ? true : false

                arPath.reduce((r, title, i, arPath) => {
                    if(!r[title]){// && i < 2){
                        r[title] = {result: []}
                        r.result.push({
                            title,
                            data: {
                                id: id++,
                                path: path,
                                group: false,
                                toGroup: group
                            },
                            //isLeaf: i ? true : false,
                            isExpanded: opened,
                            isSelected: selected == path ? true : false,
                            children: r[title].result
                        })
                    }

                    return r[title]
                }, level)
            })
            return result
        }

        let groups = state.groups.map(i => {
            let group = {
                title: i.group,
                data: {
                    id: id++,
                    path: '/' + i.group,
                    group: true,
                    toGroup: i.group
                },
                isExpanded: true,
                isSelected: selected == '/' + i.group ? true : false,
                children: createTree(i.folders, i.group)
            }
            i.folders.map(i => {
                folders = folders.filter(f => f != i)
            })
            return group
        })
        let folderList = createTree(folders)
        let tree = [...groups, ...folderList]
        let map = service.createMap(tree)
        commit('setFolderTree', tree)
        commit('setFoldersMap', map)
    },
    addDoc({rootState, state, commit}, payload){
        let token = rootState.auth.access_token
        return api.put(http['project'], api['projects'] + 'document', payload, {
            authorization: 'Bearer ' + token,
        })
    },
    updateDocInState({state, commit}, doc){
        let list = state.listDocs.map(d => d.id == doc.id ? {...d, ...doc} : d)
        let foldersMap = state.foldersMap.map(i => {
            if(i.id == doc.folder){
                i.files = i.files.map(f => f.id == doc.id ? {...f, ...doc} : f)
            }
            return i
        })
        commit('setFoldersMap', foldersMap)
        commit('setListDocs', list)
    },
    getDoc({rootState, state, commit}, payload) {
        let token = rootState.auth.access_token

        const file_id = payload.id
        let access_query = payload.access_query ? '?access=' + payload.access_query : ''
        return api.get(http['project'], api['projects'] + 'document/' + file_id + access_query, {}, {
            authorization: 'Bearer ' + token,
        })
    },
    removeDoc({rootState, state, commit}, payload){
        let token = rootState.auth.access_token
        const file_id = payload.id
        return api.remove(http['project'], api['projects'] + 'document/' + file_id, {}, {
            authorization: 'Bearer ' + token,
        })
    },
    addGroup({rootState, state, commit}, payload){
        let token = rootState.auth.access_token
        const uuid = state.activeProject.id
        const type_id = 'c'
        const id = rootState.administration.company.id
        let params = type_id + '/' + id + '/' + uuid + '/attachment/group'
        return new Promise((resolve) => {
            api.post(http['project'], api['projects'] + params, payload, {
                authorization: 'Bearer ' + token,
            }, 'PUT')
            .then(res => {
                resolve(res)
            },
                er => 'er'
            )
        })
    },
    addFolder({rootState, state, commit}, payload){
        let token = rootState.auth.access_token
        return api.put(http['project'], api['projects'] + 'folder', payload, {
                authorization: 'Bearer ' + token,
            })
    },
    removeGroup({rootState, state, commit}, payload){
        let token = rootState.auth.access_token
        const uuid = state.activeProject.id
        const type_id = 'c'
        const id = rootState.administration.company.id
        let params = type_id + '/' + id + '/' + uuid + '/attachment/group'
        return new Promise((resolve) => {
            api.post(http['project'], api['projects'] + params, payload, {
                authorization: 'Bearer ' + token,
            }, 'DELETE')
            .then(res => {
                resolve(res)
            },
                er => 'er'
            )
        })
    },
    removeFolder({rootState, state, commit}, payload){
        let token = rootState.auth.access_token
        const folder_id = payload.uuid
        return api.remove(http['project'], api['projects'] + 'folder/' + folder_id, {}, {
                authorization: 'Bearer ' + token,
        })
    },
    updateNode({state, commit}, payload){
        let list = payload.nodes.map(n => n.data.id == payload.id ? {...n, title: payload.props.name} : n)
        commit('updateGroup', list)
    },
    setActiveProject({state, commit}, payload){
        let project = state.projects.filter(item => item.id == payload.id)
        project = project.length ? Object.assign({}, project[0]) : null
        commit('setActiveProject', project)
    },
    setActiveGroup({state, commit}, payload){
        commit('setActiveGroup', {
            id: payload.id
        })
        if(payload.hasOwnProperty('value')){
            let groups = [...state.groups]
            groups = groups.map(i => i.id == payload.id ? {...i, active: payload.value} : i)
            commit('updateGroup', groups)
        }
    },
    saveChange({commit}, payload){
        commit('saveChange', payload)
    },
    setCommentsHistory({state, commit}){
        new Promise((resolve) => {
            resolve(state.historyList)
        })
        .then(historyList => {
            commit('setComments', historyList)
            return historyList
        })
        .then(historyList => {
            let anno_list = []
            historyList.map(i => {
                anno_list = [...anno_list, ...i.annotation]
            })
            commit('setMarkerList', anno_list)
        })
    },
    addComment({state, commit, dispatch}, payload){
        if(payload.doc == '2d'){
            let comment = Object.assign({}, payload)
            comment.id = new Date().getTime()
            comment.annotation = [...state.markerStack]
            comment.annotation = comment.annotation.map(i => ({...i, comment: comment.id}))
            let list = [...state.commentList]
            list = [...list, comment]
            dispatch('setMarkerList', comment.annotation)
            commit('addComment', list)
            commit('clearMarkerStack')
            commit('setActiveComment', comment.id)
        }
        if(payload.doc == '3d'){
            let comment = Object.assign({}, payload)
            comment.id = new Date().getTime()
            comment.position = {
                x: payload.position.x,
                y: payload.position.y,
                z: payload.position.z
            }
            let list = [...state.commentList]
            list = [...list, comment]
            commit('addComment', list)
            commit('setActiveComment', comment.id)
        }
    },
    updateComment({state, commit}, payload){
        let list = state.commentList.map(item => item.id == payload.id ? Object.assign({}, item, {text: payload.text}) : item)
        commit('updateComment', list)
    },
    removeComment({state, commit}, payload){
        let list = state.commentList.filter(item => item.id != payload.id)
        let markerList = []
        list.map(i => {
            markerList = [...markerList, ...i.annotation]
        })
        if(state.markerStack.length){
            let value = !markerList.length ? 0 : markerList[markerList.length - 1].value
            let markerStack = [...state.markerStack]
            markerStack = markerStack.map((i, j) => ({...i, value: value + j + 1}))
            commit('updateMarkerStack', markerStack)
        }
        commit('setMarkerList', markerList)
        commit('updateComment', list)
    },
    saveCommentState({state, commit}, payload){
        let commentState = {
            status: true,
            markerStack: state.markerStack,
            commentActive: state.activeComment,
            commentInput: payload.input
        }
        commit('saveCommentState', commentState)
    },
    addReply({state, commit}, payload){
        let comment = state.commentList.filter(item => item.id == payload.id)[0]

        payload.reply.id = new Date().getTime()
        comment.reply.push(payload.reply)
        let list = state.commentList.map(item => item.id == payload.id ? comment : item)
        commit('updateComment', list)
    },
    updateReply({state, commit}, payload){
        let comment = state.commentList.filter(item => item.id == payload.comment_id)[0]
        let replyList = comment.reply
        replyList = replyList.map(item => item.id == payload.id ? Object.assign({}, item, {text: payload.text}) : item)
        comment.reply = replyList

        let list = state.commentList.map(item => item.id == payload.comment_id ? Object.assign({}, item, {reply: replyList}) : item)

        commit('updateComment', list)
    },
    removeReply({state, commit}, payload){
        let comment = state.commentList.filter(item => item.id == payload.comment_id)[0]
        let replyList = comment.reply
        replyList = replyList.filter(item => item.id != payload.id)
        let list = state.commentList.map(item => item.id == payload.comment_id ? Object.assign({}, item, {reply: replyList}) : item)
        commit('updateComment', list)
    },
    getTaskProject({rootState, commit}, payload){
        let token = rootState.auth.access_token
        const {type_id, id, project_uuid, filter} = payload

        api.get(http['tasks'], api['projects'] + type_id + '/' + id + '/' + project_uuid + '/tasks', filter, {
            authorization: 'Bearer ' + token
        })
        .then(res => {
            let list = res || []
            commit('setTaskList', list)
        })
        .catch(er => {
            console.log('get tasks project er', er)
            return er
        })
    },
    getTaskList({rootState, dispatch, commit}, payload){
        let token = rootState.auth.access_token
        const {type_id, id, project_uuid, filter} = payload
        let user = rootState.administration.user.id
        let userList = []
        rootState.administration.groupPermissions
            .filter(f => f.id == '1' || f.id == '2')
            .map(p => {
                userList = [...userList, ...p.users.map(u => {return u.id})]
            })
        let params = type_id + '/' + id + (project_uuid ? '/' + project_uuid : '') + '/tasks'

        api.get(http['tasks'], api['projects'] + params, filter, {
            authorization: 'Bearer ' + token
        })
        .then(res => {
            let list = res || []
            let plist = []
            list = list.filter(f => userList.some(s => s == user) || f.user == user || f.owner == user)
            list.map(l => {
                    if(l.file && l.file != 'fff'){
                        plist.push(dispatch('common/getFile', {id: l.file}, {root: true}))
                    }
                })
            Promise.allSettled(plist)
            .then(res => {
                list = list.map(l => {
                    let item = res.find(f => f.value.id == l.file)
                    l.src = item
                        ? item.value
                            ? item.value.file
                            : ''
                        : ''
                    l.task_id = parseInt(l.task_id)
                    return l
                })
                commit('setTaskList', list)
            })
            .catch(er => {
                console.log('get tasks er, get screen er', er)
            })
        })
        .catch(er => {
            console.log('get tasks list er', er)
        })
    },
    updateTask({rootState, dispatch}, payload){
        let token = rootState.auth.access_token
        const {type_id, id, project_uuid, body, docid, filter} = payload
        let task_id = payload.task_id ? '/' + payload.task_id : ''

        api.post(http['tasks'], api['projects'] + type_id + '/' + id + '/' + project_uuid + '/task' + task_id, body, {
            authorization: 'Bearer ' + token,
            'content-type': false
        })
        .then(res => {
            dispatch('getTaskList', {
                type_id: type_id,
                id: id,
                project_uuid: project_uuid,
                filter: filter
            })
        })
        .catch(er => {
            console.log('get update tasks er', er)
        })
    },
    getWorkList({rootState, commit}, payload){
        let token = rootState.auth.access_token
        let file_id = payload.file
        return new Promise((resolve, reject) => {
            api.get(http['cloud'], api['projects'] + 'document/' + file_id + '/task', {}, {
                authorization: 'Bearer ' + token
            })
            .then(res => {
                resolve(res)
            })
            .catch(er => {
                reject(er)
            })
        })
    },
    setWorkList({rootState}, payload){
        let token = rootState.auth.access_token
        let body = payload.body
        let file_id = payload.file

        return new Promise((resolve) => {
            api.post(http['cloud'], api['projects'] + 'document/' + file_id + '/task', body, {
                authorization: 'Bearer ' + token,
            }, 'PUT')
            .then(res => {
                resolve(res)
            })
            .catch(er => {
                console.log('set tasks er', er)
                resolve(er)
            })
        })
    },
    getWorkList_({rootState, commit}, payload){
        // let token = rootState.common.bearer

        return new Promise((resolve, reject) => {
            api.post(http['api'], api['getjobs'], {unitbim_file_id: '2016e938998b-2135-439d-bc8a-8574aea89003'}, {
                authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uX2lkIjo1Njc5LCJpYXQiOjE2NTI3ODYzMjV9.iH1kovseBbTsYPFpYBwuw0mUZ-z-owph63KSx4eoIXU'
            })
            .then(res => {
                resolve(res)
            })
            .catch(er => {
                console.log('get job er', er)
                reject(er)
            })
        })
    },
    getWorkList__({rootState, commit}, pld){
        return new Promise((resolve, reject) => {
            api.get('', '/job_3713.json', {}, {})
            .then(res => {
                resolve(res)
            })
            .catch(er => {
                console.log('get job er', er)
                reject(er)
            })
        })
    },
    setWorkList_({rootState}, payload){
        // let token = rootState.common.bearer
        let body = payload.body

        return new Promise((resolve, reject) => {
            api.post(http['api'], api['setjob'], body, {
                authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uX2lkIjo1Njc5LCJpYXQiOjE2NTI3ODYzMjV9.iH1kovseBbTsYPFpYBwuw0mUZ-z-owph63KSx4eoIXU'
            })
            .then(res => {
                resolve(res)
            })
            .catch(er => {
                console.log('set job er', er)
                reject(er)
            })
        })
    },
    jsonToXlsx({rootState}, payload){
        let token = rootState.auth.access_token
        return new Promise((resolve) => {
            api.post(http['cloud'], api['json_to_xlsx'], payload, {
                authorization: 'Bearer ' + token,
            }, 'POST', false, true)
            .then(res => {
                resolve({file: res})
            })
            .catch(er => {
                console.log('json_to_xlsx er', er)
                reject({error: er})
            })
        })
    },

    /////////////////// problems service ///////////////////
    getProblems({rootState, dispatch, commit}, payload){
        let token = rootState.auth.access_token
        let uuid = payload
        return api.get(http['project'], api['projectproblems'] + '/tasks/' + uuid, {}, {
            authorization: 'Bearer ' + token
        })
    },
    getProblemReasons({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload
        return api.get(http['project'], api['projectproblems'] + '/reasons/' + uuid, {}, {
            authorization: 'Bearer ' + token
        })
    },
    getProblemCategories({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload
        return api.get(http['project'], api['projectproblems'] + '/categoryes/' + uuid, {}, {
            authorization: 'Bearer ' + token
        })
    },
    getProblemStatuses({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload
        return api.get(http['project'], api['projectproblems'] + '/statuses/' + uuid, {}, {
            authorization: 'Bearer ' + token
        })
    },
    getProblemTemplates({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload
        return api.get(http['project'], api['projectproblems'] + '/templates/' + uuid, {}, {
            authorization: 'Bearer ' + token
        })
    },
    createProblem({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.uuid
        let body = payload.body

        return api.put(http['project'], api['projectproblems'] + '/tasks/' + uuid, body, {
            authorization: 'Bearer ' + token
        })
    },
    updateProblem({rootState, dispatch, commit}, payload){
        let token = rootState.auth.access_token
        let uuid = payload.uuid
        let body = payload.body

        console.log('uuid', uuid, 'body', body, 'id', body.id)
        return api.post(http['project'], api['projectproblems'] + '/tasks/' + uuid + '/' + body.id, body, {
            authorization: 'Bearer ' + token
        })
    },
    removeProblem({rootState, dispatch, commit}, payload){
        let token = rootState.auth.access_token
        let uuid = payload.uuid
        let problem_id = payload.problem_id

        return api.remove(http['project'], api['projectproblems'] + '/tasks/' + uuid + '/' + problem_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
    getFields({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.uuid
        let type_id = payload.type_id

        return api.get(http['project'], api['projectproblems'] + '/fields/' + uuid + '/' + type_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
    createCategory({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let body = payload.body

        return api.put(http['project'], api['projectproblems'] + '/categoryes/' + uuid, body, {
            authorization: 'Bearer ' + token
        })
    },
    updateCategory({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let cat_id = payload.body.id
        let body = payload.body

        return api.post(http['project'], api['projectproblems'] + '/categoryes/' + uuid + '/' + cat_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    deleteCategory({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let cat_id = payload.cat_id

        return api.remove(http['project'], api['projectproblems'] + '/categoryes/' + uuid + '/' + cat_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
    createType({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let cat_id = payload.body.cat_id
        let body = payload.body

        return api.put(http['project'], api['projectproblems'] + '/categoryes/type/' + uuid + '/' + cat_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    updateType({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let type_id = payload.body.id
        let body = payload.body

        return api.post(http['project'], api['projectproblems'] + '/categoryes/type/' + uuid + '/' + type_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    deleteType({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let type_id = payload.type_id

        return api.remove(http['project'], api['projectproblems'] + '/categoryes/type/' + uuid + '/' + type_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
    createTypeField({rootState, dispatch, commit}, payload) { 
        // поле по типу проблемы
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let type_id = payload.type_id
        let body = payload.body

        return api.put(http['project'], api['projectproblems'] + '/fields/' + uuid + '/' + type_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    updateTypeField({rootState, dispatch, commit}, payload) {
        // поле по типу проблемы
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let type_id = payload.type_id
        let field_id = payload.body.id
        let body = payload.body

        return api.post(http['project'], api['projectproblems'] + '/fields/' + uuid + '/' + type_id + '/' + field_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    deleteTypeField({rootState, dispatch, commit}, payload) {
        // по типу проблемы
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let field_id = payload.field_id

        return api.remove(http['project'], api['projectproblems'] + '/fields/' + uuid + '/' + field_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
    updateStatus({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let status_id = payload.body.id
        let body = payload.body
        // /statuses/{uuid}/{id}

        return api.post(http['project'], api['projectproblems'] + '/statuses/' + uuid + '/' + status_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    createReason({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let body = payload.body

        return api.put(http['project'], api['projectproblems'] + '/reasons/' + uuid, body, {
            authorization: 'Bearer ' + token
        })
    },
    deleteReason({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let cat_id = payload.cat_id

        return api.remove(http['project'], api['projectproblems'] + '/reasons/' + uuid + '/' + cat_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
    updateReason({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let cat_id = payload.body.id
        let body = payload.body

        return api.post(http['project'], api['projectproblems'] + '/reasons/' + uuid + '/' + cat_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    createReasonType({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let cat_id = payload.body.cat_id
        let body = payload.body

        return api.put(http['project'], api['projectproblems'] + '/reasons/type/' + uuid + '/' + cat_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    deleteReasonType({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let type_id = payload.type_id

        return api.remove(http['project'], api['projectproblems'] + '/reasons/type/' + uuid + '/' + type_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
    updateReasonType({rootState, dispatch, commit}, payload) {
        let token = rootState.auth.access_token
        let uuid = payload.project_id
        let type_id = payload.body.id
        let body = payload.body

        return api.post(http['project'], api['projectproblems'] + '/reasons/type/' + uuid + '/' + type_id, body, {
            authorization: 'Bearer ' + token
        })
    },

    /////////////////// coordination spaces ///////////////////
    getSpaces({rootState, dispatch, commit}, payload) {
        const token = rootState.auth.access_token
        const project_id = payload

        return api.get(http['spaces'], api['spaces'] + '/spaces/' + project_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
    createSpace({rootState, dispatch, commit}, payload) {
        const token = rootState.auth.access_token
        const project_id = payload.project_uuid
        const body = payload.body

        return api.put(http['spaces'], api['spaces'] + '/spaces/' + project_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    changeSpace({rootState, dispatch, commit}, payload) {
        const token = rootState.auth.access_token
        const project_id = payload.project_uuid
        const body = payload.body

        return api.post(http['spaces'], api['spaces'] + '/spaces/' + project_id + '/' + body.id, body, {
            authorization: 'Bearer ' + token
        })
    },

    /////////////////// coordination - view service ///////////////////
    getViews({rootState, dispatch, commit}, payload) {
        const token = rootState.auth.access_token
        const uuid = payload.project_id
        const space_id = payload.space_id

        return api.get(http['spaces'], api['spaces'] + '/views/' + uuid + '/' + space_id, {}, {
            authorization: 'Bearer ' + token
        })
    },

    /////////////////// permissions ///////////////////
    getPermissionsForFolder({rootState, dispatch, commit}, payload) {
        const token = rootState.auth.access_token
        const folder_id = payload.folder_id
        const body = payload.body

        return api.get(http['spaces'], api['spaces'] + '/folder/' + folder_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    addPermissionsForFolder({rootState, dispatch, commit}, payload) {
        const token = rootState.auth.access_token
        const folder_id = payload.folder_id
        const body = payload.body

        return api.post(http['spaces'], api['spaces'] + '/folder/' + folder_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    deletePermissionsForFolder({rootState, dispatch, commit}, payload) {
        const token = rootState.auth.access_token
        const folder_id = payload.folder_id
        const body = payload.body

        return api.remove(http['spaces'], api['spaces'] + '/folder/' + folder_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    getRoles({rootState, dispatch, commit}, payload) {
        const token = rootState.auth.access_token
        const folder_id = payload.folder_id

        return api.get(http['spaces'], api['spaces'] + '/folder/' + folder_id, body, {
            authorization: 'Bearer ' + token
        })
    },
    // ifc collisions service
    calculateIfcFilesCollisions({rootState, dispatch, commit}, payload) {
        const token = rootState.auth.access_token
        // payload must be an object { files: ['file1_url','file2_url',...] }

        return api.post(http['cloud'], api['getcollisions'], payload, {
            authorization: 'Bearer ' + token
        })
    },
    getIfcFilesCollisions({rootState, dispatch, commit}, payload) {
        const token = rootState.auth.access_token
        const task_id = payload

        return api.get(http['cloud'], api['getcollisions'] + '/' + task_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
    getIfcCollisionsJSON({rootState, dispatch, commit}, payload) {
        // только на уже выполненную задачу
        const token = rootState.auth.access_token
        const task_id = payload

        return api.get(http['cloud'], api['getcollisions'] + '/collisions.json' + task_id, {}, {
            authorization: 'Bearer ' + token
        })
    },
}

export default {
    namespaced: true,
    state,
    actions,
    mutations
}
