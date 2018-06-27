(function(window, document){
    
    var WCall = function(){
        this.app = null;
        var _this = this,
            _settings = {
                widgetId: 160,
                _idleSecondsCounter: 0,
                idleInterval: null,
                k50PlannedDate: 0,
                k50PlannedTime: '10:00:00',
                plannedTime: false,
                plannedToday: true,		
                schedule:{
                    0:{off:false,from:{h:9,m:0},to:{h:21,m:0}},
                    1:{off:false,from:{h:9,m:0},to:{h:21,m:0}},
                    2:{off:false,from:{h:9,m:0},to:{h:21,m:0}},
                    3:{off:false,from:{h:9,m:0},to:{h:21,m:0}},
                    4:{off:false,from:{h:9,m:0},to:{h:23,m:50}},
                    5:{off:false,from:{h:9,m:0},to:{h:21,m:0}},
                    6:{off:false,from:{h:9,m:0},to:{h:21,m:0}},
                    holiday:{},
                    shortday:{},
                    timeZoneType:'constant',
                    timeZoneOffset:3
                },
                timer:false,
                style:'https://k50-a.akamaihd.net/k50/widget/13879815596758/callbackWidget.css',
                idleTimout:30,
                widgetTitle:'Оставьте свой номер и мы перезвоним вам',
                widgetText:'Предложение доступно только для юридических лиц и предпринимателей',
                widgetLabel:'Телефон',
                widgetSuccessTitle:'Ваша заявка принята!',
                widgetSuccessText:'Мы скоро свяжемся с вами',
                policyUrl:'https://k50.ru/personal.pdf',
                buttonText:'Закажите звонок',
                buttonWidth: 120,
                buttonHeight: 120
            },
            logContentHeight = 348,
            sendWrapHeight = 30,
            WSch = false,
            Session = false,
            store = {},
            _state = {
                Msg: {
                    status: false,
                    value: ''
                },
                ChatHistory: [],
                ChatStack: {
                    messages: []
                },
                ChatHistoryBack: []
            },
            addListener = function(e, o, p, f){
                if(o.hasOwnProperty('observers')){
                    if(o['observers'].hasOwnProperty(p)){
                        o['observers'][p].push({e: e, f: f});
                    }
                    else{
                        o['observers'][p] = [{e: e, f: f}];
                    }
                }
                else{
                    o['observers'] = {};
                    o['observers'][p] = [{e: e, f: f}];
                }
            },
            removeListener = function(e, o, p){
                if(o.hasOwnProperty('observers')){
                    var ar = Object.keys(o.observers);
                    for(var iar = 0, lar = ar.length; iar < lar; iar++){
                        if(ar[iar] == p){
                            for(var ip = 0; ip < o.observers[ar[iar]].length; ip++){
                                if(o.observers[ar[iar]][ip].e == e){
                                    o.observers[ar[iar]].splice(ip, 1);
                                }
                                
                            }
                        }
                    }
                }
            },
            setState = function(o, value, stopPropagation){
                var stopPropagation = stopPropagation || false;
                inject(o, value);
                if(stopPropagation) {return true;}
                
                if(o.hasOwnProperty('observers')){
                    var arO = Object.keys(o.observers);
                    if(arO.length){
                        map(o.observers, function(item, index){
                            map(value, function(itemV, indexV){
                                if(index == indexV){
                                    for(var ii = 0; ii < item.length; ii++){
                                        item[ii].f(itemV);
                                    }
                                }
                            });
                        });
                    }
                }
            },
            getState = function(property){
                var propperty = property || 0,
                    state = {};
                
                if(!property) return _state;
                
                for(var ip in _state){
                    if(ip == propperty){
                        state = _state[property];
                        break;
                    }
                }
                return state;
            },
            postRequest = function(type, url, data, callback) {
                var xmlhttp;
                if (window.XMLHttpRequest) {
                    xmlhttp = new XMLHttpRequest();
                } else {
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                }
                xmlhttp.onreadystatechange = function() {
                    if(xmlhttp.readyState == 4){
                        if(xmlhttp.status == 200){
                            data = JSON.parse(xmlhttp.responseText);
                            console.log(data);
                            //console.log('callback', webSocket);
                            callback(data);
                            //return data;
                        }
                        else if(xmlhttp.status == 400){
                            console.log('error 400 for POST');
                            //return false;
                        }
                        else{
                            console.log('status is ' + xmlhttp.status);
                            //return xmlhttp.status;
                        }
                    }
                }
                xmlhttp.open("POST", url, true);
                xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                //data = 'sessionId=chat/1169056832/hl02vlp4b6dq1ttoht2leb2673';//JSON.stringify(data);
                data = 'sessionId=' + data.sessionId;
                console.log('send', data);
                xmlhttp.send(data);
            },
            isMobile = function(){
                return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|playbook|silk/i.test(navigator.userAgent || navigator.vendor || window.opera) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent || navigator.vendor || window.opera).substr(0, 4)))
            },
            service = {
                addClass: function(name){
                    var arClass = this.className.split(' '),
                        newClass = [];
                    for(var i = 0; i < arClass.length; i++){
                        if(arClass[i] != name){
                            newClass.push(arClass[i]);
                        }
                        else{
                            newClass = arClass;
                            break;
                        }
                        if(arClass.length - 1 == i){
                            newClass.push(name);
                        }
                    }
                    this.className = newClass.join(' ');
                },
                removeClass: function(name){
                    var arClass = this.className.split(' '),
                        newClass = [];
                    for(var i = 0; i < arClass.length; i++){
                        if(arClass[i] != name){
                            newClass.push(arClass[i]);
                        }
                    }
                    this.className = newClass.join(' ');
                },
                hasClass: function(name){
                    var arClass = this.className.split(' '),
                        has = false;
                    for(var i = 0; i < arClass.length; i++){
                        if(arClass[i] == name){
                            has = true;
                            break;
                        }
                    }
                    return has;
                },
                hide: function(el){
                    this.addClass('k50_hidden');
                },
                show: function(el){
                    this.removeClass('k50_hidden');
                },
                getScrollBarWidth: function(){
                    var div = document.createElement('div');

                    div.style.overflowY = 'scroll';
                    div.style.width = '50px';
                    div.style.height = '50px';
                    div.style.visibility = 'hidden';

                    document.body.appendChild(div);
                    var scrollWidth = 17;
                    setTimeout(function(){
                        scrollWidth = div.offsetWidth - div.clientWidth;
                        document.body.removeChild(div);
                    }, 100);
                    
                    return scrollWidth;
                },
                removeElement: function(){
                    this.parentNode.removeChild(this);
                }
            },
            createElem = function(parent, o){
                var props = {
                        tag: 'div'
                    };
                inject(props, o);
                
                var elem = document.createElement(props.tag),
                    parent = parent || null;
                
                if(props.hasOwnProperty('className')){
                    elem.className = props.className.join(' ');
                }
                if(props.hasOwnProperty('text')){
                    elem.innerHTML = props.text;
                }
                if(props.hasOwnProperty('attribute')){
                    var arKeys = Object.keys(props.attribute);
                    for(var iattr = 0; iattr < arKeys.length; iattr++){
                        elem.setAttribute(arKeys[iattr], props.attribute[arKeys[iattr]]);
                    }
                }
                    
                if(parent){
                    parent.appendChild(elem);
                }
                
                for(var iservice in service){
                    elem[iservice] = service[iservice];
                }
                
                if(props.hasOwnProperty('content')){
                    props.content(elem);
                }
                
                if(props.hasOwnProperty('didMount')){
                    props.didMount(elem);
                }
                return elem;
            },
            inc = 0,
            oTree = {},
            componentParent = false,
            render = function(o){
                var ddd = document.createElement('div');
              ddd.innerHTML = '<div style="width:100%; height:30px;background-color:#ccc;color:#000;">test ddd</div>';
              document.body.appendChild(ddd);
                var o = o || {};
                if(o.hasOwnProperty('remove')){
                    if(o.remove){
                        if(this.hasOwnProperty('willUnmount')){
                            this.willUnmount();
                        }
                        this.node.removeElement();
                        delete this.node;
                        return true;
                    }
                }
                var clone, replace = false;
                
                if(this.hasOwnProperty('clone')){
                    clone = this;
                    replace = true;
                }
                else{
                    clone = {
                        clone: 'clone',
                        index: 'element-' + inc
                    };
                    clone = Object.assign({}, clone, this);
                }
                
                clone = inject(clone, o);
                
                if(o.hasOwnProperty('update')){
                    if(o.update){
                        var elem = document.createElement(clone.tag),
                            parent = (typeof clone.parent) == 'string' ? false : clone.parent;
                            
                        if(clone.className){
                            elem.className = clone.className.join(' ');
                        }
                        
                        if(clone.hasOwnProperty('text')){
                            if(clone.text){
                                elem.innerHTML = clone.text;
                            }
                        }
                        clone.node.parentNode.replaceChild(elem, clone.node);
                        clone.content && clone.content(elem);
                        clone.node = elem;
                        return elem;
                    }
                }
                
                var deepClone = function(target, o){
                    var arO = Object.keys(o);
                    for(var i = 0; i < arO.length; i++){
                        if(o[arO[i]] != null && o[arO[i]].toString() == '[object Object]'){
                            target[arO[i]] = {};
                            deepClone(target[arO[i]], o[arO[i]]);
                        }
                        else{
                            target[arO[i]] = o[arO[i]];
                        }
                    }
                }
                
                if(!replace && this.hasOwnProperty('state')){
                    clone.state = {};
                    deepClone(clone.state, this.state);
                }
                
                if(this.hasOwnProperty('store')){
                    var storeKeys = Object.keys(this.store);
                    for(var i = 0; i < storeKeys.length; i++){
                        if(store.hasOwnProperty(storeKeys[i])){
                            continue;
                        }
                        else{
                            store[storeKeys[i]] = {};
                            deepClone(store[storeKeys[i]], this.store[storeKeys[i]]);
                        }
                    }
                }
                
                if(!replace && clone.hasOwnProperty('connect')){
                    for(var i = 0; i < clone.connect.length; i++){
                        clone[clone.connect[i]] = store[clone.connect[i]];
                    }
                }
                
                if(!replace && clone.hasOwnProperty('willMount')){
                    clone.willMount();
                }
                
                var elem = document.createElement(clone.tag),
                    parent = (typeof clone.parent) == 'string' ? false : clone.parent;
                    
                if(clone.className){
                    elem.className = clone.className.join(' ');
                }
                
                if(clone.hasOwnProperty('text')){
                    if(clone.text){
                        elem.innerHTML = clone.text;
                    }
                }
                
                if(clone.hasOwnProperty('attribute')){
                    var arKeys = Object.keys(clone.attribute);
                    for(var iattr = 0; iattr < arKeys.length; iattr++){
                        if(typeof clone.attribute[arKeys[iattr]] == 'function'){
                            elem.setAttribute(arKeys[iattr], clone.attribute[arKeys[iattr]](clone));
                        }
                        else{
                            elem.setAttribute(arKeys[iattr], clone.attribute[arKeys[iattr]]);
                        }
                    }
                }
                
                if(replace){
                    if(clone.hasOwnProperty('willUnmount')){
                        clone.willUnmount();
                    }
                    parent && parent.replaceChild(elem, clone.node);
                }
                else{
                    parent && parent.appendChild(elem);
                }
                clone.node = elem;
                
                if(clone.hasOwnProperty('action')){
                    if(typeof clone.action == 'function'){
                        clone.action = clone.action();
                    }
                    if(clone.action && clone.action.length){
                        for(var iaction = 0; iaction < clone.action.length; iaction++){
                            var handler = typeof clone.action[iaction].name == 'function' ? clone.action[iaction].name : _this.action(clone.action[iaction].name),
                                name = clone.name,
                                args = clone.state;
                            if (window.addEventListener) {
                                elem.addEventListener(clone.action[iaction].type, handler.bind(clone, args), false);
                            }
                            else if(window.attachEvent){
                                elem.attachEvent('on' + clone.action[iaction].type, handler.bind(clone, args), handler);
                            }
                        }
                    }
                }
                
                for(var iservice in service){
                    elem[iservice] = service[iservice];
                }
                
                clone.content && clone.content(elem);
                
                if(clone.hasOwnProperty('didMount')){
                    clone.didMount(elem);
                }
                
                var callback = clone.callback || 0;
                callback && callback(clone);
                
                
                if(clone.hasOwnProperty('children')){
                    
                }
                
                inc++;
                
                return elem;
            };
            
