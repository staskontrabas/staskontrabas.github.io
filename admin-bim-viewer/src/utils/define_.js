export const http__ = {
    local: 'http://localhost:8080',
    server: 'https://prodoc.unitbim.ru',
    login: 'https://login.unitbim.ru',
    account: 'https://account.unitbim.ru',
    project: 'https://prodoc.unitbim.ru',
    cloud: 'https://cloud.unitbim.ru',
    socket_project: 'wss://prodoc.unitbim.ru',
    socket_files: 'wss://cloud.unitbim.ru'
}
export const http = {
    local: 'http://localhost:8080',
    server: 'https://prodoc.ubdev.ru',
    login: 'https://login.ubdev.ru',
    account: 'https://account.ubdev.ru',
    cloud: 'https://cloud.ubdev.ru',
    socket_files: 'wss://cloud.ubdev.ru'
}

const post = function(http, api, body, headers = {}, method = 'POST'){
    const requestOptions = {
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

    return fetch(http + api, requestOptions)
        .then(handleResponse)
}

const get = function(http, api, body = {}, headers = {}, file = null){
    let arKeys = Object.keys(body)
    let params = ''
    if(arKeys.length){
        params = '?'
        params += arKeys.map(i => i + '=' + body[i]).join('&')
    }
    const requestOptions = {
        method: 'GET',
    }
    arKeys = Object.keys(headers)
    if(arKeys.length){
        requestOptions.headers = {}
        arKeys.map(i => {
            requestOptions.headers[i] = headers[i]
        })
    }
    if(file){
        if(file == 'url'){
            return fetch(http + api + params, requestOptions)
                .then(handleResponseFile)
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

function handleResponse(response) {
    return response.text().then(text => {
        let data = text// && JSON.parse(text)
        if(data){
            try{
                data = JSON.parse(text)
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
    'getfile': '/api/v1/files/t/',

    post: post,
    get: get
}
