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
                    4:{off:false,from:{h:9,m:0},to:{h:21,m:0}},
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
            store = {
                widget: {
                    element: false,
                    height: 0
                },
                widgetcomponent: false,
                worktime: {
                    value: false,
                    listwork: {
                        afterwork: 2,
                        beforework: 1,
                        timework: 0
                    },
                    getTime: function(){
                        var date = new Date();
                        var time = date.getTime();
                        
                        var d = date.getDay();
                        var h = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) + _settings.schedule.timeZoneOffset;
                        var m = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
                        return {d: d, h: h, m: m};
                    },
                    setwork: function(){
                        var dayReal = new Date().getDay();
                        var timeis = {
                            now: {
                                h: this.getTime().h,
                                m: this.getTime().m
                            },
                            end: {
                                h: _settings.schedule[dayReal].to.h,
                                m: _settings.schedule[dayReal].to.m
                            },
                            start: {
                                h: _settings.schedule[dayReal].from.h,
                                m: _settings.schedule[dayReal].from.m
                            }
                        };
                        //timeis.now.m >= timeis.end.m - 10
                        if(timeis.now.h > timeis.end.h || (timeis.now.h == timeis.end.h && timeis.now.m >= timeis.end.m - 10)){
                            setState(this, {value: this.listwork.afterwork});
                        }
                        else if(timeis.now.h < timeis.start.h){
                            setState(this, {value: this.listwork.beforework});
                        }
                        else{
                            setState(this, {value: this.listwork.timework});
                        }
                    }
                },
            },
            _state = {},
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
                
                var removeEmpty = function(ar){
                    var newAr = [];
                    for(var i = 0, len = ar.length; i < len; i++){
                        if(ar[i] != undefined){
                            newAr.push(ar[i]);
                        }
                    }
                    return newAr;
                }
                
                if(o.hasOwnProperty('observers')){
                    var arO = Object.keys(o.observers),
                        arForRemove = [];
                    if(arO.length){
                        map(o.observers, function(item, index){
                            map(value, function(itemV, indexV){
                                if(index == indexV){
                                    for(var ii = 0; ii < item.length; ii++){
                                        if(item[ii].e){
                                            if(!document.body.contains(item[ii].e)){
                                                arForRemove.push({property: index});
                                                delete o.observers[index][ii];
                                                continue;
                                            }
                                        }
                                            item[ii].f(itemV);
                                    }
                                }
                            });
                        });
                        arForRemove.map(function(item, index){
                            o.observers[item.property] = removeEmpty(o.observers[item.property]);
                        });
                    }
                }
            },
            getState = function(o, property){
                var propperty = property || 0,
                    state = {};
                
                if(!property) return o;
                
                for(var ip in o){
                    if(ip == propperty){
                        state = o[property];
                        break;
                    }
                }
                return state;
            },
            postRequest = function(url, data, callback) {
                var callback = callback || 0;
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
                            callback && callback(data);
                        }
                        else if(xmlhttp.status == 400){
                            console.log('error 400 for POST');
                        }
                        else{
                            console.log('status is ' + xmlhttp.status);
                        }
                    }
                }
                xmlhttp.open("POST", url, true);
                xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                //data = {};
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
                    phone: {
                        value: ''
                    },
                    time: {
                        value: '',
                        day: {value: 0},
                        hour: {value: 0},
                        minute: {value: 0}
                    },
                    timer: {
                        value: false,
                        start: 0,
                        status: false,
                        timeout: false,
                        getTimeStr: function(v){
                            var v = v || this.value || 0;
                            if(v){
                                var h = Math.floor((v % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                var m = Math.floor((v % (1000 * 60 * 60)) / (1000 * 60));
                                var s = Math.floor((v % (1000 * 60)) / 1000);
                                
                                h = h ? h < 10 ? '0' + h : h : 0;
                                m = m < 10 ? '0' + m : m;
                                s = s < 10 ? '0' + s : s;
                            }
                            else{
                                var h = 0;
                                var m = '00';
                                var s = '00';
                            }
                            var str = h ? h + ':' + m + ':' + s : m + ':' + s;
                            return str;
                        }
                    },
                    tab: {
                        titletab: '',
                        componenttab: ''
                    },
                    tabs: {
                        CallBack: {
                            elem: null,
                            status: true,
                            title: 'У вас есть вопросы?'
                        },
                        FeedBack: {
                            elem: null,
                            status: false,
                            title: 'Оставить заявку'
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
                    },
                    confirm: {
                        desc: [],
                        status: {
                            value: false
                        }
                    },
                    resize: {
                        value: false
                    }
                },
                connect: ['tab', 'tabs', 'widget', 'worktime'],
                content: function(parent){
                    isMobile() && this.node.addClass('k50_mobile');
                    Component.BTN.render({parent: parent, props: {state: this.state}});
                    Component.WidgetWrap.render({parent: parent, props: {state: this.state}});
                },
                didMount: function(e){
                    var component = this;
                    if(!isMobile()){
                        document.addEventListener('click', function(event){
                            var event = event || window.event;
                            if(!(event.target == component.node || component.node.contains(event.target))){
                                setState(component.state.active, {status: false});
                                //setState(component.tab, {titletab: component.tabs['CallBack'].title, componenttab: 'CallBack'});
                            }
                        });
                    }
                    else{
                        document.addEventListener('touchend', function(event){
                            var event = event || window.event;
                            if(!(event.target == component.node || component.node.contains(event.target))){
                                setState(component.state.active, {status: false});
                                //setState(component.tab, {titletab: component.tabs['CallBack'].title, componenttab: 'CallBack'});
                            }
                        });
                    }
                    addListener(null, this.worktime, 'value', function(v){
                        if(v == this.worktime.listwork.timework){
                            setState(this.tab, {titletab: this.tabs['CallBack'].title, componenttab: 'CallBack'});
                        }
                        else{
                            setState(this.tab, {titletab: this.tabs['FeedBack'].title, componenttab: 'FeedBack'});
                        }
                    }.bind(this));
                    
                    this.worktime.setwork();
                    setState(this.widget, {element: e});
                    store.widgetcomponent = this;
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
                connect: ['widget', 'resize'],
                parent: null,
                props: {w: isMobile() ? '90px' : '120px', h: isMobile() ? '90px' : '120px', colorfone: "#f0f0f0", coloricon: "#333333"},
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
                    createElem(parent, {
                        tag: 'img',
                        className: ['k50_button_avatar'],
                        attribute: {
                            src: 'images/celentano.jpg'
                        }
                    });
                    createElem(parent, {
                        tag: 'span',
                        className: ['k50_button_circle'],
                        text: 'Мы перезвоним через 25 секунд'
                    });
                    Component.TimerIcon.render({parent: parent, props: {state: this.props.state}});
                },
                action: [{
                    type: 'mousedown',
                    name: function(state, e){                      
                        var box = this.node.getBoundingClientRect();
                        this.state.width = box.width;
                        this.state.height = box.height;
                        
                        var e = e || window.event;
                        if(e.which != 1){
                            return;
                        }
                        this.state.x = e.pageX;
                        this.state.y = e.pageY;
                        this.state.ready = true;
                    }
                },{
                    type: 'touchstart',
                    name: function(state, e){
                        var box = this.node.getBoundingClientRect();
                        this.state.width = box.width;
                        this.state.height = box.height;
                        
                        var e = e || window.event;
                        this.state.x = e.touches[0].pageX;
                        this.state.y = e.touches[0].pageY;
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
                },{
                    type: 'touchend',
                    name: function(state, e){
                        var e = e || window.event;
                        this.state.ready = false;
                        
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
                    addListener(e, this.widget, 'element', function(elem){
                        var coordBtn, coordBtnJSON = localStorage.getItem('coord_btn');
                        if(coordBtnJSON){
                            coordBtn = JSON.parse(coordBtnJSON);
                            var box = this.node.getBoundingClientRect();
                            this.state.width = box.width;
                            this.state.height = box.height;
                            this.node.style.left = -parseInt(coordBtn.left) > this.state.winW ? -this.state.winW + 'px': coordBtn.left;
                            this.node.style.top = parseInt(coordBtn.top) + this.state.height > this.state.winH ? (this.state.winH - this.state.height) + 'px' : coordBtn.top;
                        }
                    }.bind(this));
                    //var winW = this.state.winW;
                    //var winH = this.state.winH;
                    var btnMove = function(e){
                        var e = e || window.event;
                        if(!this.state.ready) return;
                        if(isMobile() && e.touches == undefined){return;}
                        
                        var pX = isMobile() ? e.touches[0].pageX : e.pageX;
                        var pY = isMobile() ? e.touches[0].pageY : e.pageY;
                        if(!this.state.start){
                            var moveX = pX - this.state.x;
                            var moveY = pY - this.state.y;
                            if ( Math.abs(moveX) < 3 && Math.abs(moveY) < 3 ) {
                              return;
                            }
                            this.state.start = true;

                            var coords = this.getCoords(this.node);
                            this.state.shiftX = this.state.x - coords.left;
                            this.state.shiftY = this.state.y - coords.top;
                        }
                        if(pX - this.state.shiftX <= 0){
                            this.node.style.left = -this.state.winW + 'px';
                        }
                        else if(pX - this.state.shiftX + this.state.width > this.state.winW){
                            this.node.style.left = -this.state.width + 'px';
                        }
                        else{
                            this.node.style.left = -(this.state.winW - pX) - this.state.shiftX + 'px';
                        }
                        
                        if(pY - this.state.shiftY <= 0){
                            this.node.style.top = '0px';
                        }
                        else if(pY - this.state.shiftY + this.state.height > this.state.winH){
                            this.node.style.top = this.state.winH - this.state.height + 'px';
                        }
                        else{
                            this.node.style.top = pY - this.state.shiftY + 'px';
                        }
                        return false;
                    };
                    
                    window.addEventListener('mousemove', btnMove.bind(this), false);
                    window.addEventListener('touchmove', btnMove.bind(this), false);
                    
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
                        //var coordBtn = this.state.coord_btn;
                        setState(this.resize, {value: true});
                        var coordBtn = JSON.parse(localStorage.getItem('coord_btn'));
                        var box = this.node.getBoundingClientRect();
                        var winW = window.innerWidth
                        || document.documentElement.clientWidth
                        || document.body.clientWidth;

                        var winH = window.innerHeight
                        || document.documentElement.clientHeight
                        || document.body.clientHeight;
                        this.state.winW = winW;
                        this.state.winH = winH;
                        
                        if(coordBtn.top){
                            this.node.style.left = -parseInt(coordBtn.left) > winW ? -winW + 'px': coordBtn.left;
                            this.node.style.top = parseInt(coordBtn.top) + box.height > winH ? (winH - box.height) + 'px' : coordBtn.top;
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
                connect: ['timer', 'time', 'tab'],
                state: {
                    time: {
                        value: 0
                    },
                    angle: {
                        value: 0
                    },
                    radius: 28
                },
                content: function(parent){
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_timer_icon_border'],
                        didMount: function(e){
                            e.innerHTML = '<svg width="56" height="56" viewBox="0 0 56 56" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path id="k50_timer_icon_border" d="M 28, 28 m -28, 0 a 28,28 0 1,0 56,0 a 28,28 0 1,0 -56,0" fill="#ff0004"/></g></svg>';
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
                            var nowDay = new Date().getDate();
                            var orderDay = new Date(this.time.value).getDate();
                            if(nowDay == orderDay){
                                setState(this.state.time, {value: (h ? h + ':' : '') + m + ':' + s});
                            }
                            else{
                                var orderDate = new Date(this.time.value),
                                    y = orderDate.getFullYear().toString().slice(2),
                                    m = orderDate.getMonth(),
                                    d = orderDate.getDate(),
                                    h = this.time.hour.value,
                                    min = this.time.minute.value;
                                m = m < 10 ? '0' + m : m;
                                d = d < 10 ? '0' + d : d;
                                h = h < 10 ? '0' + h : h;
                                min = min < 10 ? '0' + min : min;
                                
                                setState(this.state.time, {value: d + '.' + m + '.' + y + ' ' + h + ':' + min});
                            }
                            !this.props.state.active.status && e.addClass('active');
                        }
                        else{
                            setState(this.state.time, {value: '00:00'});
                            e.removeClass('active');
                        }
                    }.bind(this));
                    addListener(e, this.props.state.active, 'status', function(s){
                        s ? e.removeClass('active') : (this.timer.value > 0 && e.addClass('active'));
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
                connect: ['tab', 'widgetdrag', 'widget'],
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
                            /*
                            if(coordJSON){
                                coord = JSON.parse(coordJSON);
                                e.style.left = parseInt(coord.left) + box.width > winW ? -(box.width) + 'px' : coord.left;
                                e.style.top = parseInt(coord.top) + box.height > winH ? (winH - box.height) + 'px' : coord.top;
                            } 
                            */
                            if(!isMobile()){
                                e.style.left = -(winW / 2 + box.width / 2) + 'px';
                                e.style.right = winW / 2 + box.width / 2 + 'px';
                            }
                        }
                        else{
                            e.removeClass('active');
                            if(!isMobile()){
                                e.style.left = 'auto';
                                e.style.right = '-999px';
                            }
                        }
                    });
                    setState(this.widget, {height: this.node.clientHeight});
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
                    Component.WidgetHeaderClose.render({parent: parent, props: {state: this.props.state}});
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
                        setState(store.widgetcomponent.state.active, {status: false});
                        setState(store.widgetcomponent.tab, {titletab: store.widgetcomponent.tabs['CallBack'].title, componenttab: 'CallBack'});
                    }
                }],
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
                    Component.CallBack.render({parent: parent, props: {state: this.props.state}});
                    Component.FeedBack.render({parent: parent, props: {state: this.props.state}});
                    Component.Confirm.render({parent: parent, props: {state: this.props.state}});
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
                onFocus: function(){},
                onBlur: function(){},
                onCheck: function(){
                    return this.state;
                },
                setValue: function(){
                    console.log('a',this);
                },
                props: {},
                content: function(parent){
                    if(this.props.label){
                        createElem(parent, {
                            tag: 'div',
                            className: ['k50_input_label'],
                            text: this.props.label
                        });
                    }
                    var attr = {
                        value: this.props.value,
                        type: this.props.type
                    };
                    if(this.props.hasOwnProperty('placeholder')){
                        attr['placeholder'] = this.props.placeholder;
                    }
                    
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
                    phone: {
                        value: ''
                    }
                },
                props: {},
                ref: {},
                connect: ['phone', 'time', 'tabs', 'tab', 'worktime'],
                content: function(parent){
                    createElem(parent, {
                        text: this.tabs['FeedBack'].title,
                        className: ['k50_widget_title']
                    });
                    createElem(parent, {
                        className: ['k50_widget_wbody'],
                        content: function(parent){
                            createElem(parent, {
                                className: ['k50_widget_avatar_desc'],
                                text: 'Вы можете выбрать удобное для вас время звонка.',
                            });
                        }
                    });
                    Component.WidgetInput.render({
                        parent: parent,
                        props: {type: 'tel', value: '', label: null, state: this.phone, placeholder: 'Ваш телефон'},
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
                    
                    Component.CallTime.render({
                        parent: parent,
                        props: this.props.state
                    });
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_widget_row'],
                        content: function(parent){
                            Component.WidgetButton.render({
                                parent: parent,
                                connect: ['phone', 'timer', 'time', 'confirm'],
                                props: {text: 'Отправить'},
                                checkForm: function(){
                                    if(this.phone.value != '' && this.phone.value.length == 18){
                                        this.node.addClass('active');
                                    }
                                    else{
                                        this.node.removeClass('active');
                                    }
                                },
                                onClick: function(){
                                    var checked = true,
                                        send = {
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
                                    }
                                    var tplan = new Date(tnow.getFullYear(), tnow.getMonth(), tday, send.time.hour.value, send.time.minute.value, 0, 0);
                                    setState(this.time, {value: tplan});
                                    var countstore = {
                                        value: tplan.getTime(),
                                        ordertime: this.time.value
                                    };
                                    countstore = JSON.stringify(countstore);
                                    localStorage.setItem('countstore', countstore);
                                    
                                    var counttime = tplan.getTime() - tnow.getTime();
                                    
                                    checked && (
                                        setState(this.confirm.status, {value: true}),
                                        setState(this.timer, {value: counttime, start: counttime}),
                                        _this.action('sendData')()
                                    );
                                },
                                didMount: function(e){
                                    addListener(e, this.phone, 'value', function(v){this.checkForm();}.bind(this));
                                }
                            });
                        }
                    });
                    createElem(parent, {
                        className: ['k50_widget_desc', 'toggle_tab'],
                        content: function(parent){
                            createElem(parent, {
                                tag: 'span',
                                text: 'Позвонить сейчас',
                                didMount: function(e){
                                    e.addEventListener('click', function(event){
                                        setState(this.tab, {componenttab: 'CallBack', titletab: this.tabs['CallBack'].title});
                                    }.bind(this), false);
                                }.bind(this)
                            });
                        }.bind(this),
                        didMount: function(e){
                            addListener(e, this.worktime, 'value', function(v){
                                if(v == this.worktime.listwork.timework){
                                    e.addClass('active');
                                }
                                else{
                                    e.removeClass('active');
                                }
                            }.bind(this));
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
            CallBack: {
                tag: 'div',
                className: ['k50_callback'],
                name: 'CallBack',
                parent: null,
                state: {},
                connect: ['tab', 'tabs'],
                content: function(parent){
                    Component.CallContainer.render({parent: parent, props: {state: this.props.state}});
                },
                didMount: function(e){
                    addListener(e, this.tab, 'componenttab', function(name){
                        this.name == name ? e.addClass('active') : e.removeClass('active');
                    }.bind(this));
                    setState(this.tab, {componenttab: 'CallBack', titletab: this.tabs['CallBack'].title});
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
            CallContent: {
                tag: 'div',
                className: ['k50_callback_content'],
                name: 'CallContent',
                parent: null,
                state: {
                    phone: {
                        value: ''
                    }
                },
                props: {},
                ref: {},
                connect: ['phone', 'time', 'tabs', 'tab'],
                content: function(parent){
                    createElem(parent, {
                        text: this.tabs['CallBack'].title,
                        className: ['k50_widget_title']
                    });
                    createElem(parent, {
                        className: ['k50_widget_wbody'],
                        content: function(parent){
                            createElem(parent, {
                                tag: 'img',
                                className: ['k50_widget_avatar'],
                                attribute: {
                                    src: 'images/celentano.jpg'
                                }
                            });
                            createElem(parent, {
                                className: ['k50_widget_avatar_desc', 'k50_widget_r', 'k50_widget_txtl'],
                                text: 'Спецусловия на покупку жилья. Оставьте свой номер и мы перезвоним вам через 25 секунд.',
                            });
                        }
                    });
                    Component.WidgetInput.render({
                        parent: parent,
                        props: {type: 'tel', value: '', label: null, state: this.phone, placeholder: 'Ваш телефон'},
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
                        className: ['k50_widget_row'],
                        content: function(parent){
                            Component.WidgetButton.render({
                                parent: parent,
                                connect: ['phone', 'time', 'confirm', 'timer'],
                                props: {text: 'Отправить'},
                                checkForm: function(){
                                    if(this.phone.value != '' && this.phone.value.length == 18){
                                        this.node.addClass('active');
                                    }
                                    else{
                                        this.node.removeClass('active');
                                    }
                                },
                                onClick: function(){
                                    var dateNow = new Date();
                                    var checked = true,
                                        send = {
                                            phone: this.phone.value,
                                            time: new Date(dateNow.getTime() + 25000)
                                        };
                                        
                                    setState(this.time, {value: send.time});
                                    var timercount = send.time.getTime() - dateNow.getTime();
                                    
                                    var countstore = {
                                        value: timercount,
                                        ordertime: this.time.value
                                    };
                                    countstore = JSON.stringify(countstore);
                                    localStorage.setItem('countstore', countstore);
                                    
                                    checked && (
                                        setState(this.confirm.status, {value: true}),
                                        setState(this.timer, {value: timercount, start: timercount}),
                                        _this.action('sendData')()
                                    );
                                },
                                didMount: function(e){
                                    addListener(e, this.phone, 'value', function(v){this.checkForm();}.bind(this));
                                }
                            });
                        }
                    });
                    createElem(parent, {
                        className: ['k50_widget_desc', 'toggle_tab', 'active'],
                        content: function(parent){
                            createElem(parent, {
                                tag: 'span',
                                text: 'Выбрать удобное время для звонка',
                                didMount: function(e){
                                    e.addEventListener('click', function(event){
                                        setState(this.tab, {componenttab: 'FeedBack', titletab: this.tabs['FeedBack'].title});
                                    }.bind(this), false);
                                }.bind(this)
                            });
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
                createOptionsHour: function(day){
                    var hours = [], dayReal;
                    if(this.worktime.value < 2 && day == 2){
                        dayReal = this.state.dayReal + 1 <= 6 ? this.state.dayReal + 1 : 0;
                    }
                    else{
                        dayReal = this.state.dayReal;
                    }
                    
                    for(var i = _settings.schedule[dayReal].from.h, j = 0; i <= _settings.schedule[dayReal].to.h; i++, j++){
                        hours.push({
                                value: j,
                                name: (i < 10 ? '0' + i : '' + i)
                              });
                    }
                    
                    if(!hours.length){
                        hours.push({
                            value: 0,
                            name: (_settings.schedule[dayReal].from.h < 10 ? '0' + _settings.schedule[dayReal].from.h : '' + _settings.schedule[dayReal].from.h)
                        });
                    }
                    
                    this.state.optionsHour.value = [];
                    if(this.state.day.value == 2){
                        setState(this.state.hour, {value: 0, title: hours[0].name});
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
                    if(timeis.now.h > timeis.end.h || (timeis.now.h == timeis.end.h && timeis.now.m >= timeis.end.m - 10)){
                        this.state.dayReal = this.state.dayReal + 1 <= 6 ? this.state.dayReal + 1 : 0;
                        day = 2;
                        optionsValue = 'tomorrow';
                    }
                    else{
                        day = 1;
                        optionsValue = 'morning';
                    }
                    /*
                    else if(timeis.now.h < timeis.start.h){
                        day = 1;
                        optionsValue = 'morning';
                    }
                    else{
                        day = 0;
                        optionsValue = 'full';
                    }*/
                    if(optionsValue != this.state.optionsDay.value){
                        setState(this.state.day, {value: day});
                        setState(this.state.optionsDay, {value: optionsValue});
                    }
                },
                connect: ['time', 'worktime'],
                content: function(parent){
                    setInterval(function(){
                        this.getTimeIs();
                    }.bind(this), 60000);
                    addListener(null, this.state.optionsDay, 'value', function(v){
                        this.createOptionsDay();
                    }.bind(this));
                    
                    addListener(null, this.state.day, 'value', function(v){
                        this.createOptionsHour(v);
                        this.time.day.value != v && setState(this.time.day, {value: v});
                    }.bind(this));
                    addListener(null, this.state.hour, 'value', function(v){
                        this.createOptionsMinute();
                        setState(this.time.hour, {value: parseInt(this.state.hour.title)});
                    }.bind(this));
                    addListener(null, this.state.minute, 'value', function(v){
                        setState(this.time.minute, {value: parseInt(this.state.minute.title)});
                    }.bind(this));
                    
                    addListener(null, this.time.day, 'value', function(v){
                        v != this.state.day.value && setState(this.state.day, {value: v});
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
                    createElem(parent, {
                        tag: 'span',
                        className: ['k50_widget_select_sep'],
                        text: ':'
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
                    value: 0,
                    top: 0
                },
                props: {
                    disabled: false
                },
                connect: ['resize'],
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
                        this.state.top = e.getBoundingClientRect().top;
                        status ? e.addClass('active') : e.removeClass('active');
                    }.bind(this));
                    
                    addListener(e, this.resize, 'value', function(v){
                        this.state.status && (setState(this.state, {status: false}), setState(this.state, {status: true}));
                    }.bind(this));
                    
                    addListener(e, this.state, 'value', function(v){
                        this.onChange(v);
                    }.bind(this));
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
                            var len = e.querySelectorAll('.k50_widget_select_option').length;
                            var winH = window.innerHeight
                            || document.documentElement.clientHeight
                            || document.body.clientHeight;
                            var dx = winH - this.props.state.top;
                            var lenBox = len * 30;
                            if((lenBox / 2 - 15) > lenBox - dx){
                                e.parentNode.hasClass('k50_widget_select_numeric') && (e.style.top = -(lenBox / 2 - 15) + 'px');
                            }
                            else{
                                e.parentNode.hasClass('k50_widget_select_numeric') && (e.style.top = -(lenBox - dx + 15) + 'px');
                            }
                        }
                    }.bind(this));
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
            Timer: {
                tag: 'div',
                className: ['k50_timer'],
                name: 'Timer',
                parent: null,
                connect: ['timer', 'time', 'confirm'],
                state: {
                    timeout: false
                },
                content: function(parent){
                },
                didMount: function(e){
                    addListener(e, this.timer, 'value', function(v){
                        this.timer.timeout && (clearTimeout(this.timer.timeout), this.timer.timeout = false);
                        
                        var nowDay = new Date().getDate();
                        var orderDay = new Date(this.time.value).getDate();
                        if(nowDay == orderDay){
                            if(v > 0){
                                e.innerHTML = this.timer.getTimeStr(v);
                                this.timer.timeout = setTimeout(function(){setState(this.timer, {value: v - 1000})}.bind(this), 1000);
                            }
                            else{
                                e.innerHTML = '00:00';
                                setState(this.timer, {status: false});
                                setTimeout(function(){setState(this.confirm.status, {value: false});}.bind(this), 1000);
                            }
                        }
                        else{
                            var h = this.time.hour.value < 10 ? '0' + this.time.hour.value : this.time.hour.value;
                            var m = this.time.minute.value < 10 ? '0' + this.time.minute.value : this.time.minute.value;
                            e.innerHTML = h + 'ч. ' + m + 'мин.';
                            
                            this.timer.timeout = setTimeout(function(){setState(this.timer, {value: v - 1000})}.bind(this), 1000);
                        }
                    }.bind(this));
                    !this.timer.status && (this.timer.value > 0) && setState(this.timer, {value: this.timer.value, status: true});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            Confirm: {
                tag: 'div',
                className: ['k50_confirm'],
                name: 'Confirm',
                connect: ['confirm', 'time', 'timer'],
                props: {
                    desc: {
                        resp: 'Ваш запрос на обратный звонок получен.',
                        ansvtoday: 'Мы перезвоним вам сегодня через ',
                        ansvtomorrow: 'Мы перезвоним вам завтра в '
                    }
                },
                parent: null,
                willMount: function(){
                    addListener(null, this.confirm.status, 'value', function(v){
                        v ? this.render({parent: this.parent}) : this.node.removeClass('active');
                    }.bind(this));
                    
                    var countTimeStorage = localStorage.getItem('countstore');
                    if(countTimeStorage){
                        var counttimeObj = JSON.parse(countTimeStorage);
                        var counttime = counttimeObj.value;
                        var time = new Date().getTime();
                        counttime = counttime - time;
                        if(counttime > 0){
                            this.confirm.status.value = true;
                            setState(this.time, {value: counttimeObj.ordertime});
                            setState(this.timer, {value: counttime, start: counttime});
                        }
                    }
                },
                content: function(parent){
                    createElem(parent, {
                        tag: 'div',
                        className: ['k50_confirm_box'],
                        content: function(parent){                  
                            createElem(parent, {
                                tag: 'div',
                                className: ['k50_confirm_desc'],
                                text: this.props.desc.resp
                            });
                            
                            var nowDay = new Date().getDate();
                            var orderDay = this.time.value ? new Date(this.time.value).getDate() : new Date().getDate();
                            
                            if(nowDay == orderDay){
                                createElem(parent, {
                                    tag: 'div',
                                    className: ['k50_confirm_desc'],
                                    text: this.props.desc.ansvtoday
                                });
                            }
                            else{
                                createElem(parent, {
                                    tag: 'div',
                                    className: ['k50_confirm_desc'],
                                    text: this.props.desc.ansvtomorrow
                                });
                            }
                          
                            Component.Timer.render({parent: parent});
                            
                            createElem(parent, {
                                tag: 'div',
                                className: ['k50_confirm_btn'],
                                text: 'ОК',
                                didMount: function(e){
                                    e.addEventListener('click', function(){
                                        document.body.click();
                                    }.bind(this), false);
                                }.bind(this)
                            });
                            createElem(parent, {
                                tag: 'div',
                                className: ['k50_confirm_btn'],
                                text: 'Отмена',
                                didMount: function(e){
                                    e.addEventListener('click', function(){
                                        setState(this.confirm.status, {value: false});
                                        setState(this.timer, {value: 0, status: false});
                                        localStorage.setItem('countstore', false);
                                    }.bind(this), false);
                                }.bind(this)
                            });
                        }.bind(this)
                    });
                },
                didMount: function(e){
                    this.confirm.status.value ? e.addClass('active') : e.removeClass('active');
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            Popup: {
                tag: 'div',
                className: ['k50_popup'],
                name: 'Popup',
                connect: ['popup'],
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
                sendData:
                    function(data){
                        var url = 'http://k-50.ru/widget-simple/widget/response.php',
                            data = {
                                phone: store.phone.value,
                                time: store.time.value
                            },
                            callback = 0;
                        data = JSON.stringify(data);
                        postRequest(url, data, callback);
                    },
                sendCancel:
                    function(data){
                        var url = 'http://k-50.ru/widget-simple/widget/response.php',
                            data = {
                                phone: store.phone.value,
                                time: 'cancel'
                            },
                            callback = 0;
                        data = JSON.stringify(data);
                        postRequest(url, data, callback);
                    }
            }
            return ar[action];
        };  
        
        this.renderWCall = function(){
            this.init = function(){
                var meta = document.querySelector('meta[name="viewport"]');              
                if(!meta){
                    meta = document.createElement('meta');
                    meta.name='viewport';
                    meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
                    document.getElementsByTagName('head')[0].appendChild(meta);
                }
                _this.app = Component.Widget.render();
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
                    setTimeout(function(){wcall.init();}, 1000);
                    //wcall.init();
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
