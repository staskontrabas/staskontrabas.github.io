import { http, api } from '@/utils/define'
import { sortObj } from '@/utils/services'
import * as socket from '@/utils/socket'

const state = {
    socket: '',
    socketMap: {},
    listModel: [],
    modelIndex: 0,
    listMsgIndex: 0,
    eventOut: '',
    eventIn: '',
    doc: '',
    docId: '',
    version: null,
    check: false,
    subscribe: false,
    key: '',
    comments: [],
    activeComment: false,
    user: '',
    project: null,
    timerId: '',

    borders: [],
    borderHelper: {
        name: 0,
        status: false
    },
    borderList: [],
    borderStack: [],
    borderEdit: false,
    draft: false,
    draftBbox: {
        x: 0,
        y: 0,
        w: 0,
        h: 0
    },
    draftList: [],
    draftHover: '',

    markers: [],
    markerStack: null,
}

const mutations = {
    setSocket(state, payload){
        state.socket = payload
    },
    setSocketMap(state, payload){
        state.socketMap = {
            ...state.socketMap,
            ...payload
        }
    },
    setListModel(state, payload){
        state.listModel = payload
    },
    setModelIndex(state, payload){
        state.modelIndex = payload
    },
    setListMsgIndex(state, payload){
        state.listMsgIndex = payload
    },
    setTimer(state, payload){
        state.timerId = payload
    },
    setDocId(state, payload){
        state.docId = payload
    },
    setDocCurrent(state, payload){
        state.doc = payload
    },
    setDocVersion(state, payload){
        state.version = payload
    },
    setUser(state, payload){
        state.user = payload
    },
    setProject(state, payload){
        state.project = payload
    },
    setEventOut(state, payload){
        state.eventOut = payload
    },
    setSubscribe(state){
        state.subscribe = true
    },
    setKey(state, key){
        state.key = key
    },
    setMessages(state, list){
        state.comments = list
    },
    setActiveComment(state, payload){
        state.activeComment = payload
    },
    close(state){
        state.socket = ''
        state.subscribe = false
    },
//borders
    setBorders(state, list){
        state.borders = list
    },
    updateBorders(state, list){
        state.borders = list
    },
    setBorderHelper(state, p){
        state.borderHelper = p
    },
    addBorder(state, payload){
        //state.borderStack = [...state.borderStack, payload]
        state.borders = [...state.borders, payload]
    },
    clearBorderStack(state, payload){
        state.borderStack = []
    },
    updateBorderStack(state, payload){
        state.borderStack = payload
    },
    setBorderList(state, payload){
        state.borderList = payload
    },
    editBorder(state, payload){
        state.borderEdit = payload
    },
    /*
    setDraft(state, payload){
        state.draft = payload
    },
    */
    setDraftBbox(state, payload){
        state.draftBbox = {...state.draftBbox, ...payload}
    },
    setDraftHover(state, payload){
        state.draftHover = payload
    },

//markers
    setMarkers(state, list){
        state.markers = list
    },
    updateMarkers(state, list){
        state.markers = list
    },
    addMarker(state, payload){
        state.markers = [...state.markers, payload]
    },
    // clearBorderStack(state, payload){
    //     state.borderStack = []
    // },
    updateMarkerStack(state, payload){
        state.markerStack = payload
    },
    // setMarkerList(state, payload){
    //     state.markerList = payload
    // },
    // editBorder(state, payload){
    //     state.borderEdit = payload
    // },
    // setDraftBbox(state, payload){
    //     state.draftBbox = {...state.draftBbox, ...payload}
    // },
    // setDraftHover(state, payload){
    //     state.draftHover = payload
    // },
}
const actions = {
    setBorderHelper({state,commit}, p){
        let borders = JSON.parse(JSON.stringify(state.borders))
        borders = sortObj(borders, 'name')
        let name = (!borders.length
            ? 0
            : borders[borders.length - 1].name) + 1
        let marker = {
            name: name,
            status: false,
            x: 0,
            y: 0
        }
        marker = {...marker, ...p}
        commit('setBorderHelper', marker)
    },
    addBorder({state, commit, dispatch}, p){
        let count = state.borderHelper.name
        let id = (new Date().getTime()).toString()
        let brd = {
            id: id,
            uid: state.user.id,
            x: p.x,
            y: p.y,
            w: 0,
            h: 0,
            vis: 1,
            name: count
        }
        dispatch('setBorderHelper', {status: false})
        commit('addBorder', brd)
        dispatch('border', {
            name: brd.name,
            x: brd.x,
            y: brd.y,
            h: brd.h,
            w: brd.w,
            vis: 1,
            act: 1
        })
    },
    updateBorder({state, dispatch, commit}, p){
        let list = state.borders

        list = list.map(i => {
            if(i.id == p.id){
                let brd = {...i, ...p}
                dispatch('border', {
                    id: brd.id,
                    uid: brd.uid,
                    name: brd.name,
                    x: brd.x,
                    y: brd.y,
                    h: brd.h,
                    w: brd.w,
                    act: 0
                })
                return brd
            }
            else{
                return i
            }
        })
        //commit('updateBorderStack', list)
    },
    setBorderList({state, commit}, list){
        let borders = state.borders
        let borderList = []
        let borderStack = []
        borders.map(b => {
            if(list.some(i => i == b.id)){
                borderList = [...borderList, b]
            }
            else{
                borderStack = [...borderStack, b]
            }
        })
        commit('setBorderList', borderList)
        commit('updateBorderStack', borderStack)
    },
    removeBorderInStack({state, dispatch, commit}, payload){
        dispatch('border', {
            id: payload,
            act: -1
        })
    },
    renameBorderInStack({state, dispatch, commit}, payload){
		let comments = JSON.parse(JSON.stringify(state.comments))
		let borders = JSON.parse(JSON.stringify(state.borders))
        borders = borders.filter(b => b.id != payload)
        commit('updateBorders', borders)

		let list = []
		comments.map(c => {
			list = [...list, ...c.borders]
		})

        let borderList = []
        comments.map(c => {
            c.borders.map(b => {
                borderList = [...borderList, ...borders.filter(i => i.id == b)]
            })
        })

        let stack = []
		borders.map(b => {
			if(!list.some(s => s == b.id)){
				stack = [...stack, b]
			}
		})

        if(stack.length){
            let name = Math.max(...borderList.map(b => {
                return b.name}), 0) + 1
            let listValue = sortObj(stack, 'name')
            stack = listValue.map((i, j) => ({...i, name: name + j}))
            stack.map(b => {
                if(state.user.id == b.uid){
                    dispatch('updateBorder', b)
                }
            })
        }
    },
////////////////////////////
addMarker({state, commit, dispatch}, p){
    // let count = state.borderHelper.name
    let id = (new Date().getTime()).toString()
    let mrk = {
        id: id,
        uid: state.user.id,
        siz: 10,
        up: p.up,
        dir: p.dir,
        eye: p.eye,
        dist: p.dist,
        vis: p.vis
    }
    // dispatch('setBorderHelper', {status: false})
    commit('addMarker', mrk)
    dispatch('marker', {
        siz: 10,
        up: mrk.up,
        dir: mrk.dir,
        eye: mrk.eye,
        dist: mrk.dist,
        vis: mrk.vis,
        act: 1
    })
},
onMarker({state, commit, dispatch}, pld){
    dispatch('marker', pld)
},
updateMarker({state, dispatch, commit}, p){
    let list = state.markers

    list = list.map(i => {
        if(i.id == p.id){
            let mrk = {...i, ...p}
            dispatch('marker', {
                id: mrk.id,
                uid: mrk.uid,
                siz: 10,
                up: mrk.up,
                dir: mrk.dir,
                eye: mrk.eye,
                dist: mrk.dist,
                vis: mrk.vis,
                act: 0
            })
            return mrk
        }
        else{
            return i
        }
    })
},
setMarkerList({state, commit}, list){
    let markers = state.markers
    let markerList = []
    let markerStack = []
    markers.map(mrk => {
        if(list.some(i => i == mrk.id)){
            markerList = [...markerList, mrk]
        }
        else{
            markerStack = [...markerStack, mrk]
        }
    })
    commit('setMarkerList', markerList)
    // commit('updateBorderStack', borderStack)
},
// removeBorderInStack({state, dispatch, commit}, payload){
//     dispatch('border', {
//         id: payload,
//         act: -1
//     })
// },

/////////////


    setSocket({state, dispatch, commit}, payload){
        let doc = payload.did
        let version = '1'
        // !doc.version
        //     ? doc.files.length
        //         ? doc.files[0].id
        //         : '1'
        //     : doc.version
        // commit('setDocId', doc.id)
        // commit('setDocCurrent', doc)
        // commit('setDocVersion', version)

        commit('setListModel', payload.list)
        let socketMap = {}
        payload.list.map(id => {
            socketMap[id] = null
        })
        commit('setSocketMap', socketMap)

        let socketId = new WebSocket(http['socket_project'] + api['comments'])
        socketId.binaryType = "arraybuffer"
        commit('setSocket', socketId)
        socketId.onmessage = (e) => {
            socket.cin(e.data, state.eventOut)
            .then(res => {
                if(res.action == 'ok'){
                    if(state.eventOut == "LOGIN" && !state.subscribe){
                        dispatch('subscribe')
                    }
                    if(state.eventOut == "SUBSCRIBE"){
                        //dispatch('messages')
                    }
                }
                else{
                    if(res.action){
                        try{
                            dispatch(res.action, res.body)
                        }
                        catch(e){
                            console.log('ERROR: no action for event. param "res.action = "', res.action, '. er: ', e)
                        }
                    }
                }
            })
        }
        socketId.onopen = (e) => {
            commit('setEventOut', 'LOGIN')
        }
        socketId.onclose = (e) => {
            clearInterval(state.timerId)
            commit('close')
            commit('setBorders', [])
            commit('setMarkers', [])
            commit('setMessages', [])
        }
        socketId.onerror = (e) => {
            console.log('++WSS error:', e)
        }
    },
    async login({rootState, state, dispatch, commit}){
        let token = rootState.auth.access_token
        let user = rootState.administration.user//userAvatar
        let avatar = rootState.administration.userAvatar
        let project = rootState.workflow.activeProject
        user.avatar = avatar
        commit('setUser', user)
        commit('setProject', project)


        // const token = "top-secret-token";
        // const bearer = "iR7aHUgudbnLEgex4JtkhBmx";
        // let login = await socket.cout('LOGIN', null, token + '|' + bearer)
        let login = await socket.cout('LOGIN', null, token)

        state.socket.send(login)
    },
    close({state, commit}){
        if(!state.socket){
            return
        }
        state.socket.close()
        commit('setMessages', [])
    },
    async ping({state}){
        let ping = await socket.cout('PING')
        state.socket.send(ping)
    },
    async pong({state}){
        let pong = await socket.cout('PONG')
        state.socket.send(pong)
    },
    errorq({state, commit}, body){
        //body = JSON.parse(body)
        console.log('---ERROR ',  ': ', body)
    },
    subscribe({state, commit, dispatch}){
            commit('setSubscribe')
            commit('setEventOut', 'SUBSCRIBE')
            state.listModel.map(id => {
                // let subscribe = socket.cout('EVENT', 'SUBSCRIBE', JSON.stringify({
                //     typ: 0,
                //     id: state.user.company.toString(),
                //     prj: state.project.id.toString(),
                //     did: id.toString(),
                //     ver: parseInt(state.version)
                // }))
                // console.log('---subscribe', subscribe)
                // state.socket.send(subscribe)
                socket.cout('EVENT', 'SUBSCRIBE', JSON.stringify({
                    typ: 0,
                    id: state.user.company.toString(),
                    prj: state.project.id.toString(),
                    did: id.toString(),
                    ver: parseInt(state.version)
                }))
                .then(subscribe => {
                    state.socket.send(subscribe)
                })
            })
            state.timerId = setInterval(() => dispatch('ping'), 40000)
    },
    someone_subscribed({rootState, state, dispatch, commit}, body){
        body = JSON.parse(body)
            commit('setEventOut', 'SOMEONE_SUBSCRIBED')
            // commit('setKey', body.key)
            let socketMap = {
                [state.listModel[state.modelIndex]]: body.key
            }
            commit('setSocketMap', socketMap)

            dispatch('messages', body.key)
            dispatch('borders', body.key)
            dispatch('markers', body.key)

            commit('setModelIndex', state.modelIndex + 1)
        // if(state.eventOut == 'SUBSCRIBE'){
        //     commit('setEventOut', 'SOMEONE_SUBSCRIBED')
        //     // commit('setKey', body.key)
        //     console.log('---------------body', body)
        //     let socketMap = {
        //         [state.listModel[state.modelIndex]]: body.key
        //     }
        //     commit('setSocketMap', socketMap)
        //
        //     dispatch('messages', body.key)
        //     dispatch('borders', body.key)
        //     dispatch('markers', body.key)
        //
        //     commit('setModelIndex', state.modelIndex + 1)
        // }
        // else{
        //     let userList = rootState.administration.company.users
        //     userList = userList(u => u.id)
        //     if(!userList.some(u => u == body.uid)){
        //         dispatch('administration/getCompany', null, {root: true})
        //     }
        // }
    },
    async borders({state, commit}, pld){
        commit('setEventOut', 'BORDERS')
        let borAr = await socket.cout('EVENT', 'BORDERS', JSON.stringify({
            key: pld
        }))
        state.socket.send(borAr)
    },
    border_list({state, commit}, body){
        body = JSON.parse((body))
        let list = body.brds || []

        list = list.map(b => {
            let brd = {
                id: b.bid,
                uid: b.uid,
                name: parseInt(b.nam),
                x: b.x,
                y: b.y,
                h: b.h,
                w: b.w,
                vis: b.vis
            }
            return brd
        })
        commit('setBorders', list)
        //commit('setBorderList', list)
    },
    async border({state, commit}, pld){
        let brd = {
            key: state.socketMap[pld.fileId],
            act: p.act
        }
        if(pld.act == 1){
            brd = {
                ...brd,
                nam: pld.name.toString(),
                x: pld.x,
                y: pld.y,
                h: pld.h,
                w: pld.w,
                vis: 1,
            }
        }
        if(pld.act == 0){
            //let border = state.borderStack.filter(b => b.id == p.id)
            brd = {
                ...brd,
                bid: pld.id,
                nam: pld.name.toString(),//border[0].name.toString(),
                x: pld.x,
                y: pld.y,
                h: pld.h,
                w: pld.w,
                vis: 1,
            }
        }
        if(pld.act == -1){
            brd = {
                ...brd,
                bid: pld.id
            }
        }

        brd = await socket.cout('EVENT', 'BORDER', JSON.stringify(brd))
        state.socket.send(brd)
    },
    someone_bordered({state, dispatch, commit}, body){
        body = JSON.parse((body))
        let brd = {}
        let list = [...state.borders]

        if(body.act == 1){
            if(body.uid == state.user.id){
                list = list.map(b => b.name == body.nam ? {...b, id: body.bid} : b)
                commit('updateBorders', list)
            }
            else{
                brd.id = body.bid
                brd.uid = body.uid
                brd.name = parseInt(body.nam)
                brd.x = body.x
                brd.y = body.y
                brd.h = body.h
                brd.w = body.w
                brd.vis = 0

                commit('addBorder', brd)
            }
        }
        if(body.act == 0){
            //if(body.uid != state.user.id){
                list = list.map(b => b.id == body.bid
                        ? ({...b,
                            name: parseInt(body.nam),
                            x: body.x,
                            y: body.y,
                            h: body.h,
                            w: body.w})
                        : b
                )
                //commit('updateBorderStack', list)
                commit('updateBorders', list)
            //}
        }
        if(body.act == -1){
            //if(body.uid != state.user.id){
                //list = list.filter(b => b.id != body.bid)
                //commit('updateBorders', list)
                dispatch('renameBorderInStack', body.bid)
                //commit('updateBorderStack', list)
            //}
        }
    },
    async markers({state, commit}, pld){
        commit('setEventOut', 'MARKERS')
        let mrkAr = await socket.cout('EVENT', 'MARKERS', JSON.stringify({
            key: pld
        }))
        state.socket.send(mrkAr)
    },
    marker_list({state, commit}, body){
        body = JSON.parse((body))
        let list = body.mrks || []

        // list = list.map(m => {
        //     let mrk = {
        //         id: m.mid,
        //         uid: m.uid,
        //         siz: 10,
        //         up: m.up,
        //         dir: m.dir,
        //         eye: m.eye,
        //         dist: m.dist,
        //         vis: m.vis
        //     }
        //     return mrk
        // })
        commit('setMarkers', list)
    },
    async marker({state, commit}, pld){
        let mrk = {
            key: state.socketMap[pld.fileId],
            act: pld.act
        }
        if(pld.act == 1){
            mrk = {
                ...mrk,
                up: pld.up,
                dir: pld.dir,
                eye: pld.eye,
                dist: pld.dist,
                clr: pld.clr,
                eid: pld.eid,
                siz: pld.size,
                vis: 1,
            }
        }
        if(pld.act == 0){
            //let border = state.borderStack.filter(b => b.id == p.id)
            mrk = {
                ...mrk,
                mid: pld.mid,
                up: pld.up,
                dir: pld.dir,
                eye: pld.eye,
                dist: pld.dist,
                clr: pld.clr,
                eid: pld.eid,
                siz: pld.size,
                vis: 1,
            }
        }
        if(pld.act == -1){
            mrk = {
                ...mrk,
                mid: pld.mid || pld.id
            }
        }
        mrk = await socket.cout('EVENT', 'MARKER', JSON.stringify(mrk))
        state.socket.send(mrk)
    },
    someone_markered({state, dispatch, commit}, body){
        body = JSON.parse((body))
        let mrk = {}
        let list = [...state.markers]

        if(body.act == 1){
            // if(body.uid == state.user.id){
            //     list = list.map(mrk => mrk.mid == body.mid ? body : mrk)
            //     // commit('updateMarkers', list)
            // }
            // else{
            //     mrk.mid = body.mid
            //     mrk.uid = body.uid
            //     mrk.siz = body.siz
            //     mrk.eid = body.eid
            //     mrk.clr = body.clr
            //     mrk.up = body.up
            //     mrk.dir = body.dir
            //     mrk.eye = body.eye
            //     mrk.dist = body.dist
            //     mrk.vis = 1
            // }
                mrk.mid = body.mid
                mrk.uid = body.uid
                mrk.siz = body.siz
                mrk.eid = body.eid
                mrk.clr = body.clr
                mrk.up = body.up
                mrk.dir = body.dir
                mrk.eye = body.eye
                mrk.dist = body.dist
                mrk.vis = 1
            commit('addMarker', mrk)
        }
        if(body.act == 0){
                list = list.map(mrk => mrk.mid == body.mid
                        ? body
                        : mrk
                )
                // commit('updateMarkers', list)
        }
        if(body.act == -1){
            list = list.filter(mrk => mrk.mid != body.mid)
            commit('updateMarkers', list)
        }
    },
    async messages({state, commit}, pld){
        commit('setEventOut', 'MESSAGES')
        let mesAr = await socket.cout('EVENT', 'MESSAGES', JSON.stringify({
            key: pld,
            frm: null,
            siz: 100,
            lid: null
        }))
        state.socket.send(mesAr)
    },
    message_list({rootState, state, dispatch, commit}, body){
        body = JSON.parse((body))
        let userList = rootState.administration.company.users
        let list = body.msgs
        let borderList = []
        let key = state.socketMap[state.listModel[state.listMsgIndex]]
        const createMsgs = (list) => {
            list = list.map(m => {
                let user = userList.filter(u => u.id == m.uid)
                user = user.length ? user[0] : false
                let mes = {
                    id: m.mid,
                    key: key,
                    uid: m.uid,
                    pid: m.pid,
                    "type":"comment",
                    "avatar": state.user.id == m.uid
                                ? state.user.avatar.src
                                : "",
                    "title":"Документ версии ",
                    "user": state.user.id == m.uid
                                ? state.user.first_name + ' ' + state.user.last_name
                                : user
                                    ? user.first_name
                                        ? user.first_name + ' ' + state.user.last_name
                                        : user.email
                                    : user.email,
                    "text": m.txt,
                    date: m.tim,
                    borders: m.brds || [],
                    "reply": m.chld.length ? createMsgs(m.chld) : []
                }

                return mes
            })
            return list.reverse()
        }
        commit('setMessages', [...state.comments, ...createMsgs(list)])
        commit('setListMsgIndex', state.listMsgIndex + 1)
    },
    async message({state, dispatch, commit}, payload){
        let mes = {
            key: payload.key || state.socketMap[payload.fileId],
            pid: payload.pid.toString(),
            act: payload.action
        }
        if(payload.action == -1){
            mes.mid = payload.id

            payload.brds.map(b => {
                dispatch(payload.type, {
                    id: b,
                    act: -1
                })
            })
        }
        if(payload.action == 0){
            mes.mid = payload.id
            mes.txt = payload.text
        }
        if(payload.action == 1){
            let borders = payload.borders//state.borderStack.map(b => b.id)
            mes.brds = borders
            mes.txt = payload.text
        }
        mes = await socket.cout('EVENT', 'MESSAGE', JSON.stringify(mes))
        state.socket.send(mes)
    },
    someone_messaged({rootState, state, dispatch, commit}, body){
        body = JSON.parse((body))

        let userList = rootState.administration.company.users
        let mes = {}
        let list = [...state.comments]

        const searchMsgParent = (list, mes) => {
            let parent = {}
            list.map(m => {
                if(m.id == mes.id){
                    parent = m
                }
            })
            return parent
        }
        if(body.act == 1){
            let user = userList.filter(u => u.id == body.uid)
            user = user.length ? user[0] : false

            mes.id = body.mid
            mes.key = body.key
            mes.uid = body.uid
            mes.pid = body.pid
            mes.type = "comment"
            mes.avatar = state.user.id == body.uid
                            ? state.user.avatar.src
                            : ""
            mes.title = "Документ версии "
            mes.user = state.user.id == body.uid
                        ? state.user.first_name + ' ' + state.user.last_name
                        : user
                            ? user.first_name
                                ? user.first_name + ' ' + state.user.last_name
                                : user.email
                            : user.email,
            mes.text = body.txt
            mes.borders = body.brds || []
            mes.date = body.tim
            mes.reply = []

            if(parseInt(body.pid)){
                list = list.map(m => m.id == mes.pid
                            ? ({...m, reply: [...m.reply, mes]})
                            : m
                )
            }
            else {
                list = [...list, mes]
            }
        }
        if(body.act == 0){
            if(parseInt(body.pid)){
                list = list.map(m => m.id == body.pid
                            ? ({...m, reply: m.reply.map(r => r.id == body.mid
                                ? ({...r, text: body.txt})
                                : r
                                )
                            })
                            : m
                )
            }
            else{
                list = list.map(l => l.id == body.mid
                        ? ({...l, text: body.txt})
                        : l
                )
            }
        }
        if(body.act == -1){
            if(parseInt(body.pid)){
                list = list.map(m => m.id == body.pid
                            ? ({...m, reply: m.reply.filter(r => r.id != body.mid)})
                            : m
                )
            }
            else{
                list = list.filter(l => l.id != body.mid)
            }
        }

        commit('setMessages', list)
        if(state.user.id == body.uid){
            if(!parseInt(body.pid)){
                commit('setActiveComment', body.mid)
            }
        }
    },
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
