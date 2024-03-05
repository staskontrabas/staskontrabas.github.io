export const packetTypeIn = {
    '0x80': 'EMPTY',
    '0x8A': 'PING',
    '0x8B': 'PONG',
    '0x81': 'OK',
    '0x82': 'ERROR',
    '0x83': 'CHECK',
    '0x87': 'EVENT',

    '0x07': 'EVENT'
}
export const packetTypeOut = {
    'EMPTY': '0x00',
    'PING': '0x0A',
    'PONG': '0x0B',
    'OK': '0x01',
    'ERROR': '0x02',
    'LOGIN': '0x03',
    'EVENT': '0x07',
}

export const eventTypeIn = {
    '0x40000001': 'SUBSCRIBE',
    '0x80000001': 'SOMEONE_SUBSCRIBED',
    '0x40000002': 'UNSUBSCRIBE',
    '0x80000002': 'SOMEONE_UNSUBSCRIBED',
    '0x00000003': 'DISCONNECTED',
    '0x80000003': 'SOMEONE_DISCONNECTED',
    '0x40000004': 'MESSAGES',
    '0x80000004': 'MESSAGE_LIST',
    '0x40000005': 'MESSAGE',
    '0x80000005': 'SOMEONE_MESSAGED',
    '0x40000006': 'GET_SUBSCRIBE_LIST',
    '0x80000006': 'SUBSCRIBE_LIST',
    '0x4000000B': 'BORDERS',
    '0x8000000B': 'BORDER_LIST',
    '0x4000000A': 'BORDER',
    '0x8000000A': 'SOMEONE_BORDERED',
    '0x4000000C': 'MARKER',
    '0x8000000D': 'MARKER_LIST',
    '0x4000000D': 'MARKERS',
    '0x8000000C': 'SOMEONE_MARKERED'
}
export const eventTypeOut = {
    'SUBSCRIBE': '0x40000001',
    'SOMEONE_SUBSCRIBED': '0x80000001',
    'UNSUBSCRIBE': '0x40000002',
    'SOMEONE_UNSUBSCRIBED': '0x80000002',
    'DISCONNECTED': '0x00000003',
    'SOMEONE_DISCONNECTED': '0x80000003',
    'MESSAGES': '0x40000004',
    'MESSAGE_LIST': '0x80000004',
    'MESSAGE': '0x40000005',
    'SOMEONE_MESSAGED': '0x80000005',
    'GET_SUBSCRIBE_LIST': '0x40000006',
    'SUBSCRIBE_LIST': '0x80000006',
    'BORDERS': '0x4000000B',
    'BORDER_LIST': '0x8000000B',
    'BORDER': '0x4000000A',
    'SOMEONE_BORDERED': '0x8000000A',
    'MARKER': '0x4000000C',
    'MARKER_LIST': '0x8000000D',
    'MARKERS': '0x4000000D',
    'SOMEONE_MARKERED': '0x8000000C'
}

const toHEX = (num) => {
    if(typeof num !== 'number') return num
    if(num === 0) return '0x00'
    if(num > 15) return '0x' + num.toString(16).toUpperCase()
    return '0x0' + num.toString(16).toUpperCase()
}
const toDEC = (hex) => {
    if(!hex) return 0
    return parseInt(hex, 16)
}
const strToBlob = (type, event, str) => {
    let blob = new Blob([str2ab(type, event, str)])
    return blob
}

const str2ab = (type, event, str) => {
    let array = [0,0,0,0]//buffer = new Uint8Array(len)

    array[4] = type

    if(event){
        array[5] = event & 0xff
        array[6] = (event>>>8) & 0xff
        array[7] = (event>>>16) & 0xff
        array[8] = (event>>>24) & 0xff
    }

    let bodyArray = encodeUTF8(str)//stringToUint(str)
    let len = bodyArray.length + (event ? 4 : 0)
        array[0] = len & 0xff
        array[1] = (len>>>8) & 0xff
        array[2] = (len>>>16) & 0xff
        array[3] = (len>>>24) & 0xff
    // array[0] = bodyArray.length + (event ? 4 : 0)

    array = [...array, ...bodyArray]
    let buffer = new Uint8Array(array)

    let dx = 5 + (event ? 4 : 0)
    return buffer
}

