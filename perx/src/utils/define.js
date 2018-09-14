export const http = {
    default:
    'https://api.backendless.com/53FB6874-BEE0-9546-FFCA-1F3DEE56BE00/73E38E38-C5C9-45B2-FFB5-D05A6E16A600'
}

const post = function(http, api, body) {
    return new Promise((resolve) => {
        resolve(api(body))
    })
    .then(
        res => {
            return res
        }
    )

/*
    const requestOptions = {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        //mode: 'cors',
        body: JSON.stringify(body)
    };
    return fetch(http + api, requestOptions)
        .then(handleResponse)
        */
}

const get = function(http, api){
    return new Promise((resolve) => {
        resolve(api())
    })
    .then(
        res => {
            return res
        }
    )

    //return api
/*
    const requestOptions = {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    };
    return fetch(http + api, requestOptions)
        .then(handleResponse)
        */
}

/*
function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text)
        if (!response.ok) {
            if (response.status === 401) {
                logout();
                location.reload(true)
            }
            const error = (data && data.message) || response.statusText
            return Promise.reject(error)
        }
        return data
    })
}
*/

function dataUsers(){
    return users
}

function addUser(o){
    o.id = parseInt(users[users.length - 1].id) + 11
    users.push(o)
    return users
}
function delUser(o){
    const list = users.filter(item => item.id != o.id)
    users = list
    return users
}
function editUser(o){
    const list = users.map(item => item.id == o.id ? Object.assign(item, o) : item)
    users = list
    return users
}

export const api = {
    //getUsers: '/data/Users',
    getUsers: dataUsers,
    addUser: addUser,
    delUser: delUser,
    editUser: editUser,
    post: post,
    get: get
}

let users = [{"id":"0","lastLogin":null,"userStatus":"ENABLED","created":1536583542296,"name":"test2","ownerId":"8AEA25A2-DB4E-30A2-FF37-E9C6E220F100","socialAccount":"BACKENDLESS","updated":null,"objectId":"8AEA25A2-DB4E-30A2-FF37-E9C6E220F100","email":"test2@test.test","___class":"Users"},{"id":"1","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"2","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"3","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"4","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"5","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"6","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"7","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"744","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"8","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"9","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"10","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"11","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"12","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"13","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"14","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"},{"id":"16","lastLogin":null,"userStatus":"ENABLED","created":1536583595704,"name":"test3","ownerId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","socialAccount":"BACKENDLESS","updated":null,"objectId":"CD6F3EBB-DDC9-372D-FF1F-174D8CCE2900","email":"test3@test.test","___class":"Users"}]
