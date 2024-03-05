const state = {
    title: '',
    dct_name: '',
    dct_status: ''
}

const mutations = {
    setTitle(state, payload){
        state.title = payload
    },
    setDctView(state, payload){
        state.dct_name = payload.name
        state.dct_status = payload.status
    }
}

const  actions = {
}

export default {
    namespaced: true,
    state,
    actions,
    mutations
}