/*
 * Polyfill part
 *
 */
        var inject = function(clone, o){
            if((typeof o) != 'object') return clone;
            var arKeys = Object.keys(o);
            
            for(var i = 0; i < arKeys.length; i++){
                if(o[arKeys[i]] instanceof Array){
                    if(!clone.hasOwnProperty(arKeys[i])){
                        clone[arKeys[i]] = o[arKeys[i]];
                    }
                    else if(clone[arKeys[i]] instanceof Array){
                        var ar = [];
                        
                        for(var ip = 0; ip < clone[arKeys[i]].length; ip++){
                            ar.push(clone[arKeys[i]][ip]);
                        }
                        for(var ip = 0; ip < o[arKeys[i]].length; ip++){
                            ar.push(o[arKeys[i]][ip]);
                        }
                        clone[arKeys[i]] = ar;
                    }
                }
                else if(o[arKeys[i]] != null && o[arKeys[i]].toString() == '[object Object]'){
                    if(arKeys[i] == 'state' || arKeys[i] == 'store'){
                        continue;
                    }
                    if(!clone.hasOwnProperty(arKeys[i]) && arKeys[i] != 'state'){
                        clone[arKeys[i]] = {};
                        clone[arKeys[i]] = o[arKeys[i]];
                    }
                    else if(clone.hasOwnProperty(arKeys[i]) && !Object.keys(clone[arKeys[i]]).length && arKeys[i] != 'state'){
                        clone[arKeys[i]] = o[arKeys[i]];
                    }
                    else if(clone.hasOwnProperty(arKeys[i]) && Object.keys(clone[arKeys[i]]).length && arKeys[i] != 'state'){
                        clone[arKeys[i]] = Object.assign({}, clone[arKeys[i]], o[arKeys[i]]);
                    }
                    /*
                    else if(arKeys[i] == 'state'){
                        clone[arKeys[i]] = o[arKeys[i]];
                    }
                    */
                }
                else{
                    clone[arKeys[i]] = o[arKeys[i]];
                }
            }
            return clone;
        };
        
        var map = function(o, f){
            var arKeys = Object.keys(o);
            for(var i = 0; i < arKeys.length; i++){
                f(o[arKeys[i]], arKeys[i]);
            }
        };
        
        if ([].indexOf) {
            var findInArray = function(array, value) {
                return array.indexOf(value);
            }
        }
        else{
            var findInArray = function(array, value) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i] === value) return i;
                }
                return -1;
            }
        }
  
        if (!Object.assign) {
            Object.defineProperty(Object, 'assign', {
                enumerable: false,
                configurable: true,
                writable: true,
                value: function(target, firstSource) {
                    'use strict';
                    if (target === undefined || target === null) {
                        throw new TypeError('Cannot convert first argument to object');
                    }

                    var to = Object(target);
                    for (var i = 1; i < arguments.length; i++) {
                        var nextSource = arguments[i];
                        if (nextSource === undefined || nextSource === null) {
                            continue;
                        }

                        var keysArray = Object.keys(Object(nextSource));
                        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                            var nextKey = keysArray[nextIndex];
                            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                            if (desc !== undefined && desc.enumerable) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                    return to;
                }
            });
        }
        
        if (!Array.prototype.map){
          Array.prototype.map = function(callback, thisArg) {
            var T, A, k;

            if (this == null) {
              throw new TypeError(' this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            
            if (typeof callback !== 'function') {
              throw new TypeError(callback + ' is not a function');
            }
            
            if (arguments.length > 1) {
              T = thisArg;
            }
            
            A = new Array(len);
            k = 0;
            
            while (k < len) {
              var kValue, mappedValue;
              if (k in O) {
                kValue = O[k];
                mappedValue = callback.call(T, kValue, k, O);
                A[k] = mappedValue;
              }
              k++;
            }
            return A;
          };
        }
         
/*
 * Components part
 *
 */
        var Component = {
            Widget: {
                tag: 'div',
                className: ['k50_widget'],
                name: 'Widget',
                parent: document.body,
                state: {
                    active: {
                        status: false
                    }
                },
                store: {
                    username: {
                        value: ''
                    },
                    usermessage: {
                        value: ''
                    },
                    email: {
                        value: ''
                    },
                    phone: {
                        value: ''
                    },
                    time: {
                        day: {value: 0},
                        hour: {value: 0},
                        minute: {value: 0}
                    },
                    timer: {
                        value: false,
                        start: 0,
                        status: false
                    },
                    chathistory: {
                        messages: []
                    },
                    tab: {
                        titletab: '',
                        componenttab: ''
                    },
                    tabs: {
                        Chat: {
                            elem: null,
                            status: false,
                            title: 'Вопрос менеджеру',
                            svg: '<svg width="48" height="48" viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g transform="translate(-528 -48)"> <use xlink:href="#path0_fill1" transform="translate(540 62)" fill="#333333"/> </g> <defs> <path id="path0_fill1" fill-rule="evenodd" d="M 0 2C 0 0.895508 0.895508 0 2 0L 16 0C 17.1045 0 18 0.895508 18 2L 18 12C 18 13.1045 17.1045 14 16 14L 4 14L 0 16L 0 12L 0 2ZM 3 12L 8 12L 15 12C 15.5522 12 16 11.5522 16 11L 16 3C 16 2.44775 15.5522 2 15 2L 3 2C 2.44775 2 2 2.44775 2 3L 2 11C 2 11.5522 2.44775 12 3 12ZM 7 15.8293L 7 18C 7 19.1045 7.89551 20 9 20L 21 20L 25 22L 25 18L 25 8C 25 6.89551 24.1045 6 23 6L 19.8293 6C 19.9399 6.31274 20 6.64941 20 7L 20 8L 22 8C 22.5522 8 23 8.44775 23 9L 23 17C 23 17.5522 22.5522 18 22 18L 17 18L 10 18C 9.44775 18 9 17.5522 9 17L 9 16L 8 16C 7.64941 16 7.31274 15.9399 7 15.8293ZM 4 6L 6 6L 6 8L 4 8L 4 6ZM 8 6L 10 6L 10 8L 8 8L 8 6ZM 14 6L 12 6L 12 8L 14 8L 14 6ZM 19 14L 19 12L 21 12L 21 14L 19 14Z"/> </defs> </svg>'
                        },
                        CallBack: {
                            elem: null,
                            status: true,
                            title: 'Заказать звонок',
                            svg: '<svg width="48" height="48" viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g transform="translate(-576 -48)"> <use xlink:href="#path0_fill2" transform="translate(592 59)" fill="#333333"/> </g> <defs> <path id="path0_fill2" fill-rule="evenodd" d="M 13 14C 16.866 14 20 10.866 20 7C 20 3.13403 16.866 0 13 0C 9.13403 0 6 3.13403 6 7C 6 10.866 9.13403 14 13 14ZM 13 12C 15.7615 12 18 9.76141 18 7C 18 4.23859 15.7615 2 13 2C 10.2385 2 8 4.23859 8 7C 8 9.76141 10.2385 12 13 12ZM 14 4C 14 4.55231 13.5522 5 13 5C 12.4478 5 12 4.55231 12 4C 12 3.44769 12.4478 3 13 3C 13.5522 3 14 3.44769 14 4ZM 10 8C 10.5522 8 11 7.55231 11 7C 11 6.44769 10.5522 6 10 6C 9.44775 6 9 6.44769 9 7C 9 7.55231 9.44775 8 10 8ZM 16 8C 16.5522 8 17 7.55231 17 7C 17 6.44769 16.5522 6 16 6C 15.4478 6 15 6.44769 15 7C 15 7.55231 15.4478 8 16 8ZM 13 11C 13.5522 11 14 10.5523 14 10C 14 9.44769 13.5522 9 13 9C 12.4478 9 12 9.44769 12 10C 12 10.5523 12.4478 11 13 11ZM 5.51562 2L 2 2C 0.895508 2 0 2.89545 0 4L 0 22C 0 23.1046 0.895508 24 2 24L 14 24C 15.1046 24 16 23.1046 16 22L 16 15.4879C 15.3632 15.713 14.6935 15.8684 14 15.9451L 14 21C 14 21.5523 13.5522 22 13 22L 3 22C 2.44775 22 2 21.5523 2 21L 2 5C 2 4.44769 2.44775 4 3 4L 4.51221 4C 4.76392 3.28796 5.10254 2.617 5.51562 2ZM 10 18C 10 19.1046 9.10461 20 8 20C 6.89551 20 6 19.1046 6 18C 6 16.8954 6.89551 16 8 16C 9.10461 16 10 16.8954 10 18Z"/> </defs> </svg>'
                        },
                        FeedBack: {
                            elem: null,
                            status: false,
                            title: 'Оставить заявку',
                            svg: '<svg width="48" height="48" viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g transform="translate(-624 -48)"> <use xlink:href="#path0_fill3" transform="translate(636 63)" fill="#333333"/> </g> <defs> <path id="path0_fill3" fill-rule="evenodd" d="M 0 2C 0 0.895447 0.895386 0 2 0L 22 0C 23.1046 0 24 0.895447 24 2L 24 16C 24 17.1046 23.1046 18 22 18L 2 18C 0.895386 18 0 17.1046 0 16L 0 2ZM 2 3C 2 2.44769 2.44775 2 3 2L 21 2C 21.5522 2 22 2.44769 22 3L 22 15C 22 15.5523 21.5522 16 21 16L 3 16C 2.44775 16 2 15.5523 2 15L 2 3ZM 3.70715 3.79285C 3.31653 4.18335 3.31653 4.81653 3.70715 5.20703L 8.79285 10.2928C 8.89673 10.3967 9.01758 10.4729 9.14661 10.5215C 9.32239 10.8085 9.63879 11 10 11L 14 11C 14.3612 11 14.6776 10.8085 14.8534 10.5215C 14.9354 10.4906 15.0142 10.4486 15.0873 10.3954C 15.1292 10.3649 15.1693 10.3307 15.2072 10.2928L 20.2928 5.20703C 20.6835 4.81653 20.6835 4.18335 20.2928 3.79285L 20.2072 3.70703C 19.8167 3.31653 19.1835 3.31653 18.7928 3.70703L 13.7072 8.79285C 13.6438 8.8562 13.5907 8.9259 13.5479 9L 10.4521 9C 10.4348 8.97009 10.4159 8.94104 10.3953 8.91272C 10.3649 8.87073 10.3307 8.83069 10.2928 8.79285L 5.20715 3.70703C 4.81653 3.31653 4.18347 3.31653 3.79285 3.70703L 3.70715 3.79285ZM 4.29285 13.7928C 4.68347 14.1833 5.31653 14.1833 5.70715 13.7928L 7.29285 12.207C 7.68347 11.8165 7.68347 11.1833 7.29285 10.7928L 7.20715 10.707C 6.81653 10.3165 6.18347 10.3165 5.79285 10.707L 4.20715 12.2928C 3.81653 12.6833 3.81653 13.3165 4.20715 13.707L 4.29285 13.7928ZM 16.7072 12.207C 16.3165 11.8165 16.3165 11.1833 16.7072 10.7928L 16.7928 10.707C 17.1835 10.3165 17.8165 10.3165 18.2072 10.707L 19.7928 12.2928C 20.1835 12.6833 20.1835 13.3165 19.7928 13.707L 19.7072 13.7928C 19.3165 14.1833 18.6835 14.1833 18.2928 13.7928L 16.7072 12.207Z"/> </defs> </svg>'
                        }
                    },
                    widgetdrag: {
                        elem: null,
                        x: 0,
                        y: 0,
                        start: false,
                        ready: false,
                        winW: 0,
                        winH: 0,
                        coord: {
                            x: 0,
                            y: 0
                        }
                    }
                },
                connect: ['tab'],
                content: function(parent){
                    isMobile() && this.node.addClass('k50_mobile');
                    Component.BTN.render({parent: parent, props: {state: this.state}});
                    Component.WidgetWrap.render({parent: parent, props: {state: this.state}});
                },
                didMount: function(e){
//                        !WSch && _this.action('socketConnect')();
                    var component = this;
                    document.addEventListener('click', function(event){
                        var event = event || window.event;
                        if(!(event.target == component.node || component.node.contains(event.target))){
                            setState(component.state.active, {status: false});
                            setState(component.tab, {titletab: '', componenttab: 'WidgetPanel'});
                        }
                    });
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            BTN: {
                tag: 'div',
                className: ['k50_button'],
                name: 'BTN',
                state: {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    start: false,
                    ready: false,
                    winW: 0,
                    winH: 0,
                    coord_btn: {
                        x: 0,
                        y: 0
                    }
                },
                parent: null,
                props: {w: isMobile() ? '90px' : '120px', h: isMobile() ? '90px' : '120px', colorfone: "#f0f0f0", coloricon: "#333333"},
                setSVG: function(){
                    return '<svg width="60" height="60" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <title>Panels</title> <desc>Created using Figma</desc> <g id="Canvas" transform="translate(1758 -2268)"> <g id="Ellipse"> <use xlink:href="#path0_fill" transform="translate(-1758 2268)" fill="'+this.props.colorfone+'"/> </g> <g id="Union"> <use xlink:href="#path1_fill" transform="translate(-1738 2290)" fill="'+this.props.coloricon+'"/> </g> </g> <defs> <path id="path0_fill" d="M 60 30C 60 46.5685 46.5685 60 30 60C 13.4315 60 0 46.5685 0 30C 0 13.4315 13.4315 0 30 0C 46.5685 0 60 13.4315 60 30Z"/> <path id="path1_fill" fill-rule="evenodd" d="M 2 0C 0.895386 0 0 0.895432 0 2L 0 14L 0 18L 3.5 16L 18 16C 19.1046 16 20 15.1046 20 14L 20 2C 20 0.895432 19.1046 0 18 0L 2 0ZM 7 14L 3 14C 2.44775 14 2 13.5523 2 13L 2 3C 2 2.44772 2.44775 2 3 2L 17 2C 17.5522 2 18 2.44772 18 3L 18 13C 18 13.5523 17.5522 14 17 14L 7 14ZM 16 4L 4 4L 4 6L 16 6L 16 4ZM 14 7L 4 7L 4 9L 14 9L 14 7ZM 4 10L 11 10L 11 12L 4 12L 4 10Z"/> </defs> </svg>';
                },
                willMount: function(){
                    var winW = window.innerWidth
                    || document.documentElement.clientWidth
                    || document.body.clientWidth;

                    var winH = window.innerHeight
                    || document.documentElement.clientHeight
                    || document.body.clientHeight;
                    this.state.winW = winW;
                    this.state.winH = winH;
                },
                content: function(parent){
                    var coordBtn, coordBtnJSON = localStorage.getItem('coord_btn');
                    var box = this.node.getBoundingClientRect();
                    this.state.width = box.width;
                    this.state.height = box.height;
                    
                    if(coordBtnJSON){
                        coordBtn = JSON.parse(coordBtnJSON);
                        this.node.style.left = parseInt(coordBtn.left) + this.state.width > this.state.winW ? -(this.state.width + 10) + 'px' : coordBtn.left;
                        this.node.style.top = parseInt(coordBtn.top) + this.state.height > this.state.winH ? (this.state.winH - this.state.height - 10) + 'px' : coordBtn.top;
                    }
                    
                    for(var i = 0; i < 2; i++){
                        createElem(parent, {
                            tag: 'span',
                            className: ['k50_button_ripple']
                        });
                    }
                    createElem(parent, {
                        tag: 'span',
                        className: ['k50_button_circle'],
                        text: this.setSVG()
                    });
                    Component.TimerIcon.render({parent: parent, props: {state: this.props.state}});
                },
                action: [{
                    type: 'mousedown',
                    name: function(state, e){
                        var e = e || window.event;
                        if(e.which != 1){
                            return;
                        }
                        this.state.x = e.pageX;
                        this.state.y = e.pageY;
                        this.state.ready = true;
                    }
                },{
                    type: 'mouseup',
                    name: function(state, e){
                        var e = e || window.event;
                        this.state.ready = false;
                        if(e.which != 1){
                            return;
                        }
                        
                        if(this.state.start){
                            this.state.start = false;
                            this.saveLocalStorage();
                        }
                        else{
                            setState(this.props.state.active, {status: true});
                        }
                    }
                }],
                getCoords: function(e){
                    var box = e.getBoundingClientRect();
                    return {
                        top: box.top,
                        left: box.left
                    };
                },
                saveLocalStorage: function(){
                    var coord_btn = {
                        top: this.node.style.top,
                        left: this.node.style.left
                    };
                    this.state.coord_btn.y = coord_btn.top;
                    this.state.coord_btn.x = coord_btn.left;
                    coord_btn = JSON.stringify(coord_btn);
                    localStorage.setItem('coord_btn', coord_btn);
                },
                didMount: function(e){
                    addListener(e, this.props.state.active, 'status', function(status){
                        status ? e.addClass('k50_hidden') : e.removeClass('k50_hidden');
                    });
                    //var winW = this.state.winW;
                    //var winH = this.state.winH;
                    
                    window.addEventListener('mousemove', function(e){
                        var e = e || window.event;
                        if(!this.state.ready) return;
                        if(!this.state.start){
                            var moveX = e.pageX - this.state.x;
                            var moveY = e.pageY - this.state.y;
                            if ( Math.abs(moveX) < 3 && Math.abs(moveY) < 3 ) {
                              return;
                            }
                            this.state.start = true;

                            var coords = this.getCoords(this.node);
                            this.state.shiftX = this.state.x - coords.left;
                            this.state.shiftY = this.state.y - coords.top;
                        }
                        if(e.pageX - this.state.shiftX - 10 <= 0){
                            this.node.style.left = -this.state.winW + 10 + 'px';
                        }
                        else if(e.pageX - this.state.shiftX + 10 + this.state.width > this.state.winW){
                            this.node.style.left = -this.state.width - 10 + 'px';
                        }
                        else{
                            this.node.style.left = -(this.state.winW - e.pageX) - this.state.shiftX + 'px';
                        }
                        
                        if(e.pageY - this.state.shiftY - 10 <= 0){
                            this.node.style.top = '10px';
                        }
                        else if(e.pageY - this.state.shiftY + 10 + this.state.height > this.state.winH){
                            this.node.style.top = this.state.winH - this.state.height - 10 + 'px';
                        }
                        else{
                            this.node.style.top = e.pageY - this.state.shiftY + 'px';
                        }
                        return false;
                    }.bind(this), false);
                    
                    document.addEventListener('mouseleave', function(e){
                        var e = e || window.event;
                        if(!this.state.ready) return;
                        else{
                            this.state.ready = false;
                            this.state.start = false;
                            this.saveLocalStorage();
                        }
                    }.bind(this), false);
                    
                    window.addEventListener('resize', function(){
                        var coordBtn = this.state.coord_btn;//localStorage.getItem('coord_btn');
                        var box = this.node.getBoundingClientRect();
                        var winW = window.innerWidth
                        || document.documentElement.clientWidth
                        || document.body.clientWidth;

                        var winH = window.innerHeight
                        || document.documentElement.clientHeight
                        || document.body.clientHeight;
                        this.state.winW = winW;
                        this.state.winH = winH;
                        
                        if(coordBtn.x){
                            this.node.style.left = parseInt(coordBtn.x) + box.width > winW ? -(box.width + 10) + 'px' : coordBtn.x;
                            this.node.style.top = parseInt(coordBtn.y) + box.height > winH ? (winH - box.height - 10) + 'px' : coordBtn.y;
                        }
                    }.bind(this), false);
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            TimerIcon: {
                tag: 'div',
                className: ['k50_timer_icon'],
                connect: ['timer', 'tab'],
                state: {
                    time: {
                        value: 0
                    },
                    angle: {
                        value: 0
                    },
                    radius: 28
                },
                action: [{
                    type: 'click',
                    name: function(state, event){
                        setState(this.tab, {componenttab: 'CallBack', titletab: 'Заказать звонок'});
                    }
                }],
                content: function(parent){
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_timer_icon_border'],
                        didMount: function(e){
                            e.innerHTML = '<svg width="56" height="56" viewBox="0 0 56 56" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path id="k50_timer_icon_border" d="M 28, 28 m -28, 0 a 28,28 0 1,0 56,0 a 28,28 0 1,0 -56,0" fill="#0088E0"/></g></svg>';
                            var r = this.state.radius;
                            
                            addListener(e, this.state.angle, 'value', function(v){
                                var d = 'M ' + r + ', ' + r + ' m -' + r + ', 0 a ' + r + ',' + r + ' 0 1,0 ' + r * 2+ ',0 a ' + r + ',' + r + ' 0 1,0 -' + r * 2 + ',0';
                                var rad = (v - 90) * Math.PI / 180;
                                if(v != 360 && v){
                                    var arc = 0;
                                    if(v <= 180){
                                        arc = 1;
                                    }
                                    var x = r + r * Math.cos(rad), y = r + r * Math.sin(rad);
                                    d = 'M' + r + ' 0 A ' + r + ' ' + r + ', 0, ' + arc + ', 0, ' + x + ' ' + y + ' L ' + r + ' ' + r + ' Z';
                                }
                                var path = document.querySelector('#k50_timer_icon_border');
                                path.setAttribute('d', d);
                            }.bind(this));
                        }.bind(this)
                    });
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_timer_icon_back'],
                        didMount: function(e){
                            e.innerHTML = '<svg width="50" height="50" viewBox="0 0 50 50" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><circle cx="25" cy="25" r="25" fill="#F0F0F0"/></g></svg>';
                        }
                    });
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_timer_icon_value'],
                        text: '00:00',
                        didMount: function(e){
                            addListener(e, this.state.time, 'value', function(v){
                                e.innerHTML = v;
                            }.bind(this));
                        }.bind(this)
                    });
                },
                didMount: function(e){
                    addListener(e, this.timer, 'value', function(v){
                        //var d = Math.floor(v / (1000 * 60 * 60 * 24));
                        var h = Math.floor((v % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        var m = Math.floor((v % (1000 * 60 * 60)) / (1000 * 60));
                        var s = Math.floor((v % (1000 * 60)) / 1000);
                        
                        h = h ? h < 10 ? '0' + h : h : 0;
                        m = m < 10 ? '0' + m : m;
                        s = s < 10 ? '0' + s : s;
                        var angle = 360 - v / this.timer.start * 360;
                        setState(this.state.angle, {value: angle});
                        if(v > 0){
                            setState(this.state.time, {value: (h ? h + ':' : '') + m + ':' + s});
                            !this.props.state.active.status && e.addClass('active');
                        }
                        else{
                            setState(this.state.time, {value: '00:00'});
                            e.removeClass('active');
                        }
                    }.bind(this));
                    addListener(e, this.props.state.active, 'status', function(s){
                        //s ? e.addClass('open') : e.removeClass('open');
                        s ? e.removeClass('active') : (this.timer.value && e.addClass('active'));
                    }.bind(this));
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetWrap: {
                tag: 'div',
                className: ['k50_widget_wrap'],
                name: 'WidgetWrap',
                parent: null,
                props: {},
                state: {},
                connect: ['tab', 'widgetdrag'],
                willMount: function(){
                    this.state.tab = this.tab;
                },
                content: function(parent){
                    var wh = Component.WidgetHeader.render({parent: parent, props: {state: this.props.state}}),
                        h = 50;//wh.clientHeight;
                    Component.WidgetContent.render({parent: parent, props: {h: h, state: this.props.state}});
                },
                didMount: function(e){
                    //isMobile() && e.addClass('k50_mobile');
                    this.widgetdrag.elem = e;
                    var winW = window.innerWidth
                    || document.documentElement.clientWidth
                    || document.body.clientWidth;

                    var winH = window.innerHeight
                    || document.documentElement.clientHeight
                    || document.body.clientHeight;
                    this.widgetdrag.winW = winW;
                    this.widgetdrag.winH = winH;
                    
                    addListener(e, this.props.state.active, 'status', function(status){
                        if(status){
                            e.addClass('active');
                            var coord, coordJSON = localStorage.getItem('coord_widget');
                            var box = e.getBoundingClientRect();
                            
                            if(coordJSON){
                                coord = JSON.parse(coordJSON);
                                e.style.left = parseInt(coord.left) + box.width > winW ? -(box.width) + 'px' : coord.left;
                                e.style.top = parseInt(coord.top) + box.height > winH ? (winH - box.height) + 'px' : coord.top;
                            }
                        }
                        else{
                            e.removeClass('active');
                            e.style.left = 'auto';
                        }
                    });
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetHeader: {
                tag: 'div',
                className: ['k50_widget_header'],
                name: 'WidgetHeader',
                parent: null,
                state: {},
                text: '',
                connect: ['tab'],
                content: function(parent){
                    Component.WidgetHeaderDrag.render({parent: parent, props: {state: this.props.state}});
                    Component.WidgetHeaderNavIcon.render({parent: parent, props: {state: this.props.state}});
                    Component.WidgetHeaderClose.render({parent: parent, props: {state: this.props.state}});
                    
                    var tab = this.tab;
                    createElem(parent, {
                        text: tab.titletab,
                        className: ['k50_widget_header_title'],
                        didMount: function(e){
                            addListener(e, tab, 'titletab', function(title){
                                e.innerHTML = title;
                            });
                        }
                    });
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetHeaderDrag: {
                tag: 'div',
                className: ['k50_widget_header_drag'],
                name: 'WidgetHeaderDrag',
                parent: null,
                state: {shiftX: 0, shiftY: 0},
                connect: ['widgetdrag'],
                content: function(parent){
                    
                },
                getCoords: function(e){
                    var box = e.getBoundingClientRect();
                    return {
                        top: box.top,
                        left: box.left
                    };
                },
                saveLocalStorage: function(){
                    var coord = {
                        top: this.widgetdrag.elem.style.top,
                        left: this.widgetdrag.elem.style.left
                    };
                    this.widgetdrag.coord.y = coord.top;
                    this.widgetdrag.coord.x = coord.left;
                    coord = JSON.stringify(coord);
                    localStorage.setItem('coord_widget', coord);
                },
                action: [{
                    type: 'mousedown',
                    name: function(state, e){
                        var e = e || window.event;
                        if(e.which != 1){
                            return;
                        }
                        this.widgetdrag.x = e.pageX;
                        this.widgetdrag.y = e.pageY;
                        this.widgetdrag.ready = true;
                    }
                },{
                    type: 'mouseup',
                    name: function(state, e){return;
                        var e = e || window.event;
                        this.widgetdrag.ready = false;
                        if(e.which != 1){
                            return;
                        }
                        
                        if(this.widgetdrag.start){
                            this.widgetdrag.start = false;
                            this.saveLocalStorage();
                        }
                    }
                }],
                didMount: function(e){
                    window.addEventListener('mousemove', function(e){
                        var e = e || window.event,
                            widget = this.widgetdrag.elem;
                        if(!this.widgetdrag.ready) return;
                        if(!this.widgetdrag.start){
                            var moveX = e.pageX - this.widgetdrag.x;
                            var moveY = e.pageY - this.widgetdrag.y;
                            if ( Math.abs(moveX) < 3 && Math.abs(moveY) < 3 ) {
                              return;
                            }
                            this.widgetdrag.start = true;

                            var coords = this.getCoords(widget);
                            this.state.shiftX = this.widgetdrag.x - coords.left;
                            this.state.shiftY = this.widgetdrag.y - coords.top;
                        }
                        var box = widget.getBoundingClientRect();
                        
                        if(e.pageX - this.state.shiftX <= 0){
                            widget.style.left = -this.widgetdrag.winW + 'px';
                        }
                        else if(e.pageX - this.state.shiftX + box.width > this.widgetdrag.winW){
                            widget.style.left = -box.width + 'px';
                        }
                        else{
                            widget.style.left = -(this.widgetdrag.winW - e.pageX) - this.state.shiftX + 'px';
                        }
                        
                        if(e.pageY - this.state.shiftY <= 0){
                            widget.style.top = '0px';
                        }
                        else if(e.pageY - this.state.shiftY + box.height > this.widgetdrag.winH){
                            widget.style.top = this.widgetdrag.winH - box.height + 'px';
                        }
                        else{
                            widget.style.top = e.pageY - this.state.shiftY + 'px';
                        }
                        return false;
                    }.bind(this), false);
                    
                    document.addEventListener('mouseup', function(e){
                        var e = e || window.event;
                        if(!this.widgetdrag.ready) return;
                        else{
                            this.widgetdrag.ready = false;
                            this.widgetdrag.start = false;
                            this.saveLocalStorage();
                        }
                    }.bind(this), false);
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetHeaderNavIcon: {
                tag: 'div',
                className: ['k50_widget_header_nav_icon', 'k50_novisible'],
                name: 'WidgetHeaderNavIcon',
                parent: null,
                state: {},
                connect: ['tab'],
                setSVG: function(){
                    return '<svg width="30" height="30" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g> <rect width="30" height="30" fill="black" fill-opacity="0.05"/> </g> <g id="Union"> <path fill-rule="evenodd" clip-rule="evenodd" d="M 0 7L 8 0L 8 2.5L 4.11108 6L 16 6L 16 8L 4.11108 8L 8 11.5L 8 14L 0 7Z" transform="translate(7 8)" fill="#333333"/> </g> </svg>';
                },
                content: function(parent){
                    this.node.innerHTML = this.setSVG();
                },
                action: [{
                    type: 'click',
                    name: function(state, event){
                        var event = event || window.event;
                        event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        setState(this.tab, {componenttab: 'WidgetPanel', titletab: ''});
                    }
                }],
                didMount: function(e){
                    addListener(e, this.tab, 'componenttab', function(tab){
                        tab ==  'WidgetPanel' ? e.addClass('k50_novisible') : e.removeClass('k50_novisible');
                    });
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetHeaderClose: {
                tag: 'div',
                className: ['k50_widget_header_close'],
                name: 'WidgetHeaderClose',
                parent: null,
                props: {},
                content: function(parent){
                    this.node.innerHTML = '<svg width="30" height="30" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g transform="translate(-697 -154)"> <use xlink:href="#path0_fillcl" transform="translate(706.343 163.343)" fill="#333333"/> </g> <defs> <path id="path0_fillcl" fill-rule="evenodd" d="M 11.3137 1.41418L 9.89954 0L 5.65686 4.24268L 1.41418 6.10352e-05L 0 1.41425L 4.24268 5.65686L 0 9.89948L 1.41431 11.3137L 5.65686 7.07111L 9.89954 11.3137L 11.3137 9.89954L 7.07104 5.65692L 11.3137 1.41418Z"/> </defs> </svg>';
                },
                action: [{
                    type: 'click',
                    name: function(){
                        document.body.click();
                    }
                }],
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetPanel: {
                tag: 'div',
                className: ['k50_widget_panel'],
                name: 'WidgetPanel',
                parent: null,
                state: {},
                props: {},
                connect: ['tabs', 'tab'],
                content: function(parent){
                    var props = this.props,
                        state = {tab: this.tab},
                        
                        onClick = function(tab, title){
                            setState(state.tab, {componenttab: tab, titletab: title});
                        };
                    
                    map(this.tabs, function(item, index){
                        Component.WidgetPanelTab.render({
                            parent: parent,
                            text: null,
                            action: [{
                                type: 'click',
                                name: function(){
                                    onClick(index, item.title);
                                }
                            }],
                            props: {
                                title: item.title,
                                svg: item.svg
                            }
                        });
                    });
                },
                text: null,
                didMount: function(e){
                    addListener(e, this.tab, 'componenttab', function(name){
                        this.name == name ? e.addClass('active') : e.removeClass('active');
                    }.bind(this));
                    setState(this.tab, {componenttab: 'WidgetPanel', titletab: ''});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetPanelTab: {
                tag: 'div',
                className: ['k50_widget_panel_tab'],
                name: 'WidgetPanelTab',
                parent: null,
                props: {
                    title: null,
                    svg: null
                },
                content: function(parent){
                    createElem(parent, {
                        text: this.props.svg,
                        className: ['k50_tab_icon']
                    });
                    createElem(parent, {
                        text: this.props.title,
                        className: ['k50_tab_icon_title']
                    });
                },
                text: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetContent: {
                tag: 'div',
                className: ['k50_widget_content'],
                name: 'WidgetContent',
                parent: null,
                state: {},
                props: {
                    init: false,
                    h: 100
                },
                content: function(parent){
                    this.node.style.height = 'calc(100% - ' + this.props.h + 'px)';
                    Component.WidgetPanel.render({parent: parent, props: {state: this.props.state}});
                    Component.Chat.render({parent: parent, props: {state: this.props.state}});
                    Component.CallBack.render({parent: parent, props: {state: this.props.state}});
                    Component.FeedBack.render({parent: parent, props: {state: this.props.state}});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetInput: {
                tag: 'div',
                className: ['k50_widget_row', 'k50_widget_input'],
                name: 'WidgetInput',
                parent: null,
                state: {
                    value: '',
                    ref: {}
                },
                onChange: function(v){
                    return v;
                },
                onInput: function(v){
                    setState(this.state, {value: v});
                },
                onFocus: function(){console.log('focus')},
                onBlur: function(){console.log('blur')},
                onCheck: function(){
                    return this.state;
                },
                setValue: function(){
                    console.log('a',this);
                },
                props: {},
                content: function(parent){
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_input_label'],
                        text: this.props.label
                    });
                    var attr = {
                        value: this.props.value,
                        type: this.props.type
                    };
                    
                    var p = {
                        parent: parent,
                        value: '',
                        attribute: attr,
                        className: ['k50_input'],
                        props: {state: this.state},
                        onFocus: this.onFocus,
                        onBlur: this.onBlur,
                        onInput: this.onInput.bind(this)
                    };
                    this.state.ref.input = Component.Input.render(p);
                    
                    if(this.props.hasOwnProperty('error')){
                        createElem(parent, {
                            tag: 'div',
                            className: ['k50_input_error'],
                            text: this.props.error
                        });
                    }
                },
                didMount: function(e){
                    addListener(e, this.state, 'value', function(v){
                        if(v != this.state.ref.input.value){
                            this.state.ref.input.value = v;
                        }
                        else{
                            this.onChange(v);
                        }
                    }.bind(this));
                    addListener(e, this.onCheck(), 'value', function(v){
                        if(v != this.state.value){
                            setState(this.state, {value: v});
                        }
                    }.bind(this));
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            Input: {
                tag: 'input',
                className: ['k50_input'],
                name: 'Input',
                parent: null,
                attribute: {value: ''},
                state: {
                    value: ''
                },
                props: {},
                onInput: function(){
                    setState(this.state, {value: this.node.value});
                },
                onFocus: function(){console.log('inp')},
                onBlur: function(){console.log('blur')},
                action: [{
                    type: 'input',
                    name: function(s, event){
                        this.onInput(this.node.value);
                    }
                  },{
                    type: 'focus',
                    name: function(s, event){
                        this.onFocus();
                    }
                  },{
                    type: 'blur',
                    name: function(s, event){
                        this.onBlur();
                    }
                }],
                didMount: function(e){
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetTextarea: {
                tag: 'div',
                className: ['k50_widget_row', 'k50_widget_textarea'],
                name: 'WidgetTextarea',
                parent: null,
                state: {
                    value: '',
                    ref: {
                        tarea: false
                    }
                },
                props: {},
                onChange: function(v){
                    setState(this.state, {value: v});
                },
                content: function(parent){
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_input_label'],
                        text: this.props.label
                    });
                    this.state.ref.tarea = createElem(parent, {
                        tag: 'textarea',
                        className: ['k50_textarea'],
                        attribute: {
                            value: ''
                        },
                    });
                    this.state.ref.tarea.addEventListener('input', function(event){
                        var event = event || window.event;
                        event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        this.onChange(event.target.value);
                    }.bind(this), false);
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetButton: {
                tag: 'div',
                className: ['k50_widget_button'],
                name: 'WidgetButon',
                parent: null,
                state: {},
                props: {},
                onClick: function(){
                    console.log('click');
                },
                action: [{
                    type: 'click',
                    name: function(){this.onClick();}
                }],
                content: function(parent){
                    this.node.innerHTML = this.props.text;
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            FeedBack: {
                tag: 'div',
                className: ['k50_feedback'],
                name: 'FeedBack',
                parent: null,
                state: {},
                store: {feedstatus: {value: false}},
                connect: ['tab', 'feedstatus'],
                content: function(parent){
                    Component.FeedContainer.render({parent: parent});
                },
                didMount: function(e){
                    addListener(e, this.tab, 'componenttab', function(name){
                        this.name == name ? e.addClass('active') : (e.removeClass('active'), setState(this.feedstatus, {value: false}));
                    }.bind(this));
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            FeedContainer: {
                tag: 'div',
                className: ['k50_feedback_container', 'k50_custom-scroll'],
                name: 'FeedContainer',
                parent: null,
                content: function(parent){
                    Component.FeedContent.render({parent: parent});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            FeedContent: {
                tag: 'div',
                className: ['k50_feedback_content'],
                name: 'FeedContent',
                parent: null,
                state: {
                    username: {value: ''},
                    email: {value: ''},
                    phone: {value: ''},
                    checked: {value: false}
                },
                ref: {},
                connect: ['username', 'email', 'phone', 'usermessage'],
                content: function(parent){
                    createElem(parent, {
                        text: 'Вы можете оставить сообщение и мы перезвоним вам как можно скорее',
                        className: ['k50_widget_desc']
                    });
                    Component.WidgetTextarea.render({
                        parent: parent,
                        props: {value: '', label: 'сообщение'},
                        onChange: function(v){
                            setState(this.usermessage, {value: v});
                        }.bind(this),
                    });
                    Component.WidgetInput.render({
                        parent: parent,
                        props: {type: 'text', value: '', label: 'имя', state: this.username},
                        onChange: function(v){
                            if(v != this.username.value){
                                setState(this.username, {value: v});
                            }
                        }.bind(this),
                        onCheck: function(){
                            return this.username;
                        }.bind(this)
                    });
                    this.ref.email = {value: false};
                    this.ref.email.value = Component.WidgetInput.render({
                        parent: parent,
                        props: {type: 'text', value: '', label: 'e-mail', error: 'Неверно введен email', state: this.email},
                        onChange: function(v){
                                setState(this.email, {value: v});
                        }.bind(this),
                        onFocus: function(){this.ref.email.value.removeClass('error')}.bind(this)
                    });
                    Component.WidgetInput.render({
                        parent: parent,
                        props: {type: 'tel', value: '', label: 'телефон', state: this.phone},
                        onChange: function(v){
                            if(v != this.phone.value){
                                setState(this.phone, {value: v});
                            }
                        }.bind(this),
                        onInput: function(v){
                            v = _this.action('maskChecker')(v);
                            setState(this.state, {value: v});
                        },
                        onFocus: function(){_this.action('maskInit')(this.phone)}.bind(this),
                        onBlur: function(){_this.action('maskClear')(this.phone)}.bind(this),
                        onCheck: function(){
                            return this.phone;
                        }.bind(this)
                    });
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_policy'],
                        content: function(parent){
                            createElem(parent, {
                                tag: 'a',
                                attribute: {
                                    href: 'https://k50.ru/personal.pdf',
                                    onclick: 'window.open(this.href);return false;'
                                },
                                text: 'Условия обработки персональных данных'
                            });
                        }
                    });
                    this.ref.btn = {value: false};
                    this.ref.btn.value = Component.WidgetButton.render({
                        parent: parent,
                        connect: ['username', 'usermessage', 'email', 'phone'],
                        props: {text: 'Отправить'},
                        checkForm: function(){
                            if(this.username.value != '' && this.email.value != '' && (this.phone.value != '' && this.phone.value.length == 18) && this.usermessage.value != ''){
                                this.node.addClass('active');
                            }
                            else{
                                this.node.removeClass('active');
                            }
                        },
                        onClick: function(){                            
                            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                            var checked = true;
                            
                            if(this.email.value.match(re)){
                                this.ref.email.value.removeClass('error');
                            }
                            else{
                                this.ref.email.value.addClass('error');
                                checked = false;
                            }
                            var send = {
                                username: this.username,
                                email: this.email,
                                phone: this.phone,
                                message: this.message
                            };
                            checked ? (console.log(send), setState(this.state.checked, {value: true})) : this.ref.btn.value.removeClass('active');
                        }.bind(this),
                        didMount: function(e){
                            addListener(e, this.username, 'value', function(v){this.checkForm();}.bind(this));
                            addListener(e, this.email, 'value', function(v){this.checkForm();}.bind(this));
                            addListener(e, this.phone, 'value', function(v){this.checkForm();}.bind(this));
                            addListener(e, this.usermessage, 'value', function(v){this.checkForm();}.bind(this));
                        }
                    });
                    
                    this.ref.confirm = {value: false};
                    this.ref.confirm.value = Component.FeedConfirm.render({parent: parent, props: {checked: this.state.checked}});
                },
                didMount: function(e){
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            FeedConfirm: {
                tag: 'div',
                className: ['k50_feedback_confirm'],
                name: 'FeedConfirm',
                parent: null,
                props: {},
                connect: ['feedstatus'],
                content: function(parent){
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_callback_timer_box'],
                        content: function(parent){
                            createElem(parent, {
                                tag: 'div',
                                className: ['k50_callback_timer_desc'],
                                text: 'Ваша заявка на обратный звонок получена.'
                            });
                            createElem(parent, {
                                tag: 'div',
                                className: ['k50_callback_timer_desc'],
                                text: 'Мы перезвоним вам как можно скорее.'
                            });
                            createElem(parent, {
                                tag: 'div',
                                className: ['k50_callback_timer_btn'],
                                text: 'ОК',
                                didMount: function(e){
                                    e.addEventListener('click', function(state, event){
                                        setState(this.props.checked, {value: false});
                                    }.bind(this), false);
                                }.bind(this)
                            });
                        }.bind(this)
                    });
                },
                didMount: function(e){
                    addListener(e, this.feedstatus, 'value', function(v){
                        if(e.hasClass('active')){
                            !v && e.removeClass('active');
                        }
                    });
                    addListener(e, this.props.checked, 'value', function(v){
                        v ? e.addClass('active') : e.removeClass('active');
                    });
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallBack: {
                tag: 'div',
                className: ['k50_callback'],
                name: 'CallBack',
                parent: null,
                state: {},
                connect: ['tab'],
                content: function(parent){
                    Component.CallContainer.render({parent: parent, props: {state: this.props.state}});
                },
                didMount: function(e){
                    addListener(e, this.tab, 'componenttab', function(name){
                        this.name == name ? e.addClass('active') : e.removeClass('active');
                    }.bind(this));
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallContainer: {
                tag: 'div',
                className: ['k50_callback_container'],
                name: 'CallContainer',
                parent: null,
                state: {
                    component: null
                },
                content: function(parent){
                    Component.CallContent.render({parent: parent, props: {state: this.props.state}});
                },
                didMount: function(e){
                    setState(this.props.state, {component: 'CallNow'});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallTimer: {
                tag: 'div',
                className: ['k50_callback_timer'],
                name: 'CallTimer',
                parent: null,
                connect: ['timer'],
                state: {
                    timeout: false
                },
                content: function(parent){
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_callback_timer_box'],
                        content: function(parent){
                            createElem(parent, {
                                tag: 'div',
                                className: ['k50_callback_timer_desc'],
                                text: 'Ваш запрос на обратный звонок получен.'
                            });
                            createElem(parent, {
                                tag: 'div',
                                className: ['k50_callback_timer_desc'],
                                text: 'Мы перезвоним вам через'
                            });
                            createElem(parent, {
                                tag: 'div',
                                className: ['k50_callback_timer_item'],
                                text: '00:00',
                                didMount: function(e){
                                    addListener(e, this.timer, 'value', function(v){
                                        this.state.timeout && clearTimeout(this.state.timeout);
                                        //var d = Math.floor(v / (1000 * 60 * 60 * 24));
                                        var h = Math.floor((v % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                        var m = Math.floor((v % (1000 * 60 * 60)) / (1000 * 60));
                                        var s = Math.floor((v % (1000 * 60)) / 1000);
                                        h = h ? h < 10 ? '0' + h : h : 0;
                                        m = m < 10 ? '0' + m : m;
                                        s = s < 10 ? '0' + s : s;
                                        if(v > 0){
                                            e.innerHTML = (h ? h + ':' : '') + m + ':' + s;
                                            this.state.timeout = setTimeout(function(){setState(this.timer, {value: v - 1000})}.bind(this), 1000);
                                        }
                                        else{
                                            e.innerHTML = '00:00';
                                            setState(this.timer, {status: false});
                                        }
                                    }.bind(this));                     
                            
                                    var countTimeStorage = localStorage.getItem('countstore');
                                    if(countTimeStorage){
                                        var counttime = JSON.parse(countTimeStorage);
                                        counttime = new Date(counttime.value).getTime();
                                        var time = new Date().getTime();
                                        counttime = counttime - time;
                                        counttime > 0 && setState(this.timer, {value: counttime, start: counttime, status: true});
                                    }
                                }.bind(this)
                            });
                            createElem(parent, {
                                tag: 'div',
                                className: ['k50_callback_timer_btn'],
                                text: 'ОК',
                                didMount: function(e){
                                    e.addEventListener('click', function(){
                                        //setState(this.timer, {status: false});
                                        document.body.click();
                                    }.bind(this), false);
                                }.bind(this)
                            });
                            createElem(parent, {
                                tag: 'div',
                                className: ['k50_callback_timer_btn'],
                                text: 'Отменить',
                                didMount: function(e){
                                    e.addEventListener('click', function(){
                                        var countstore = {
                                            value: 0
                                        };
                                        countstore = JSON.stringify(countstore);
                                        localStorage.setItem('countstore', countstore);
                                        setState(this.timer, {value: 0, start: 0, status: false});
                                    }.bind(this), false);
                                }.bind(this)
                            });
                        }.bind(this)
                    });
                },
                didMount: function(e){
                    this.timer.status && e.addClass('active');
                    addListener(e, this.timer, 'status', function(s){
                        if(!s){e.removeClass('active')}
                        else{
                            e.addClass('active');
                        }
                    }.bind(this));
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallContent: {
                tag: 'div',
                className: ['k50_callback_content'],
                name: 'CallContent',
                parent: null,
                state: {
                    username: {
                        value: ''
                    },
                    phone: {
                        value: ''
                    }
                },
                props: {},
                ref: {},
                connect: ['username', 'phone', 'time', 'timer'],
                content: function(parent){
                    createElem(parent, {
                        text: 'Спецусловия на покупку жилья. Оставьте свой номер и мы перезвоним вам',
                        className: ['k50_widget_desc']
                    });
                    Component.WidgetInput.render({
                        parent: parent,
                        props: {type: 'text', value: '', label: 'имя', state: this.username},
                        onChange: function(v){
                            if(v != this.username.value){
                                setState(this.username, {value: v});
                            }
                        }.bind(this),
                        onCheck: function(v){
                            return this.username;
                        }.bind(this)
                    });
                    Component.WidgetInput.render({
                        parent: parent,
                        props: {type: 'tel', value: '', label: 'телефон', state: this.phone},
                        onChange: function(v){
                            if(v != this.phone.value){
                                setState(this.phone, {value: v});
                            }
                        }.bind(this),
                        onInput: function(v){
                            v = _this.action('maskChecker')(v);
                            setState(this.state, {value: v});
                        },
                        onFocus: function(){_this.action('maskInit')(this.phone)}.bind(this),
                        onBlur: function(){_this.action('maskClear')(this.phone)}.bind(this),
                        onCheck: function(){
                            return this.phone;
                        }.bind(this)
                    });
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_input_label'],
                        text: 'время'
                    });
                    Component.CallTime.render({
                        parent: parent,
                        props: this.props.state
                    });
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_policy'],
                        content: function(parent){
                            createElem(parent, {
                                tag: 'a',
                                attribute: {
                                    href: 'https://k50.ru/personal.pdf',
                                    onclick: 'window.open(this.href);return false;'
                                },
                                text: 'Условия обработки персональных данных'
                            });
                        }
                    });
                    this.ref.btn = {value: false};
                    this.ref.btn.value = Component.WidgetButton.render({
                        parent: parent,
                        connect: ['username', 'phone', 'timer'],
                        props: {text: 'Отправить'},
                        checkForm: function(){
                            if(this.username.value != '' && (this.phone.value != '' && this.phone.value.length == 18)){
                                this.node.addClass('active');
                            }
                            else{
                                this.node.removeClass('active');
                            }
                        },
                        onClick: function(){
                            var checked = true,
                                send = {
                                    username: this.username,
                                    phone: this.phone,
                                    time: this.time
                                };
                            var tnow = new Date();
                            var hourToTomorrow = 0;
                            var minuteToTomorrow = 0;
                            var tday = tnow.getDate();
                            
                            if(this.time.day.value == 2){
                                hourToTomorrow = 24 - tnow.getHours();
                                minuteToTomorrow = 60 - tnow.getMinutes();
                                tday += 1;
                                console.log(send.time.hour.value,tday);
                            }
                            //var tplan = new Date(tnow.getFullYear(), tnow.getMonth(), tday, send.time.hour.value, send.time.minute.value, 0, 0);
                            var tplan = new Date(tnow.getFullYear(), tnow.getMonth(), 32, 17, 40, 0, 0);
                            console.log(tplan);
                            var countstore = {
                                value: tplan
                            };
                            countstore = JSON.stringify(countstore);
                            localStorage.setItem('countstore', countstore);
                            
                            var counttime = tplan - tnow;
                            
                            checked && (console.log(this,send), setState(this.timer, {value: counttime, start: counttime, status: true}));
                        }.bind(this),
                        didMount: function(e){
                            addListener(e, this.username, 'value', function(v){this.checkForm();}.bind(this));
                            addListener(e, this.phone, 'value', function(v){this.checkForm();}.bind(this));
                        }
                    });
                    
                    this.ref.timer = {value: false};
                    this.ref.timer.value = Component.CallTimer.render({
                        parent: parent
                    });
                },
                didMount: function(e){
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallTime: {
                tag: 'div',
                className: ['k50_widget_row'],
                name: 'CallTime',
                parent: null,
                getTime: function(){
                    var date = new Date();
                    var time = date.getTime();
                    
                    var d = date.getDay();
                    var h = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) + _settings.schedule.timeZoneOffset;
                    var m = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
                    return {d: d, h: h, m: m};
                },
                state: {
                    day: {
                        value: -1,
                        title: ''
                    },
                    hour: {
                        value: -1,
                        title: ''
                    },
                    minute: {
                        value: -1,
                        title: ''
                    },
                    dayReal: 0,
                    optionsDay: {
                        value: '',
                        options: [{
                            value: 0,
                            name: 'сейчас'
                          },{
                            value: 1,
                            name: 'сегодня'
                          },{
                            value: 2,
                            name: 'завтра'
                        }],
                        full: [0,1,2],
                        morning: [1,2],
                        tomorrow: [2],
                        set: []
                    },
                    optionsHour: {
                        value: []
                    },
                    optionsMinute: {
                        value: []
                    }
                },
                createOptionsDay: function(){
                    var value = this.state.optionsDay.value;
                    var ar = [];
                    var source = this.state.optionsDay[value];
                    for(var i = 0, len = source.length; i < len; i++){
                        this.state.optionsDay.options.map(function(item, index){
                            if(item.value == source[i]) ar.push(item);
                        });
                    }
                    
                    this.state.optionsDay.set = [];
                    for(var i = 0, len = ar.length; i < len; i++){
                        this.state.optionsDay.set.push(ar[i]);
                    }
                },
                createOptionsHour: function(){
                    var hours = [];
                    for(var i = _settings.schedule[this.state.dayReal].from.h, j = 0; i < _settings.schedule[this.state.dayReal].to.h; i++, j++){
                        hours.push({
                                value: j,
                                name: (i < 10 ? '0' + i : '' + i)
                              });
                    }
                    this.state.optionsHour.value = [];
                    if(this.state.day.value == 2){
                        //this.state.hour.value = 0;
                        setState(this.state.hour, {value: 0});
                        for(var i = 0, len = hours.length; i < len; i++){
                            this.state.optionsHour.value.push(hours[i]);
                        }
                    }
                    if(this.state.day.value == 0 || this.state.day.value == 1){
                        this.state.hour.value = 0;
                        var hour = this.getTime().h,
                            min = this.getTime().m;
                        if(min >= 50) hour++;
                        var hourIndex = 0;
                        hours.map(function(item, index){
                            if(parseInt(item.name) == parseInt(hour)) hourIndex = index;
                        });
                        
                        //this.state.hour.value = hourIndex;
                        setState(this.state.hour, {value: hourIndex, title: hours[hourIndex].name});
                        for(var i = 0, len = hours.length; i < len; i++){
                            if(i >= hourIndex){
                                this.state.optionsHour.value.push(hours[i]);
                            }
                        }
                    }
                },
                createOptionsMinute: function(){
                    var minutes = [];
                    for(var i = 0, j = 0; i < 6; i++, j++){
                        minutes.push({
                                value: j,
                                name: i + '0'
                              });
                    }
                    this.state.optionsMinute.value = [];
                    
                    if(this.state.day.value == 0){
                        var min = Math.floor(this.getTime().m / 10);
                        if(min == 5) min = -1;
                        setState(this.state.minute, {value: min + 1, title: minutes[min + 1].name});
                        
                        minutes.map(function(item, index){
                            if(index > min){
                                this.state.optionsMinute.value.push(item);
                            }
                        }.bind(this));
                    }
                    if(this.state.day.value == 1){
                        if(parseInt(this.state.hour.title) == this.getTime().h){
                            var min = Math.floor(this.getTime().m / 10);
                            if(min == 5) min = -1;
                            setState(this.state.minute, {value: min + 1, title: minutes[min + 1].name});
                            
                            minutes.map(function(item, index){
                                if(index > min){
                                    this.state.optionsMinute.value.push(item);
                                }
                            }.bind(this));
                        }
                        else{
                            setState(this.state.minute, {value: 0, title: minutes[0].name});
                            for(var i = 0, len = minutes.length; i < len; i++){
                                this.state.optionsMinute.value.push(minutes[i]);
                            }
                        }
                    }
                    if(this.state.day.value == 2){
                        setState(this.state.minute, {value: 0, title: minutes[0].name});
                        for(var i = 0, len = minutes.length; i < len; i++){
                            this.state.optionsMinute.value.push(minutes[i]);
                        }
                    }
                },
                getTimeIs: function(){
                    this.state.dayReal = this.getTime().d;
                    var timeis = {
                        now: {
                            h: this.getTime().h,
                            m: this.getTime().m
                        },
                        end: {
                            h: _settings.schedule[this.state.dayReal].to.h,
                            m: _settings.schedule[this.state.dayReal].to.m
                        },
                        start: {
                            h: _settings.schedule[this.state.dayReal].from.h,
                            m: _settings.schedule[this.state.dayReal].from.m
                        }
                    };
                    
                    var day, optionsValue;
                    if(timeis.now.h >= timeis.end.h && timeis.now.m >= timeis.end.m - 10){
                        this.state.dayReal = this.state.dayReal < 6 ? this.state.dayReal : this.state.dayReal + 1;
                        day = 2;
                        optionsValue = 'tomorrow';
                    }
                    else if(timeis.now.h < timeis.start.h){
                        day = 1;
                        optionsValue = 'morning';
                    }
                    else{
                        day = 0;
                        optionsValue = 'full';
                    }
                    if(optionsValue != this.state.optionsDay.value){
                        setState(this.state.day, {value: day});
                        setState(this.state.optionsDay, {value: optionsValue});
                    }
                },
                connect: ['time'],
                content: function(parent){
                    setInterval(function(){
                        this.getTimeIs();
                    }.bind(this), 60000);
                    addListener(null, this.state.optionsDay, 'value', function(v){
                        this.createOptionsDay();
                    }.bind(this));
                    
                    addListener(null, this.state.day, 'value', function(v){
                        this.createOptionsHour();
                        setState(this.time.day, {value: v});
                    }.bind(this));
                    addListener(null, this.state.hour, 'value', function(v){
                        this.createOptionsMinute();
                        setState(this.time.hour, {value: parseInt(this.state.hour.title)});
                    }.bind(this));
                    addListener(null, this.state.minute, 'value', function(v){
                        setState(this.time.minute, {value: parseInt(this.state.minute.title)});
                    }.bind(this));
                    
                    this.getTimeIs();
                    
                    // days
                    Component.WidgetSelect.render({
                        parent: parent,
                        className: ['k50_widget_select_down'],
                        willMount: function(){
                            addListener(null, this.props.state.optionsDay, 'value', function(v){
                                this.render({
                                    className: [this.state.status ? 'active' : ''],
                                    parent: parent,
                                    props: {
                                        value: this.props.state.day.value,
                                        options: this.props.state.optionsDay.set
                                    }
                                });
                            }.bind(this));
                        },
                        props: {
                            value: this.state.day.value,
                            options: this.state.optionsDay.set,
                            state: this.state
                        },
                        onChange: function(v){
                            setState(this.state.day, {value: v});
                        }.bind(this)
                    });
                    
                    // hours
                    Component.WidgetSelect.render({
                        parent: parent,
                        className: ['k50_widget_select_numeric'],
                        willMount: function(){
                            addListener(null, this.props.state.day, 'value', function(v){
                                this.render({
                                    className: [this.state.status ? 'active' : ''],
                                    parent: parent,
                                    props: {
                                        value: this.props.state.hour.value,
                                        options: this.props.state.optionsHour.value,
                                        disabled: this.props.state.day.value == 0 ? true : false
                                    }
                                });
                            }.bind(this));
                        },
                        props: {
                            value: this.state.hour.value,
                            options: this.state.optionsHour.value,
                            state: this.state,
                            disabled: this.state.day.value == 0 ? true : false
                        },
                        onChange: function(v){
                            var title = '';
                            this.state.optionsHour.value.map(function(item, index){
                                if(item.value == v){
                                    title = item.name;
                                }
                            });
                            setState(this.state.hour, {value: v, title: title});
                        }.bind(this)
                    });
                    
                    // minutes
                    Component.WidgetSelect.render({
                        parent: parent,
                        className: ['k50_widget_select_numeric'],
                        willMount: function(){
                            addListener(null, this.props.state.hour, 'value', function(v){
                                this.render({
                                    className: [this.state.status ? 'active' : ''],
                                    parent: parent,
                                    props: {
                                        value: this.props.state.minute.value,
                                        options: this.props.state.optionsMinute.value,
                                        disabled: this.props.state.day.value == 0 ? true : false
                                    }
                                });
                            }.bind(this));
                        },
                        props: {
                            value: this.state.minute.value,
                            options: this.state.optionsMinute.value,
                            state: this.state,
                            disabled: this.state.day.value == 0 ? true : false
                        },
                        onChange: function(v){
                            var title = '';
                            this.state.optionsMinute.value.map(function(item, index){
                                if(item.value == v){
                                    title = item.name;
                                }
                            });
                            setState(this.state.minute, {value: v, title: title});
                        }.bind(this)
                    });
                },
                didMount: function(e){
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetSelect: {
                tag: 'div',
                className: ['k50_widget_select'],
                name: 'WidgetSelect',
                parent: null,
                onChange: function(v){
                    return v;
                },
                state: {
                    status: false,
                    title: '',
                    value: 0
                },
                props: {
                    disabled: false
                },
                closeSelect: function(event){
                    var event = event || window.event;
                    event.preventDefault ? event.preventDefault() : event.returnValue = false;
                    if(!(event.target == this.node || this.node.contains(event.target))){
                        setState(this.state, {status: false});
                    }
                },
                content: function(parent){
                    Component.WidgetSelectValue.render({parent: parent, props: Object.assign({}, this.props, {state: this.state})});
                    Component.WidgetSelectBox.render({parent: parent, props: Object.assign({}, this.props, {state: this.state})});
                },
                didMount: function(e){
                    this.props.disabled ? e.addClass('disabled') : e.removeClass('disabled');
                    addListener(e, this.state, 'status', function(status){
                        status ? e.addClass('active') : e.removeClass('active');
                    });
                    addListener(e, this.state, 'value', function(v){
                        this.onChange(v);
                    }.bind(this));
                    //this.closeSelect = 
                    document.addEventListener('click', this.closeSelect.bind(this), false);
                },
                willUnmount: function(){
                    removeListener(this.node, this.state, 'status');
                    removeListener(this.node, this.state, 'value');
                    document.removeEventListener('click', this.closeSelect, false);
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetSelectValue: {
                tag: 'div',
                className: ['k50_widget_select_value'],
                name: 'WidgetSelectValue',
                parent: null,
                state: {},
                props: {},
                content: function(parent){
                    this.node.innerHTML = this.props.value;
                },
                action: [{
                    type: 'click',
                    name: function(state, event){
                        var event = event || window.event;
                        event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        this.props.state.status ? setState(this.props.state, {status: false}) : setState(this.props.state, {status: true});
                    }
                }],
                didMount: function(e){
                    addListener(e, this.props.state, 'title', function(title){
                        e.innerHTML = title;
                    }.bind(this));
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetSelectBox: {
                tag: 'div',
                className: ['k50_widget_select_box'],
                name: 'WidgetSelectBox',
                parent: null,
                props: {},
                content: function(parent){
                    var state = this.props.state;
                    if(this.props.hasOwnProperty('options')){
                        this.props.options.map(function(item){
                            Component.WidgetSelectOption.render({parent: parent, props: {item: item, state: state}});
                        });
                    }
                },
                willMount: function(){
                    this.props.state.value = this.props.value;
                    var state = this.props.state;
                    this.props.options.map(function(item){
                        item.value == state.value && setState(state, {title: item.name});
                    });
                },
                didMount: function(e){
                    addListener(e, this.props.state, 'status', function(s){
                        if(s){
                            var len = e.childNodes.length - e.querySelectorAll('.novisible').length;
                            e.parentNode.hasClass('k50_widget_select_numeric') && (e.style.top = -(len * 30 / 2 - 15) + 'px');
                        }
                    });
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetSelectOption: {
                tag: 'div',
                className: ['k50_widget_select_option'],
                name: 'WidgetSelectOption',
                parent: null,
                props: {},
                state: {
                    option: {
                        value: null,
                        title: ''
                    }
                },
                content: function(parent){
                    this.node.innerHTML = this.props.item.name;
                    this.state.select.value == this.state.option.value && (this.node.addClass('active'));
                },
                willMount: function(){
                    this.state.select = this.props.state;
                    this.state.option.value = this.props.item.value;
                    this.state.option.title = this.props.item.name;
                },
                action: [{
                    type: 'click',
                    name: function(state, event){
                        var event = event || window.event;
                        event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        setState(this.state.select, {title: this.state.option.title, value: this.state.option.value, status: false});
                        var elActive = this.node.parentNode.querySelector('.active');
                        elActive && elActive.removeClass('active');
                        this.node.addClass('active');
                    }
                }],
                didMount: function(e){
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            Chat: {
                tag: 'div',
                className: ['k50_chat'],
                name: 'Chat',
                parent: null,
                props: {},
                state: {focus: false},
                store: {
                    chatmode: {
                        value: 'normal'
                    },
                    chatitemediting: {
                        list: [],
                        value: ''
                    }
                },
                connect: ['tab'],
                content: function(parent){
                    Component.ChatContainer.render({parent: parent, props: {state: this.props.state}});
                },
                didMount: function(e){
                    addListener(e, this.tab, 'componenttab', function(name){
                        this.name == name ? e.addClass('active') : e.removeClass('active');
                    }.bind(this));
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatContainer: {
                tag: 'div',
                className: ['k50_chat_container'],
                name: 'ChatContainer',
                state: {},
                parent: null,
                content: function(parent){
                    Component.ChatContent.render({parent: parent, props: {state: this.props.state}});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatSendWrap: {
                tag: 'div',
                className: ['k50_chat_send_wrap'],
                name: 'ChatSendWrap',
                parent: null,
                state: {
                    message: '',
                    selection: false,
                    emojibox: false,
                    emoji: false,
                    focus: false
                },
                content: function(parent){
                    Component.СhatSendInputWrap.render({parent: parent, props: {state: this.props.state}});
                    Component.ChatSendEmoji.render({parent: parent, props: {state: this.props.state}});
                    Component.ChatSendEmojiBox.render({parent: parent, props: {state: this.props.state}});
                    Component.ChatSendSubmit.render({parent: parent, props: {state: this.props.state}});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatNote: {
                tag: 'div',
                className: ['k50_chat_note'],
                name: 'ChatNote',
                connect: ['chatmode'],
                parent: null,
                content: function(parent){
                    Component.Element.render({
                        parent: parent,
                        className: ['k50_chat_note_val'],
                        text: 'Отмена редактирования',
                        didMount: function(e){
                            e.addEventListener('click', function(){
                                setState(this.chatmode, {value: 'normal'});
                            }.bind(this), false);
                            addListener(e, this.chatmode, 'value', function(v){
                                v == 'pastedit' ? e.addClass('active') : e.removeClass('active');
                            }.bind(this));
                        }.bind(this)
                    });
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatSendPlaceholder: {
                tag: 'div',
                className: ['k50_chat_send_ph'],
                name: 'ChatSendPlaceholder',
                parent: null,
                text: 'Сообщение...',
                content: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            СhatSendInputWrap: {
                tag: 'div',
                className: ['k50_chat_send_input_wrap'],
                name: 'СhatSendInputWrap',
                parent: null,
                state: {},
                content: function(parent){
                    Component.ChatSendInput.render({parent: parent, props: {state: this.props.state}});
                    Component.ChatSendPlaceholder.render({parent: parent});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatSendInput: {
                tag: 'div',
                className: ['k50_chat_send_input'],
                attribute: {
                    contenteditable: 'true'
                },
                name: 'ChatSendInput',
                parent: null,
                props: {},
                state: {},
                connect: ['chatmode', 'chatitemediting'],
                action: [{
                    type: 'focus',
                    name: function(){
                        //setState(this.props.state, {focus: true});
                    }
                },{
                    type: 'blur',
                    name: function(){
                        //setState(this.props.state, {focus: false});
                    }
                },{
                    type: 'keyup',
                    name: function(state, event){
                        var event = event || window.event,
                            textContent = this.node.textContent;
                        if(textContent == ''){
                            if(textContent.length < 1 && event.key === "Backspace"){
                              var els = this.node.getElementsByTagName("br");
                              while (els[0]) els[0].parentNode.removeChild(els[0]);
                                setState(_state.Msg, {value: ''});
                            }
                        }
                    }
                },{
                    type: 'keydown',
                    name: function(state, event){
                        var event = event || window.event,
                            keycode = event.charCode || event.keyCode;
                        if(keycode == 38){
                        console.log(event, keycode);
                        }
                    }
                },{
                    type: 'input',//'keypress',// keydown keyup paste',
                    name: function(state, event){
                        var event = event || window.event;
                        _this.action('typemessage')(event);
                        //console.log('e',event.target.innerHTML,event.target.innerHTML.replace(/<!--[\s\S]*?--!?>/g, "").replace(/<(?!img)\/?[a-z][^>]*(>|$)/gi, ""));
                        //setState(_state.Msg, {value: event.target.innerHTML.replace(/<!--[\s\S]*?--!?>/g, "").replace(/<(?!img)\/?[a-z][^>]*(>|$)/gi, "")});
                        setState(_state.Msg, {value: event.target.innerHTML});
                    }
                },{         
                    type: 'keypress',
                    name: function(state, event){
                        var event = event || window.event,
                            keycode = event.charCode || event.keyCode || event.key || event.char;
                        if(!isMobile()){
                            if(keycode == 13 && !event.shiftKey){
                                event.preventDefault ? event.preventDefault() : event.returnValue = false;
                                _this.action('sendmessage')({value: _state.Msg.value, action: this.chatmode.value});
                                setState(_state.Msg, {value: ''});
                                return false;
                            }
                        }
                    }
                }],
                didMount: function(el){
                    el.style.width = 'calc(100% + ' + el.getScrollBarWidth() + 'px)';
                    
                    setState(this.props.state, {selection: null, range: null});
                    
                    addListener(el, this.chatmode, 'value', function(v){
                        if(v == 'pastedit'){
                            var msgedit = this.chatitemediting.list[0],
                                msgindex = msgedit.id,
                                msg;
                            store.chathistory.messages.map(function(item, index){
                                msgindex == item.id && (msg = item.msg);
                            });
                            el.innerHTML = msg;
                            setState(_state.Msg, {value: msg});
                            el.focus();
                            if(typeof window.getSelection != "undefined" && typeof document.createRange != "undefined"){
                                var range = document.createRange();
                                range.selectNodeContents(el);
                                range.collapse(false);
                                var sel = window.getSelection();
                                sel.removeAllRanges();
                                sel.addRange(range);
                            }
                            else if(typeof document.body.createTextRange != "undefined"){
                                var textRange = document.body.createTextRange();
                                textRange.moveToElementText(el);
                                textRange.collapse(false);
                                textRange.select();
                            }
                        }
                    }.bind(this));
                    
                    addListener(el, _state.Msg, 'value', function(msg){
                        if(msg == '' || !msg || msg == 'undefined' || msg == '&nbsp;'){
                            el.innerHTML = '';
                        }
                    });
                    var state = this.props.state;
                    addListener(el, this.props.state, 'emoji', function(em){
                        em && el.focus();
                        var sel, range, 
                        emoImg = createElem(null, {
                            tag: 'img',
                            attribute: {
                                onresize: 'return false',
                                oncontrolselect: 'return false',
                                src: 'https://web.telegram.org/img/blank.gif'
                            },
                            className: ['k50_chat_send_emoji_icon', 'inside']
                        });
                        
                        if (window.getSelection) {
                            sel = state.selection ? state.selection : window.getSelection();
                            if (sel.getRangeAt && sel.rangeCount) {
                                range = sel.getRangeAt(0);
                                range.deleteContents();
                                //var textNode = document.createTextNode(text)
                                //range.insertNode(textNode);
                                range.insertNode(emoImg);
                                sel.removeAllRanges();
                                //range = range.cloneRange();
                                range.selectNode(emoImg);
                                //range.selectNode(frag);
                                range.collapse(false);
                                sel.addRange(range);
                            }
                        } else if (document.selection && document.selection.createRange) {
                            range = document.selection.createRange();
                            range.pasteHTML(text);
                            range.select();
                        }
                        
                        var cloneEl = el.cloneNode(true),
                            arNodes = cloneEl.querySelectorAll('.k50_chat_send_emoji_icon');
                        map(arNodes, function(item){
                            var textNode = document.createTextNode(':emoji:');
                            item.parentNode.replaceChild(textNode, item);
                        });
                        setState(_state.Msg, {value: cloneEl.innerHTML});
                        setState(state, {selection: false});
                    });
                    addListener(el, this.chatmode, 'value', function(v){
                        v == 'normal' && (el.innerHTML = '', setState(_state.Msg, {value: ''}));
                    }.bind(this));
                },
                content: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatSendSubmit: {
                tag: 'div',
                className: ['k50_chat_send_submit'],
                name: 'ChatSendSubmit',
                parent: null,
                connect: ['chatmode'],
                state: {
                    attachSvg: '<svg width="30" height="30" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M 15.9999 7.99992C 18.209 7.99988 19.9998 6.20898 19.9999 3.99992C 19.9999 1.79086 18.209 -4.31576e-05 16 7.80029e-10L 12.9999 7.79916e-10L 6.00001 7.80029e-10C 2.68626 4.31592e-05 5.2004e-10 2.68631 5.2004e-10 6.00001C -4.31579e-05 9.31375 2.68622 12 5.99996 12L 12.9999 12L 12.9999 9.99997L 5.99988 9.99992C 3.79082 9.99997 1.99992 8.20907 1.99987 5.99992C 1.99992 3.79086 3.79082 1.99996 6.00001 1.99996L 12.9999 1.99996L 15.9998 1.99992C 17.1046 2.00005 17.9998 2.89532 18 4.00005C 18 5.10456 17.1044 5.99992 15.9999 5.99992L 5.99996 5.99992L 5.99996 7.99988L 15.9999 7.99992Z" transform="matrix(0.707107 -0.707107 0.707107 0.707107 3.68628 17.8284)" fill="#333333"/></g></svg>',
                    msgSvg: '<svg width="30" height="30" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g> <path fill-rule="evenodd" clip-rule="evenodd" d="M 0 18L 18.0001 9.00003L 4.31584e-05 0L 2.99998 8.99999L 0 18ZM 4.50008 13L 12.5 8.99994L 4.50008 4.99998L 6.00005 8.99994L 4.50008 13Z" transform="matrix(0.707107 -0.707107 0.707107 0.707107 5.27209 12)" fill="#333333"/> </g> </svg>',
                    closeSvg: '<svg width="30" height="30" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g transform="translate(-697 -154)"> <use xlink:href="#path0_fillcl" transform="translate(706.343 163.343)" fill="#333333"/> </g> <defs> <path id="path0_fillcl" fill-rule="evenodd" d="M 11.3137 1.41418L 9.89954 0L 5.65686 4.24268L 1.41418 6.10352e-05L 0 1.41425L 4.24268 5.65686L 0 9.89948L 1.41431 11.3137L 5.65686 7.07111L 9.89954 11.3137L 11.3137 9.89954L 7.07104 5.65692L 11.3137 1.41418Z"/> </defs> </svg>'
                },
                props: {},
                action: [{
                    type: 'click',
                    name: function(state, event){
                        var event = event || window.event;
                        event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        event.stopPropagation();
                        //_this.action('sendmessage')(state.messages);
                        //setState(state, {messages: ''});
                        this.chatmode.value == 'pastedit' && (_state.Msg.value == '' || _state.Msg.value == 'undefined') ? (setState(this.chatmode, {value: 'delete'}), setState(_state.Msg, {value: ''})) : (_this.action('sendmessage')({value: _state.Msg.value, action: this.chatmode.value}), setState(_state.Msg, {value: ''}));
                    }
                }],
                content: null,
                didMount: function(e){
                    e.innerHTML = this.state.attachSvg;
                    
                    addListener(e, _state.Msg, 'value', function(v){
                        if(v){
                            e.innerHTML = this.state.msgSvg;
                            e.addClass('change');
                            e.removeClass('change');
                        }
                        else{
                            if(this.chatmode.value == 'pastedit'){
                                e.innerHTML = this.state.closeSvg;
                                e.addClass('change');
                                e.removeClass('change');
                            }
                            else{
                                e.innerHTML = this.state.attachSvg;
                                e.addClass('change');
                                //e.removeClass('change');
                            }
                        }
                    }.bind(this));
                    
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatSendEmojiBox: {
                tag: 'div',
                className: ['k50_chat_send_emoji_box'],
                name: 'ChatSendEmojiBox',
                parent: null,
                state: {},
                props: {
                    people:[
                        {code: '1f61e', x: -260, y: -26},
                        {code: '1f61e', x: -260, y: -26},
                        {code: '1f61e', x: -260, y: -26},
                        {code: '1f61e', x: -260, y: -26},
                        {code: '1f61e', x: -260, y: -26},
                        {code: '1f61e', x: -260, y: -26}
                    ]
                },
                action: [{
                    type: 'mouseleave',
                    name: function(){
                        this.node.removeClass('active');
                    }
                }],
                content: function(parent){
                    var state = this.props.state;
                    this.props.people.map(function(item, index){
                        Component.ChatSendEmojiIcon.render({parent: parent, props: Object.assign({}, item, {state: state})});
                    });
                },
                didMount: function(e){
                    addListener(e, this.props.state, 'emojibox', function(emojibox){
                        emojibox ? e.addClass('active') : e.removeClass('active');
                    });
                    document.body.addEventListener('click', function(event){
                        //e.removeClass('active');
                        setState(this.props.state, {emojibox: false});
                    }.bind(this));
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatSendEmojiIcon: {
                tag: 'input',
                className: ['k50_chat_send_emoji_icon'],
                name: 'ChatSendEmojiIcon',
                attribute: {
                    type: 'button',
                    value: ''
                },
                parent: null,
                state: {},
                props: {x: 0, y: 0},
                action: [{
                    type: 'click',
                    name: function(state, event){
                        setState(this.props.state, {emoji: true, emojibox: false, selection: false});
                    }
                }],
                content: null,
                didMount: function(e){
                    e.style['background-position'] = this.props.x + 'px ' + this.props.y + 'px';
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatSendEmoji: {
                tag: 'input',
                className: ['k50_chat_send_emoji'],
                name: 'ChatSendEmoji',
                parent: null,
                state: {},
                props: {},
                attribute: {
                    type: 'button',
                    value: ''
                },
                action: [{
                    type: 'click',
                    name: function(state, event){
                        var selection = false, event = event || window.event;
                        event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        event.stopPropagation();
                        if (window.getSelection) {
                            selection = window.getSelection();
                        }
                        this.props.state.emojibox ? setState(this.props.state, {emojibox: false, selection: false}) : setState(this.props.state, {emojibox: true, selection: selection});
                    }
                }],
                didMount: function(e){
                    e.style['background-image'] = 'url("data:image/svg+xml;charset=UTF-8,%3c' + "svg width='30' height='30' viewBox='0 0 30 30' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cg%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M 18 9C 18 13.9706 13.9706 18 9 18C 4.02942 18 0 13.9706 0 9C 0 4.02942 4.02942 0 9 0C 13.9706 0 18 4.02942 18 9ZM 16 9C 16 12.866 12.866 16 9 16C 5.13403 16 2 12.866 2 9C 2 5.13403 5.13403 2 9 2C 12.866 2 16 5.13403 16 9ZM 6 9C 7.10461 9 8 8.10455 8 7C 8 5.89545 7.10461 5 6 5C 4.89539 5 4 5.89545 4 7C 4 8.10455 4.89539 9 6 9ZM 9 14C 7.00537 14 5.28369 13.1825 4.4812 12L 9 12L 13.5188 12C 12.7163 13.1825 10.9946 14 9 14ZM 14 7C 14 8.10455 13.1046 9 12 9C 10.8954 9 10 8.10455 10 7C 10 5.89545 10.8954 5 12 5C 13.1046 5 14 5.89545 14 7Z' transform='translate(6 6)' fill='%23333333'/%3e%3c/g%3e%3c/svg%3e" + '")';
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatContent: {
                tag: 'div',
                className: ['k50_chat_content'],
                name: 'ChatContent',
                parent: null,
                state: {},
                content: function(parent){
                    Component.ChatTableRow.render({parent: parent});
                    Component.ChatEditPanel.render({parent: parent});
                    Component.ChatNote.render({parent: parent, props: {state: this.props.state}});
                    Component.ChatSendWrap.render({parent: parent, props: {state: this.props.state}});
                },
                didMount: function(elem){
                    logContentHeight = elem.clientHeight;
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatEditPanel: {
                tag: 'div',
                className: ['k50_chat_edit_panel'],
                name: 'ChatEditPanel',
                connect: ['chatmode', 'chatitemediting'],
                parent: null,
                content: function(parent){
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_btn', 'k50_blue', 'k50_l'],
                        text: 'Удалить',
                        didMount: function(e){
                            e.addEventListener('click', function(){
                                setState(this.chatmode, {value: 'delete'});
                            }.bind(this), false);
                        }.bind(this)
                    });
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_btn', 'k50_blue', 'k50_l'],
                        text: 'Редактировать',
                        didMount: function(e){
                            e.addEventListener('click', function(){
                                setState(this.chatmode, {value: 'edit'});
                            }.bind(this), false);
                            addListener(e, this.chatmode, 'value', function(v){
                                v == 'multy' ? e.hide() : e.show();
                            });
                        }.bind(this)
                    });
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_btn', 'k50_def', 'k50_r'],
                        text: 'Отмена',
                        didMount: function(e){
                            e.addEventListener('click', function(){
                                setState(this.chatmode, {value: 'normal'});
                            }.bind(this), false);
                        }.bind(this)
                    });
                },
                didMount: function(e){
                    addListener(e, this.chatmode, 'value', function(v){
                        v != 'normal' ? e.addClass('active') : e.removeClass('active');
                        if(v == 'delete'){
                            var len = this.chatitemediting.list.length,
                                item;
                            for(var i = 0; i < len; i++){
                                item = this.chatitemediting.list.pop();
                                item.render({remove: true});
                                delete item;
                                _this.action('sendmessage')({value: _state.Msg.value, action: this.chatmode.value, id: item.id});
                            }
                            setState(this.chatmode, {value: 'normal'});
                        }
                        if(v == 'normal'){
                            var len = this.chatitemediting.list.length;
                            for(var i = 0; i < len; i++){
                                item = this.chatitemediting.list.pop();
                                item.node.removeClass('edit');
                            }
                            setState(this.chatitemediting, {list: []});
                        }
                        if(v == 'edit'){
                            e.removeClass('active');
                            this.chatitemediting.list[0].node.removeClass('edit');
                            setTimeout(function(){setState(this.chatmode, {value: 'pastedit'});}.bind(this), 100);
                        }
                        if(v == 'pastedit'){
                            e.removeClass('active');
                        }
                    }.bind(this));
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatTableRow: {
                tag: 'div',
                className: ['k50_chat_table_row'],
                name: 'ChatTableRow',
                parent: null,
                content: function(parent){
                    Component.ChatLogWrap.render({parent: parent});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatLogWrap: {
                tag: 'div',
                className: ['k50_chat_log_wrap'],
                name: 'ChatLogWrap',
                parent: null,
                content: function(parent){
                    Component.ChatLog.render({parent: parent});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatLog: {
                tag: 'div',
                className: ['k50_chat_log', 'k50_custom-scroll'],
                name: 'ChatLog',
                parent: null,
                content: null,
                connect: ['chatmode', 'chatitemediting'],
                didMount: function(e) {
                    addListener(e, _state.ChatStack, 'messages', function(item) {
                        var msg = item.pop();
                        if(this.chatmode.value == 'pastedit'){
                            var elem = this.chatitemediting.list[0];
                            store.chathistory.messages.map(function(item, index){
                                item.id == elem.id && (item.msg = msg.msg);
                            });
                            
                            elem.render({
                                props: {text: msg.msg}
                            });
                            setState(this.chatmode, {value: 'normal'});
                        }
                        else{
                            Component.ChatMessageItem.render({
                                parent: e,
                                className: ['k50_chat_message_' + msg.type],
                                id: msg.id,
                                props: {
                                    id: msg.id,
                                    text: msg.msg,
                                    type: msg.type,
                                    time: '15:22',
                                    date: '14.03.2018'
                                }
                            });
                        }
                        
                        e.scrollTo(0, e.scrollHeight);
                    }.bind(this));
                    addListener(e, _state.Msg, 'value', function(v) {
                        e.scrollTo(0, e.scrollHeight);
                    });
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatMessageItem: {
                tag: 'div',
                className: ['k50_chat_message_item'],
                name: 'ChatMessageItem',
                parent: null,
                connect: ['chatmode', 'chatitemediting'],
                props: {
                    text: '',
                    type: 'out',
                    time: '15:22',
                    date: '14.03.2018'
                },
                state: {
                    active: {
                        value: false
                    }
                },
                action: [{
                    type: 'click',
                    name: function(){
                        var ind = -1;
                        this.chatitemediting.list.map(function(item, index){
                            item.index == this.index && (ind = index);
                        }.bind(this));
                        ind != -1 ? (this.node.removeClass('edit'), this.chatitemediting.list.splice(ind, 1)) : (this.node.addClass('edit'), this.chatitemediting.list.push(this));
                        
                        if(!this.chatitemediting.list.length){
                            setState(this.chatmode, {value: 'normal'});
                        }
                        else if(this.chatitemediting.list.length == 1){
                            setState(this.chatmode, {value: 'alone'});
                        }
                        else{
                            setState(this.chatmode, {value: 'multy'});
                        }
                    }
                }],
                content: function(parent){
                    this.props.type == 'in' && Component.ChatMessageAvatar.render({parent: parent, props: this.props});
                    Component.ChatMessageBody.render({parent: parent, text: this.props.text, props: this.props});
                },
                didMount: function(e){
                  /*
                    addListener(e, this.chatmode, 'value', function(v){
                                    console.log('v',this.chatmode);
                        if(v == 'delete'){
                            if(this.chatitemediting.list.length){
                                if(findInArray(this.chatitemediting.list, this.index) != -1){
                                  console.log(v,this.chatitemediting.list);
                                    //this.chatitemediting.list.splice(findInArray(this.chatitemediting.list, this.index), 1);
                                    //this.render({remove: true});
                                }
                                if(!this.chatitemediting.list.length){
                                    setState(this.chatmode, {value: 'normal'});
                                }
                            }
                        }
                        if(v == 'normal'){
                            if(this.chatitemediting.list.length){
                                var ind = findInArray(this.chatitemediting.list, this.index);
                                if(ind != -1){
                                    e.removeClass('edit');
                                    this.chatitemediting.list.splice(ind, 1);
                                }
                            }
                        }
                    }.bind(this));
                    */
                },
                willUnmount: function(){
                    //removeListener(this.node, this.chatmode, 'value');
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatMessageAvatar: {
                tag: 'div',
                className: ['k50_chat_message_avatar'],
                name: 'ChatMessageAvatar',
                props: {},
                parent: null,
                content: function(parent){
                    createElem(parent, {
                        tag: 'img',
                        attribute: {
                            src: '/widget/images/avatar.png'
                        }
                    });
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatMessageBody: {
                tag: 'div',
                className: ['k50_chat_message_body'],
                name: 'ChatMessageBody',
                props: {
                    time: '15:22',
                    date: '14.03.2018'
                },
                parent: null,
                content: function(parent){
                    Component.ChatMessageBottom.render({parent: parent, props: {time: this.props.time, date: this.props.date}});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatMessageBottom: {
                tag: 'div',
                className: ['k50_chat_message_bottom'],
                name: 'ChatMessageBottom',
                text: null,
                parent: null,
                props: {
                    time: 0,
                    date: 0
                },
                content: function(parent){
                    Component.ChatMessageTime.render({parent: parent, text: this.props.time});
                    //Component.ChatMessageDate.render({parent: parent, text: this.props.date});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatMessageTime: {
                tag: 'div',
                className: ['k50_chat_message_time'],
                name: 'ChatMessageTime',
                text: null,
                parent: null,
                content: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatMessageDate: {
                tag: 'div',
                className: ['k50_chat_message_date'],
                name: 'ChatMessageDate',
                text: null,
                parent: null,
                content: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatClear: {
                tag: 'br',
                className: ['k50_chat_clear'],
                name: 'ChatClear',
                parent: null,
                content: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            Popup: {
                tag: 'div',
                className: ['k50_popup'],
                name: 'Popup',
                parent: null,
                content: function(parent){},
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            Element: {
                tag: 'div',
                className: [],
                name: 'Element',
                parent: null,
                content: function(parent){},
                create: render,
                render: function(o){
                    return this.create(o);
                }
            }
        };
            
        this.action = function(action){
            var action = action || 0;
            
            if(!action) return false;
            
            var ar = {
                maskChecker:
                    function(v){
                        var mask = '+7(___)-___-__-__';
                        var maskParts = mask.match(/(_)+/g);
                        var regExParts = '';
                        
                        for(var i = 0; i < maskParts.length; i++){
                            regExParts += '([0-9]{0,' + maskParts[i].length + '})';
                        }
                        
                        var regexpPattern = new RegExp(regExParts);
                            var x = v.replace(/(\+\d+|\D)/g, '').match(regexpPattern);
                            var emptyValues = v.match(/(_)+$/g);
                            var value = '+7 (' + (x[1] ? x[1] :'')  + (x[2] ? ') ' + x[2] : '') + (x[3] ? '-' + x[3] : '') + (x[4] ? '-' + x[4] :'') ;
                        //setState(o, {value: value});
                        return value;
                     },
                maskInit: 
                    function(o){
                        var phone = o.value;
                        if(!phone || phone == ''){
                            var value = '+7 (';
                            setState(o, {value: value});
                        }
                        else{
                            setState(o, {value: phone});
                        }
                    },
                maskClear: 
                    function(o){
                        var phone = o.value;
                        if(phone == '+7 ('){
                            setState(o, {value: ''});
                        }
                    },
                socketConnect:
                    function(){
                        //WSch = WS.connect("ws://" + gos_web_socket_server_host + ":" + gos_web_socket_server_port);//make uncom
                        //console.log('WSch',WS,WSch);
                        WSch && WSch.on("socket/connect", function(session) {
                            Session = session;
                            session.subscribe("chat/" + counterId + "/" + sessionId, function (uri, payload) {
                                //console.log("Received message", payload.msg);
                                //addMessage(payload.msg);
                                
                                /*
                                var incomingMessage = payload.msg;
                                var tt = logContentHeight - sendWrapHeight,
                                    ChatLog = document.querySelector('[name="chat-log"]'),
                                    ChatLogWrap = document.querySelector('[name="chat-log-wrap"]'),
                                    ChatLog = document.querySelector('[name="chat-log"]'),
                                    ChatScrollbarWrap = document.querySelector('[name="chat-scrollbar-wrap"]');
                                */

                                var ChatStack = [{
                                    id: store.chathistory.messages.length,
                                    type: 'in',
                                    msg: payload.msg
                                }];
                                
                                store.chathistory.messages.push(ChatStack);
                                setState(_state.ChatStack, {messages: ChatStack});
                                
                                /*
                                Component.ChatMessageItem.render({parent: ChatLog, props: {text: incomingMessage, type: 'in'}});
                                if(ChatLog.clientHeight > tt){
                                    ChatLogWrap.style.height = tt + 'px';
                                    //var sendWrapHeight = components.chatSendWrap.element.clientHeight;
                                    Component.ChatScrollbarWrap.rerender();
                                    ChatScrollbarWrap.show();
                                };
                                ChatLogWrap.style.bottom = sendWrapHeight + 'px';
                                ChatLogWrap.scrollTo(0, ChatLogWrap.scrollHeight);
                                */
                            });
                        });
                    },
                sendmessage:
                    function(msg){
                        if((!msg.value || msg.value == '' || msg.value == 'undefined') && msg.action != 'delete'){
                            return false;
                        }
                        var emoImg = createElem(null, {
                            tag: 'img',
                            attribute: {
                                onresize: 'return false',
                                oncontrolselect: 'return false',
                                src: 'https://web.telegram.org/img/blank.gif'
                            },
                            className: ['k50_chat_send_emoji_icon', 'inside']
                        });
                        var msgProd = msg.value;
                        
                        msgProd = msgProd.replace(/:emoji:/gi, emoImg.outerHTML);
                        
                        
//                        Session.publish("chat/" + counterId + "/" + sessionId, msg.value);//make uncom

                        if(msg.action == 'delete'){
                            store.chathistory.messages.map(function(item, index){
                                item.id == msg.id && store.chathistory.messages.splice(index, 1);
                            });
                            return false;
                        }
                        var ChatStack = [{
                            id: store.chathistory.messages.length,
                            type: 'out',
                            msg: msgProd
                        }];
                        store.chathistory.messages.push(ChatStack[0]);
                        
                        setState(_state.ChatStack, {messages: ChatStack});
                        //input.innerHTML = '';

                        //_session.publish(_sessionID, text);//make uncom
                        
                        
                        //Component.ChatMessageItem.render({parent: ChatLog, props: {text: text, type: 'out'}});
                        //ChatSendInput.innerHTML = '';
                          
                        /*
                        var tt = logContentHeight - sendWrapHeight,
                            ChatLog = document.querySelector('[name="chat-log"]');
                        if(ChatLog.clientHeight > tt){
                            ChatLogWrap.style.height = tt + 'px';
                            //var sendWrapHeight = components.chatSendWrap.element.clientHeight;
                            Component.ChatScrollbarWrap.rerender();
                            ChatScrollbarWrap.show();
                        };
                        ChatLogWrap.style.bottom = sendWrapHeight + 'px';
                        ChatLogWrap.scrollTo(0, ChatLogWrap.scrollHeight);
                        */
                    },
                checkmessage:
                    function(event) {
                        var event = event || window.event,
                            keycode = event.charCode || event.keyCode || event.key || event.char;
                      /*
                        var event = event || window.event,
                            msgIpt = this,//components.chatSendInput.element,
                            keycode = event.charCode || event.keyCode,
                            textContent = msgIpt.textContent;// || msgIpt.innerText;
                        if(textContent == ''){
                            if(textContent.length < 1 && event.key === "Backspace"){
                              var els = msgIpt.getElementsByTagName("br");
                              while (els[0]) els[0].parentNode.removeChild(els[0]);
                              msgIpt.innerHTML = msgIpt.innerHTML.trim();
                              //components.chatSendInput.element.innerHTML = '';
                              //caretIn(msgIpt);
                            }
                        }
                        
                        var ChatSendWrap = document.querySelector('[name="chat-send-wrap"]'),
                            ChatLog = document.querySelector('[name="chat-log"]'),
                            ChatLogWrap = document.querySelector('[name="chat-log-wrap"]'),
                            ChatScrollbarWrap = document.querySelector('[name="chat-scrollbar-wrap"]');
                        var logHeight = logContentHeight - ChatSendWrap.clientHeight;
                        if(logHeight < ChatLog.clientHeight){
                            ChatLogWrap.style.height = logHeight + 'px';
                            Component.ChatScrollbarWrap.rerender();
                            ChatScrollbarWrap.show();
                        }
                        var sendWrapHeightNew = ChatSendWrap.clientHeight;
                        
                        if(keycode == 13 && !event.shiftKey){
                            sendWrapHeightNew = sendWrapHeight;
                        }
                        if(ChatSendWrap.clientHeight > sendWrapHeight){
                            sendWrapHeightNew = ChatSendWrap.clientHeight;
                        }
                        ChatLogWrap.style.bottom = sendWrapHeightNew + 'px';
                        
                        ChatLogWrap.scrollTo(0, ChatLogWrap.scrollHeight);
                        */
                      },
                typemessage:
                    function(event){
                        var event = event || window.event,
                            keycode = event.charCode || event.keyCode || event.key || event.char;
                    }
            }
            return ar[action];
        };
        /*
        var reducer = function(o){
            var state = {}, self = this;
            this.types = {};
            map(o, function(item, index){
                self.types[index] = item;
            });
            
            this.action = function(o){
                inject(state, o.state);
                this.types[o.type]();
            };
        };
        
        var MSG = new reducer({
            test1: function(){},
            test2: {msg: 'test2'}
        });
        */
function saveSelection() {
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            return sel.getRangeAt(0);
        }
    } else if (document.selection && document.selection.createRange) {
        return document.selection.createRange();
    }
    return null;
}

function restoreSelection(range) {
    if (range) {
        if (window.getSelection) {
            sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (document.selection && range.select) {
            range.select();
        }
    }
}

var selRange;




            
        
        this.renderWCall = function(){
            this.init = function(){
                var meta = document.querySelector('meta[name="viewport"]');              
                if(!meta){
                    meta = document.createElement('meta');
                    meta.name='viewport';
                    meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
                    document.getElementsByTagName('head')[0].appendChild(meta);
                }
                Component.Widget.render();
            }
            return this.init();
        };
        
        return {
            init: this.renderWCall
        }
    }
    
    var wcall = new WCall();

    return {
        load : function(){
            if(window.addEventListener){
                window.addEventListener('load', function(){
                    wcall.init();
                }, false);
            }
            else if(window.attachEvent){
                window.attachEvent('onload', function(){
                    wcall.init();
                });
            }
        }
    }
})(window, document).load();