const encodeUTF8 = (s) => {
	let i = 0, bytes = new Uint8Array(s.length * 4)
	for(let ci = 0; ci != s.length; ci++){
		let c = s.charCodeAt(ci)
		if(c < 128){
			bytes[i++] = c
			continue
		}
		if(c < 2048){
			bytes[i++] = c >> 6 | 192
		}
        else{
			if(c > 0xd7ff && c < 0xdc00){
				if(++ci >= s.length)
					throw new Error('UTF-8 encode: incomplete surrogate pair')
				let c2 = s.charCodeAt(ci)
				if(c2 < 0xdc00 || c2 > 0xdfff)
					throw new Error('UTF-8 encode: second surrogate character 0x' + c2.toString(16) + ' at index ' + ci + ' out of range')
				c = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff)
				bytes[i++] = c >> 18 | 240
				bytes[i++] = c >> 12 & 63 | 128
			}
            else bytes[i++] = c >> 12 | 224
			bytes[i++] = c >> 6 & 63 | 128
		}
		bytes[i++] = c & 63 | 128
	}
	return bytes.subarray(0, i)
}

const decodeUTF8 = (bytes) => {
	let i = 0, s = ''
	while(i < bytes.length){
		let c = bytes[i++]
		if(c > 127){
			if(c > 191 && c < 224){
				if(i >= bytes.length)
					throw new Error('UTF-8 decode: incomplete 2-byte sequence')
				c = (c & 31) << 6 | bytes[i++] & 63
			}
            else if (c > 223 && c < 240){
				if(i + 1 >= bytes.length)
					throw new Error('UTF-8 decode: incomplete 3-byte sequence')
				c = (c & 15) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63
			}
            else if(c > 239 && c < 248){
				if(i + 2 >= bytes.length)
					throw new Error('UTF-8 decode: incomplete 4-byte sequence')
				c = (c & 7) << 18 | (bytes[i++] & 63) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63
			}
            else throw new Error('UTF-8 decode: unknown multibyte start 0x' + c.toString(16) + ' at index ' + (i - 1))
		}
		if(c <= 0xffff) s += String.fromCharCode(c)
		else if (c <= 0x10ffff){
			c -= 0x10000
			s += String.fromCharCode(c >> 10 | 0xd800)
			s += String.fromCharCode(c & 0x3FF | 0xdc00)
		}
        else throw new Error('UTF-8 decode: code point 0x' + c.toString(16) + ' exceeds UTF-16 reach')
	}
	return s
}

const abToStr = (buffer, encoding) => {
    return decodeUTF8(buffer)
}

const blobToStr = (data) => {
    return new Response(data).arrayBuffer()
    .then(res => {
        let view = new Uint8Array(res)
        let packetType = packetIn(view[4])
        return {
            type: packetType,
            buffer: view.slice(5)
        }
    })
}

export const cout = async (packet, event = null, body = '') => {
    return await strToBlob(packetOut(packet), eventOut(event), body).arrayBuffer()
}
export const cin = (data, eventOut = false) => {
    return new Promise(resolve => {
        blobToStr(data)
        .then(res => {
            resolve(responseSwitch(res))
        })
    })
}

const eventOut = v => {
    let ar = null
    if(v){
        ar = toDEC(eventTypeOut[v])
    }
    return ar
}

const packetOut = v => {
    return toDEC(packetTypeOut[v])
}
const packetIn = v => {
    return packetTypeIn[toHEX(v)]
}
const eventIn = v => {
    let dec = 0
    v.map((i, j) => {
    	let dx = 8 * j
        dec = (i<<dx) | dec
    })
    let hex = toHEX(dec>>>0)
    return eventTypeIn[hex]
}

const getEvent = v => {
    let type = eventIn(v.slice(0, 4))
    let body = abToStr(v.slice(4), 'UTF-8')

    return {
        type: type,
        body: body
    }
}

const responseSwitch = (packetIn) => {
    let res = {
        packetType: packetIn.type,
        eventType: '',
        body: '',
        action: ''
    }
    switch(packetIn.type){
        case 'CHECK': {
            res.action = 'login'
            break
        }
        case 'OK': {
            res.action = 'ok'
            break
        }
        case 'PING': {
            res.action = 'pong'
            break
        }
        case 'ERROR': {
            let event = abToStr(packetIn.buffer, 'UTF-8')
            //res.eventType = event.type
            res.body = event
            res.action = 'errorq'
            break
        }
        case 'EVENT': {
            let event = getEvent(packetIn.buffer)
            res.eventType = event.type
            res.body = event.body
            res.action = event.type ? event.type.toLowerCase() : ''
            break
        }
    }

    return res
}
