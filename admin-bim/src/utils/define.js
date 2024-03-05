export const http__ = {
    local: 'http://localhost:8080',
    server: 'https://prodoc.unitbim.ru',
    login: 'https://login.unitbim.ru',
    //open_project: 'https://pm.unitbim.ru',
    account: 'https://prodoc.unitbim.ru',
    project: 'https://prodoc.unitbim.ru',
    cloud: 'https://cloud.unitbim.ru',
    tasks: 'https://prodoc.unitbim.ru',
    socket_project: 'wss://prodoc.unitbim.ru',
    socket_files: 'wss://cloud.unitbim.ru',
    doc_xml: 'https://login.unitbim.ru'
}
export const http_ = {
    local: 'http://localhost:8080',
    server: 'https://app.unitbim.ru',
    login: 'https://login.unitbim.ru',
    account: 'https://app.unitbim.ru',
    project: 'https://app.unitbim.ru',
    cloud: 'https://app.unitbim.ru',
    tasks: 'https://app.unitbim.ru',
    socket_project: 'wss://app.unitbim.ru',
    socket_files: 'wss://app.unitbim.ru',
    doc_xml: 'https://app.unitbim.ru',
    spaces: 'https://app.unitbim.ru',
}
export const http = {
    local: 'http://localhost:8080',
    server: 'https://prodoc.ubdev.ru',
    login: 'https://login.ubdev.ru',
    account: 'https://account.ubdev.ru',
    account_stas: 'https://stas.ubdev.ru',
    account_alexey: 'https://alexey.ubdev.ru',
    account_alexeyk: 'https://alexeyk.ubdev.ru',
    account_mggt: 'https://mggt.ubdev.ru',
    account_mt: 'https://mt.ubdev.ru',
    project: 'https://cloud.ubdev.ru',
    cloud: 'https://cloud.ubdev.ru',
    tasks: 'https://cloud.ubdev.ru',
    socket_project: 'wss://cloud.ubdev.ru',
    socket_files: 'wss://cloud.ubdev.ru',
    doc_xml: 'https://prodoc.ubdev.ru',
    spaces: 'https://cloud.ubdev.ru',

    api: 'https://api.dev.sakhalin.ladcloud.ru'
}

const put = function(http, api, body, headers = {}, method = 'PUT', signal = false, blob = null){
    let requestOptions = {
        method: method,
        headers: {
          'content-type': 'application/json'
        },
        body: ''
    }
    requestOptions.headers = {...requestOptions.headers, ...headers}

    let obj = {}
    if(requestOptions.headers['content-type'] == 'application/json'){
        obj = JSON.stringify(body)
    }
    else if(!requestOptions.headers['content-type']){
        delete requestOptions.headers['content-type']
        obj = body
    }
    else{
        obj = body
    }
    requestOptions.body = obj

    if(signal){
        requestOptions = {
            ...requestOptions,
            signal
        }
    }

    requestOptions.credentials = "include"

    if(blob === null){
        return fetch(http + api, requestOptions)
            .then(handleResponse)
    }
    else{
        return fetch(http + api, requestOptions)
            .then(handleResponseBlob)
    }
}

const post = function(http, api, body, headers = {}, method = 'POST', signal = false, blob = null){
    let requestOptions = {
        method: method,
        headers: {
          'content-type': 'application/json'
        },
        body: ''
    }
    requestOptions.headers = {...requestOptions.headers, ...headers}

    let obj = {}
    if(requestOptions.headers['content-type'] == 'application/json'){
        obj = JSON.stringify(body)
    }
    else if(!requestOptions.headers['content-type']){
        delete requestOptions.headers['content-type']
        obj = body
    }
    else{
        obj = body
    }
    requestOptions.body = obj

    if(signal){
        requestOptions = {
            ...requestOptions,
            signal
        }
    }

    requestOptions.credentials = "include"
    //console.log(requestOptions)
    //let request = new Request(http + api, requestOptions)

    if(blob === null){
        return fetch(http + api, requestOptions)
            .then(handleResponse)
    }
    else{
        return fetch(http + api, requestOptions)
            .then(handleResponseBlob)
    }
}

const get = function(http, api, body = {}, headers = {}, file = null, options = {}){
    let arKeys = Object.keys(body)
    let params = ''
    if(arKeys.length){
        params = '?'
        params += arKeys.map(i => i + '=' + body[i]).join('&')
    }
    let requestOptions = {
        method: 'GET',
    }
    arKeys = Object.keys(headers)
    if(arKeys.length){
        requestOptions.headers = {}
        arKeys.map(i => {
            requestOptions.headers[i] = headers[i]
        })
    }

    if(options.signal){
        requestOptions = {
            ...requestOptions,
            signal: options.signal
        }
    }
    requestOptions.credentials = "include"

    if(file){
        if(file == 'url'){
            return fetch(http + api + params, requestOptions)
                .then(handleResponseFile)
                .catch(er => er)
        }
        else{
            return fetch(http + api + params, requestOptions)
                .then(handleResponseBlob)
        }
    }
    else{
        return fetch(http + api + params, requestOptions)
            .then(handleResponse)
    }
}

