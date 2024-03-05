import axios from 'axios'
import { http } from '@/utils/define'

export default class API {
    constructor(token) { //Singletone паттерн
        if (API.exists) { //Если инстантс уже есть, то возвращаем его
            return API.instance
        } else { //Если нет, то создаем
            API.instance = this
            API.exists = true
            this.client = axios.create()
            this.url = http.cloud
            this.token = token //Пока такой кастыль, токен нужно хранить глобально, например в localStorage
        }
    }
    async getFileDelta(file_id) {
        return await this.client.get(this.url + `/api/v1/files/${file_id}/delta.pdf`, {
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/pdf',
                    'Authorization': 'Bearer ' + this.token
                }
            }
        )
    }
    async getFileJSON(file_id) {
        return await this.client.get(this.url + `/api/v1/files/${file_id}/resource.json`, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Authorization': 'Bearer ' + this.token
                }
            }
        )
    }
}