const remove = function(http, api, body, headers = {}, method = 'DELETE', signal = false, blob = null){
    let requestOptions = {
        method: method,
        headers: {
          'content-type': 'application/json'
        },
        body: ''
    }
    requestOptions.headers = {...requestOptions.headers, ...headers}

    let obj = {}
    if(requestOptions.headers['content-type'] == 'application/json'){
        obj = JSON.stringify(body)
    }
    else if(!requestOptions.headers['content-type']){
        delete requestOptions.headers['content-type']
        obj = body
    }
    else{
        obj = body
    }
    requestOptions.body = obj

    if(signal){
        requestOptions = {
            ...requestOptions,
            signal
        }
    }

    requestOptions.credentials = "include"
    //console.log(requestOptions)
    //let request = new Request(http + api, requestOptions)

    if(blob === null){
        return fetch(http + api, requestOptions)
            .then(handleResponse)
    }
    else{
        return fetch(http + api, requestOptions)
            .then(handleResponseBlob)
    }
}

function handleResponse(response) {
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
function handleResponseFile(response){
    return response.blob().then(blob => {
        if(response.ok){
            let objectURL = ''

            try{
                objectURL = URL.createObjectURL(blob)
            }
            catch(e){
                objectURL = {code: 1000, error: 'error: No Image'}
            }
            return objectURL
        }
        if(!response.ok){
            if(response.status === 401){
                //logout();
                //location.reload(true)
            }
            const error = {
                message: (data && data.message) || response.statusText,
                status: response.status,
                data: data,
                ok: response.ok
            }
            //console.log('error', error)
            return Promise.reject(error)
        }
    })
}
function handleResponseBlob(response){
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

export const api = {
    'pretoken': '/api/v1/oauth2/auth/json',
    'token': '/api/v1/oauth2/token',
    'refresh': '/api/v1/oauth2/refresh',
    'logout__': '/api/v1/oauth2/logout',
    'logout': '/oauth2/sessions/logout',
    'logcheck': '/api/v1/auth/check',
    'restore': '/api/v1/restore',
    'password': '/api/v1/password',

    'open_projects': '/api/v3/projects/',

    'account_user': '/api/v1/store/user',
    'account_employee': '/api/v1/store/company/user/',
    'account_company': '/api/v1/store/company',
    'all_companies': '/api/v1/store/companies',
    'countries': '/api/v1/store/countries',
    'regions': '/api/v1/store/country',
    'invite': '/api/v1/store/company/invite',
    'invite_confirm': '/api/v1/store/company/invite/confirm',
    'invite_redirect': '/api/v1/oauth2/auth/json',
    'invited': '/api/v1/store/company/invites',
    'invited_user': '/api/v1/store/company/user',
    'history_limit': '/api/v1/cloud/company/history_limit', //cloud

    'projects': '/api/v1/cloud/',
    'project_size': '/api/v1/agg/',//cloud
    'socket_files': '/api/v1/files/socket/',

    'getfile': '/api/v1/files/',
    'upload': '/api/v1/files/upload',


    'getLoginChallenge': '/api/v1/signin/unitbim',

    'comments': '/api/v1/workflow/socket',
    'messages': '/api/v1/workflow/request/messages',

    'permission': '/api/v1/permission',
    'permify': '/api/v1/permify',

    'json_to_xlsx': '/api/v1/json_to/xlsx',
    'create_xml': '/api/v1/pkg/export',//'/api/v1/cloud/xml',
    'upload_xml': '/api/v1/pkg/import',
    'attr_error': '/api/v1/class/data/db',
    'class_error': '/api/v1/class/data/db/info',  //data/classify',//cloud

    'templates': '/api/v1/cloud/company/collision/templates',
    'template': '/api/v1/cloud/company/collision/template',

    'license': '/api/v1/license',

    'getjobs': '/unitbim/schedule/list',
    'setjob': '/unitbim/schedule/external/data/set',

    'infomodeltemplates': '/api/v1/templates',
    'projectproblems': '/api/v1/tasks',

    'spaces': '/api/v1/spaces',
    'getcollisions': '/api/v1/collisions/task',

    post: post,
    get: get,
    put: put,
    remove: remove,
}


/**** for console ****/
// fetch('https://cloud.ubdev.ru/api/v1/cloud/c/1/9a1c700f-8ec7-495a-b74c-a5912f68e4c6/tasks', {
//         headers: {
//           'content-type': 'application/json',
//           'authorization': 'Bearer l1htaTRHl74gu-FLiBlT6Krz3oDCIcJ4-QYHC5sTsiA.SM-TmG1z48mSl60F0C-J2ckFjLUWu7KaHciX5oPufH8'
//         }
// })
// .then((res) => {
//     return res.text().then(r => { return r})
// })
// .then(res => {
//   console.log(JSON.parse(res))
// })

//
// fetch('https://cloud.ubdev.ru/api/v1/cloud/c/1/2a15cc70-583c-40db-be57-3c442d00e7cf/attachment/file/8990e21e-9ade-4ac9-a839-426eff1abe2a/task', {
//         method: 'PUT',
//         headers: {
//           'content-type': 'application/json',
//           'authorization': 'Bearer wUCalLJSJmhv0BHC2W8CfUUdWT_el0HQmG2sxn7wTM4.TF6tvrMOOTpKk6hLSM3AEftyngX9f1CQV0qq82WJHWM'
//         },
//         body: JSON.stringify([
//   {
//     "elemsid": ['1'
//     ],
//     "name": "taskName 33333",
//     "status": 0,
//     "deadline": "2022-04-09T10:39:36.805982+03:00",
//     "start": "2022-04-06T10:39:36.805982+03:00",
//     "days": 3,
//     "group": "group 33333"
//   }])
// })
// .then((res) => {
//     return res.text().then(r => { return r})
// })
// .then(res => {
//   console.log(JSON.parse(res))
// })
