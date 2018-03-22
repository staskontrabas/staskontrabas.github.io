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
                    6:{off:false,from:{h:9,m:0},to:{h:21,m:20}},
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
            message = '',
            container = {
                elem: document.body
            },
            _stopScroll = {
                target: null,
                status: false
            },
            _onMove = {
                pageY: null,
                top: null,
                start: null
            },
            //WS = false,
            WSch = false,
            Session = false,
            _state = {
                button: {
                    status: true,
                    component: 'BTN',
                    elem: null
                },
                /*
                Panel: {
                    status: true,
                    elem: null
                },
                Tabs: {
                    curtab: 'CallBack',
                    components: {
                        Chat: {
                            status: false,
                            component: 'Chat',
                            elem: null
                        },
                        FeedBack: {
                            status: false,
                            component: 'FeedBack',
                            elem: null
                        },
                        CallBack: {
                            status: true,
                            component: 'CallBack',
                            elem: null,
                            props: {
                                phone: null,
                                day: null,
                                time: null
                            },
                            page: {
                                CallNow:{
                                    status: true,
                                    component: 'CallNow',
                                    elem: null
                                },
                                CallBefore: {
                                    status: false,
                                    component: 'CallBefore',
                                    elem: null
                                }
                            }
                        }
                    }
                },*/
                Tab: {
                    name: false,
                    status: false
                },
                PhoneNumber: {
                    phone: ''
                },
                ClientName: {
                    name: ''
                },
                ChatHistory: [],
                ChatStack: {
                    messages: []
                },
                ChatHistoryBack: [],
                Observers: {}
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
            removeListener = function(e, o, p){//e=event, o=object,p=property
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
            setState = function(o, value){
                inject(o, value);
                if(o.hasOwnProperty('observers')){
                    var arO = Object.keys(o.observers);
                    if(arO.length){
                        o.observers.oMap(function(item, index){
                            value.oMap(function(itemV, indexV){
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
                    var scrollWidth = div.offsetWidth - div.clientWidth;
                    document.body.removeChild(div);
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
            render = function(o){
                var o = o || {};
                var clone = {
                    clone: 'clone'
                };
                
                clone = Object.assign(clone, this);
                clone = inject(clone, o);
                
                if(clone.hasOwnProperty('willMount')){
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
                        elem.setAttribute(arKeys[iattr], clone.attribute[arKeys[iattr]]);
                    }
                }
                
                parent && parent.appendChild(elem);
                if(clone.hasOwnProperty('action')){
                    if(clone.action && clone.action.length){
                        for(var iaction = 0; iaction < clone.action.length; iaction++){
                            var handler = typeof clone.action[iaction].name == 'function' ? clone.action[iaction].name : _this.action(clone.action[iaction].name),
                                name = clone.name,
                                args = clone.state;
                            if (window.addEventListener) {
                                elem.addEventListener(clone.action[iaction].type, handler.bind(null, args), false);
                            }
                            else if(window.attachEvent){
                                elem.attachEvent('on' + clone.action[iaction].type, handler.bind(null, args), handler);
                            }
                        }
                    }
                }
                
                for(var iservice in service){
                    elem[iservice] = service[iservice];
                }

                //var callback = callback || 0;
                //callback && callback();
                
                clone.content && clone.content(elem);
                
                if(clone.hasOwnProperty('didMount')){
                    clone.didMount(elem);
                }
                
                return elem;
            };
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
                else{
                    clone[arKeys[i]] = o[arKeys[i]];
                }
            }
            return clone;
        }
        
        var map = function(o, f){
            var arKeys = Object.keys(o);
            for(var i = 0; i < arKeys.length; i++){
                f(o[arKeys[i]], arKeys[i]);
            }
        };
        
        Object.prototype.oMap = function(callback){
            var arKeys = Object.keys(this);
            for(var i = 0; i < arKeys.length; i++){
                callback(this[arKeys[i]], arKeys[i]);
            }
        };
        
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
            
        var Component = {
            WidgetWrap: {
                tag: 'div',
                className: ['k50_widget_wrap', 'k50_widget_wrap_hidden'],
                name: 'WidgetWrap',
                parent: document.body,
                props: {},
                content: function(parent){
                    Component.WidgetHeader.render({parent: parent});
                    Component.WidgetPanel.render({parent: parent});
                    Component.WidgetContent.render({parent: parent});
                },
                text: null,
                didMount: function(e){
                    isMobile() && e.addClass('k50_mobile');
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            BTN: {
                tag: 'div',
                className: ['k50_button', 'k50_callback_phone', 'k50_animation'],
                name: 'BTN',
                text: null,
                parent: document.body,
                attribute: {
                    id: 'k50_callback_phone'
                },
                setSVG: function(){
                    return '<svg id="k50-callback-button" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" height='+this.props.h+' viewBox="0 0 120 120" width='+this.props.w+' version="1.1" y="0px" x="0px" xmlns:xlink="http://www.w3.org/1999/xlink"><g class="k50-ring"><path id="k50-track-background" d="m60 1c-32.585 0-59 26.415-59 59s26.415 59 59 59 59-26.415 59-59-26.415-59-59-59zm0 115c-30.928 0-56-25.072-56-56s25.072-56 56-56c30.928 0 56 25.072 56 56s-25.072 56-56 56z" fill="#1FB250"></path></g><g class="k50-wrapper"><circle class="k50-circle-back" cy="60" cx="60" r="34" fill="#1FB250"></circle><g class="k50-circle-front"><circle cy="60" cx="60" r="34" fill="#1FB250"></circle><path class="k50-icon-handset" d="m59.34 48.038c-0.843 0.181-1.681 0.434-2.504 0.778-6.003 2.52-9.252 8.718-8.221 14.78-0.042 0.26-0.04 0.527 0.072 0.786 0.316 0.733 1.178 1.074 1.923 0.763 0.746-0.313 1.094-1.162 0.778-1.896-0.011-0.024-0.034-0.041-0.046-0.063-0.819-4.893 1.81-9.887 6.652-11.917 0.363-0.152 0.73-0.275 1.099-0.384 0.308 0.082 0.639 0.089 0.956-0.044 0.746-0.313 1.094-1.161 0.778-1.896-0.255-0.589-0.86-0.905-1.476-0.853l-0.011-0.054zm7.877 4.865l0.855-13.908c-2.436 0.489-2.402 2.61-2.402 2.61l-0.473 5.671c-0.814 5.348 2.02 5.627 2.02 5.627zm-21.886 13.454c0.62-0.26 0.932-0.896 0.831-1.523l0.032-0.006c-1.627-7.491 2.303-15.316 9.738-18.437 0.873-0.366 1.76-0.634 2.653-0.845l-0.022-0.118c0.042-0.014 0.085-0.009 0.126-0.025 0.729-0.307 1.071-1.137 0.761-1.854s-1.153-1.052-1.882-0.745c-0.109 0.046-0.191 0.123-0.282 0.19-0.872 0.226-1.74 0.492-2.595 0.851-8.661 3.635-13.241 12.75-11.349 21.478l0.045-0.009c0.019 0.101 0.02 0.201 0.062 0.3 0.31 0.717 1.153 1.05 1.882 0.743zm29.689-26.205c-1.313-1.785-5.783-0.978-5.783-0.978l-0.982 14.23 0.313 0.267 1.793 0.85c0.318 0.267 0.414 0.961 0.414 0.961-1.289 4.879-3.496 7.473-3.496 7.473-3.616 6.393-6.278 8.244-6.278 8.244-0.65 0.539-1.199 0.369-1.199 0.369-0.475-0.002-2.29-1.375-2.29-1.375l-12.773 7.361c1.72 4.612 3.803 4.405 3.803 4.405 16.692-0.466 24.25-14.581 24.25-14.581 9.835-14.467 2.228-27.226 2.228-27.226zm-21.017 28.373s-5.689 2.388-9.379 5.004-0.963 1.07-0.371 2.759l12.28-7.089s-1.356-1.099-2.53-0.674z" fill="#FFFFFF"></path><path class="k50-icon-callback" d="m79 44.986h-38c-2.209 0-4 1.791-4 4v23.028c0 2.209 1.791 4 4 4h38c2.209 0 4-1.791 4-4v-23.028c0-2.209-1.791-4-4-4zm-20.5 23.014h-16c-0.829 0-1.5-0.672-1.5-1.5s0.671-1.5 1.5-1.5h16c0.828 0 1.5 0.672 1.5 1.5s-0.672 1.5-1.5 1.5zm0-7h-16c-0.829 0-1.5-0.672-1.5-1.5s0.671-1.5 1.5-1.5h16c0.828 0 1.5 0.672 1.5 1.5s-0.672 1.5-1.5 1.5zm0-7h-16c-0.829 0-1.5-0.672-1.5-1.5s0.671-1.5 1.5-1.5h16c0.828 0 1.5 0.672 1.5 1.5s-0.672 1.5-1.5 1.5zm20.5 5.005c0 1.656-1.344 3-3 3h-8c-1.657 0-3-1.344-3-3v-5c0-1.657 1.343-3 3-3h8c1.656 0 3 1.343 3 3v5z" fill="#FFFFFF"></path></g></g></svg>';
                },
                props: {w: isMobile() ? '90px' : '120px', h: isMobile() ? '90px' : '120px'},
                content: function(parent){
                    isMobile() && parent.addClass('k50_mobile');
                    parent.innerHTML = this.setSVG();
                },
                action: [{
                    type: 'click',
                    name: 'displayWidget'
                }],
                didMount: function(elem){
                    _state.button.elem = elem;
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
                text: 'K&#9733;50',
                props: {},
                content: function(parent){
                    isMobile() && Component.WidgetHeaderNavIcon.render({parent: parent});
                    Component.WidgetHeaderClose.render({parent: parent});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetHeaderNavIcon: {
                tag: 'div',
                className: ['k50_widget_header_nav_icon'],
                name: 'WidgetHeaderNavIcon',
                parent: null,
                state: {
                    status: false
                },
                props: {
                    status: false
                },
                content: function(parent){
                    for(var i = 0; i < 4; i++){
                        createElem(parent, {
                            tag: 'span'
                        });
                    }
                },
                text: null,
                action: [{
                    type: 'click',
                    name: function(props, event){
                        var event = event || window.event;
                        
                        event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        props.status ? _state.Tab.name ? (setState(props, {status: false}), setState(_state.Tab, {status: true})) : _this.action('widgetclose')() : (setState(props, {status: true}), setState(_state.Tab, {status: false}));
                    }
                }],
                didMount: function(e){
                    var state = this.state;
                    addListener(e, state, 'status', function(status){
                        status ? e.addClass('k50_open') : e.removeClass('k50_open');
                    });
                    addListener(e, _state.Tab, 'status', function(status){
                        status ? setState(state, {status: false}) : setState(state, {status: true});
                    });
                    _state.Tab.status ? setState(state, {status: false}) : setState(state, {status: true});
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
                content: null,
                text: null,
                action: [{
                    type: 'click',
                    name: 'widgetclose'
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
                props: {
                    tabs: {
                        Chat: {
                            elem: null,
                            status: false,
                            title: 'Задать вопрос менеджеру',
                            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.333 16"><g transform="matrix(.13333 0 0 -.13333 0 16)"><path d="M51.988 99.03C23.28 99.03 0 81.14 0 59.03c0-10.82 5.62-20.66 14.73-27.85-.55-7.34-2.308-16.328-7.43-21.168 10.2 0 20.59 6.367 27.188 11.367 5.473-1.53 11.37-2.35 17.5-2.35 28.71 0 51.992 17.93 51.992 40 0 22.11-23.28 40-51.992 40z" class="k50_passive_icon"></path><path d="M121.13 55.172c4.382 5.816 6.882 12.61 6.882 19.88 0 22.108-23.282 40-51.992 40-12.66 0-24.258-3.482-33.25-9.224 4.218.78 8.68 1.21 13.25 1.21 30.89 0 55.968-19.686 55.968-43.98 0-9.57-3.867-18.437-10.468-25.667 6.57-5 17-11.4 27.19-11.4-7.26 6.87-7.77 22.14-7.58 29.184z" class="k50_passive_icon"></path></g></svg>'
                        },
                        CallBack: {
                            elem: null,
                            status: true,
                            title: 'Заказать звонок',
                            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 509.333 510.667"><g transform="matrix(.13333 0 0 -.13333 0 510.667)"><path d="M3800.08 784.36l-18.99 57.27c-45 133.75-192.54 273.24-328 310l-501.53 136.99c-135.97 36.99-330-12.74-429.49-112.27l-181.48-181.48c-659.65 178.24-1176.88 695.51-1354.89 1355l181.49 181.48c99.53 99.53 149.26 293.28 112.26 429.26l-136.75 501.76c-37 135.74-176.76 283.24-310.24 327.77l-57.26 19.22c-133.75 44.53-324.5-.51-423.99-100L79.69 3437.6C31.21 3389.36.2 3251.35.2 3250.88c-9.5-862.03 328.51-1692.5 938.24-2302.26C1546.68 340.38 2374.06 2.88 3233.55 10.103c4.54 0 146.53 30.507 195 78.75l271.53 271.527c99.49 99.49 144.49 290.23 100 423.98z" class="k50_passive_icon"></path></g></svg>'
                        },
                        FeedBack: {
                            elem: null,
                            status: false,
                            title: 'Оставить заявку',
                            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 848.57 990"><path d="M167.86 280.43H685.5l-135.44-136.7a125.85 125.85 0 1 0-248.84 2.1zM426.68 81.5a43.15 43.15 0 1 1-43.18 43.15 43.15 43.15 0 0 1 43.18-43.15zm201.36 469.83H225.33v69.52h402.71zM225.33 752.69h402.71v-69.52H225.33zm429.88-606.47s95.08 92.82 95.08 94.29v653.61H95.88V242.91c0-1.58 96.68-96.68 96.68-96.68H0V990h848.57V146.22zm-27.17 273.27H225.33V489h402.71z" style="fill-rule:evenodd" class="k50_passive_icon"></path></svg>'
                        }
                    }
                },
                content: function(parent){
                    var props = this.props,
                        onClick = function(tab){
                            map(props.tabs, function(item, index){
                                index == tab 
                                    ? (setState(props.tabs[tab], {status: true}), setState(_state.Tab, {name: index}), setState(_state.Tab, {status: true}) )
                                    : item.status = false;
                            });
                        };
                    if(isMobile()){
                        var box = createElem(parent, {
                            tag: 'div',
                            className: ['k50_widget_panel_tab_box']
                        });
                        parent = box;
                    }
                    
                    map(this.props.tabs, function(item, index){
                        Component.WidgetPanelTab.render({
                            parent: parent,
                            text: null,
                            action: [{
                                type: 'click',
                                name: function(){
                                    onClick(index);
                                }
                            }],
                            props: {
                                title: item.title,
                                svg: item.svg
                            },
                            didMount: function(e){
                                item.elem = e;
                                //addListener(e, props.tabs[index], 'status', function(item) {
                                //e.addEventListener('click', onClick.bind(null, props), false);
                            }
                        });
                    });
                    
                    if(!isMobile()){
                        Component.WidgetPanelFrameContainer.render({
                            parent: parent,
                            content: function(parent){                            
                                map(props.tabs, function(item, index){
                                    var x = item.elem.offsetLeft,
                                        w = item.elem.clientWidth,
                                        frame = item.status && (Component.WidgetPanelFrame.render({
                                            parent: parent,
                                            props: {x: x, w: w},
                                            content: function(parent){
                                                Component.WidgetPanelFrameContent.render({parent: parent, props: {left: x, tabs: props.tabs}});
                                            }
                                        }), setState(_state.Tab, {name: index}));
                                });
                            }
                        });
                    }
                },
                text: null,
                didMount: function(e){
                    addListener(e, _state.Tab, 'status', function(status){
                        status ? e.removeClass('k50_open') : e.addClass('k50_open');
                    });
                    _state.Tab.name ? setState(_state.Tab, {status: true}) : setState(_state.Tab, {status: false});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetPanelFrameContainer: {
                tag: 'div',
                className: ['k50_widget_panel_frame_container'],
                name: 'WidgetPanelFrameContainer',
                parent: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetPanelFrame: {
                tag: 'div',
                className: ['k50_widget_panel_frame'],
                name: 'WidgetPanelFrame',
                props: {
                    x: null,
                    w: null,
                    tabs: {}
                },
                parent: null,
                content: null,
                text: null,
                didMount: function(elem){
                    var props = this.props;
                    elem.style.left = props.x + 'px';
                    elem.style.width = props.w + 'px';
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            WidgetPanelFrameContent: {
                tag: 'div',
                className: ['k50_widget_panel_frame_content'],
                name: 'WidgetPanelFrameContent',
                props: {
                    tabs: {}
                },
                parent: null,
                content: function(parent){
                    var props = this.props;
                    map(props.tabs, function(item){
                        var e = item.elem.cloneNode(true);
                        parent.appendChild(e);
                        for(var iservice in service){
                            e[iservice] = service[iservice];
                        }
                        e.style.width = item.elem.clientWidth + 'px';
                        e.addClass('k50_widget_panel_tab_active');
                        
                        addListener(e, item, 'status', function(status) {
                            e.style.width = item.elem.clientWidth + 'px';
                            parent.style.left = -item.elem.offsetLeft + 'px';
                            parent.parentNode.style.left = item.elem.offsetLeft + 'px';
                        });
                    });
                },
                text: null,
                didMount: function(elem){
                    elem.style.left = -this.props.left + 'px';
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
                props: {
                    init: false
                },
                content: function(parent){
                    var tabs = {
                        chat: {
                            e: Component.Chat.render({parent: parent}),
                            name: 'Chat'
                        },
                        callback: {
                            e: Component.CallBack.render({parent: parent}),
                            name: 'CallBack'
                        },
                        feedback: {
                            e: Component.FeedBack.render({parent: parent}),
                            name: 'FeedBack'
                        }
                    };
                    map(tabs, function(item, index){
                        addListener(item, _state.Tab, 'name', function(name){
                            item.name == name ? item.e.removeClass('k50_hidden') : item.e.addClass('k50_hidden');
                        });
                        
                        _state.Tab.name && item.name == _state.Tab.name && setState(_state.Tab, {name: item.name});
                    });
                },
                text: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            FeedBack: {
                tag: 'div',
                className: ['k50_feedback', 'k50_hidden'],
                name: 'FeedBack',
                text: null,
                parent: null,
                content: function(parent){
                    Component.FeedContainer.render({parent: parent});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            FeedContainer: {
                tag: 'div',
                className: ['k50_feedback_container'],
                name: 'FeedContainer',
                parent: null,
                content: function(parent){
                    Component.FeedContent.render({parent: parent});
                },
                text: null,
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
                props: {
                    phone: ''
                },
                content: function(parent){
                    createElem(parent, {
                        text: 'Вы можете оставить сообщение и мы перезвоним вам как можно скорее',
                        className: ['k50_feedback_span']
                    });
                    createElem(parent, {
                        tag: 'textarea',
                        className: ['k50_feedback_textarea'],
                        attribute: {
                            placeholder: "Ваше сообщение..."
                        }
                    });
                    Component.CallBackInput.render({
                        parent: parent,
                        attribute: {type: 'text', placeholder: "Ваше имя", value: !phone || phone == '' ? '' : phone},
                        action: [{type: 'input', name: function(event){
                                var event = event || window.event;
                                event.preventDefault ? event.preventDefault() : event.returnValue = false;
                                setState(_state.ClientName, {name: event.target.value});
                            }
                        }],
                        didMount: function(el){
                            addListener(el, _state.ClientName, 'name', function(v){el.value = v;});
                        }
                    });
                    Component.CallBackInput.render({
                        parent: parent, 
                        attribute: {
                            placeholder: "Email"
                        }});
                    //var phone = _state.Tabs.components.CallBack.props.phone;
                    Component.CallBackInput.render({
                        parent: parent,
                        attribute: {type: 'tel', placeholder: "Введите номер телефона", value: !this.props.phone || this.props.phone == '' ? '' : this.props.phone},
                        action: [{type:'input', name:'maskChecker'}, {type: 'focus', name: 'maskInit'}, {type: 'blur', name: 'maskClear'}],
                        didMount: function(el){
                            addListener(el, _state.PhoneNumber, 'phone', function(v){el.value = v;});
                        }
                    });
                    Component.CallBackBtn.render({parent: parent, text: 'Отправить'});
                },
                text: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallBack: {
                tag: 'div',
                className: ['k50_callback', 'k50_hidden'],
                name: 'CallBack',
                text: null,
                parent: null,
                content: function(parent){
                    Component.CallContainer.render({parent: parent});
                },
                rerender: function(){
                    return;
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallLogoWrap: {
                tag: 'div',
                className: ['k50_callback_logo_wrap'],
                name: 'CallLogoWrap',
                parent: null,
                props: {},
                content: function(parent){
                    Component.CallLogoItem.render({parent: parent});
                },
                text: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallLogoItem: {
                tag: 'div',
                className: ['k50_callback_logo_item'],
                name: 'CallLogoItem',
                parent: null,
                props: {},
                content: function(parent){
                    createElem(parent, {
                        tag: 'img',
                        attribute: {
                            src: 'https://www.google.ru/images/branding/googlelogo/2x/googlelogo_color_120x44dp.png'
                        }
                    });
                },
                text: null,
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
                props: {
                    component: null,
                    a:'a'
                },
                content: function(parent){
                    var props = this.props,
                        page = {
                        CallNow: {
                            e: Component.CallNow.render({parent: parent, props: {component: props}})
                        },
                        CallBefore: {
                            e: Component.CallBefore.render({parent: parent, props: {component: props}})
                        }
                    };
                    map(page, function(item, index){
                        addListener(item.e, props, 'component', function(c){
                            index == c ? item.e.show() : item.e.hide();
                        });
                    });
                },
                text: null,
                didMount: function(e){
                    setState(this.props, {component: 'CallNow'});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallNow: {
                tag: 'div',
                className: ['k50_callback_now', 'k50_hidden'],
                name: 'CallNow',
                parent: null,
                props: {
                    phone: ''
                },
                content: function(parent){
                    var props = this.props
                        phone = props.phone;
                    Component.CallBackSpan.render({
                        parent: parent,
                        text: 'Спецусловия на покупку жилья.<br/>Оставьте свой номер и мы перезвоним вам'
                    });
                    Component.CallBackInput.render({
                        parent: parent,
                        attribute: {type: 'text', placeholder: "Ваше имя", value: !phone || phone == '' ? '' : phone},
                        action: [{type: 'input', name: function(event){
                                var event = event || window.event;
                                event.preventDefault ? event.preventDefault() : event.returnValue = false;
                                setState(_state.ClientName, {name: event.target.value});
                            }
                        }],
                        didMount: function(el){
                            addListener(el, _state.ClientName, 'name', function(v){el.value = v;});
                        }
                    });
                    Component.CallBackInput.render({
                        parent: parent,
                        attribute: {type: 'tel', placeholder: "Введите номер телефона", value: !phone || phone == '' ? '' : phone},
                        action: [{type:'input', name:'maskChecker'}, {type: 'focus', name: 'maskInit'}, {type: 'blur', name: 'maskClear'}],
                        didMount: function(el){
                            addListener(el, _state.PhoneNumber, 'phone', function(v){el.value = v;});
                        }
                    });
                    Component.CallBackBtn.render({parent: parent});
                    Component.CallBackDesc.render({
                        className: ['k50_callback_desc_link'],
                        parent: parent,
                        text: 'Позвонить позже',
                        action: [{
                            type: 'click',
                            name: function(){
                                setState(props.component, {component: 'CallBefore'});
                            }
                        }]
                    });
                },//['SelectWrap'],
                text: null,
                didMount: function(){
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallBackSpan: {
                tag: 'div',
                className: ['k50_callback_span'],
                name: 'CallBackSpan',
                parent: null,
                props: {},
                content: null,
                text: '',
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallBackInput: {
                tag: 'input',
                className: ['k50_callback_input'],
                name: 'CallBackInput',
                parent: null,
                attribute: {
                    value: '',
                    name: 'input'
                },
                props: {},
                content: null,
                text: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallBackBtn: {
                tag: 'div',
                className: ['k50_callback_btn'],
                name: 'CallBackInput',
                parent: null,
                props: {},
                content: null,
                text: 'Жду звонка',
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallBackDesc: {
                tag: 'div',
                className: ['k50_callback_desc'],
                name: 'CallBackDesc',
                parent: null,
                props: {},
                content: null,
                text: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallBefore: {
                tag: 'div',
                className: ['k50_callback_before'],
                name: 'CallBefore',
                parent: null,
                props: {
                    phone: ''
                },
                content: function(parent){
                    var props = this.props,
                        phone = props.phone;
                    Component.CallBackSpan.render({
                        parent: parent,
                        text: 'К сожалению, мы сейчас не в офисе.<br/>Оставьте свой номер и мы перезвоним вам'
                    });
                    createElem(parent, {
                        didMount: function(parent){
                            Component.Select.render({
                                parent: parent,
                                props:{
                                    options: [{
                                        value: '1',
                                        name: 'сегодня',
                                        selected: true
                                      },{
                                        value: '2',
                                        name: 'завтра'
                                    }]
                                }
                            });
                            Component.Select.render({
                                parent: parent,
                                props:{
                                    options: [{
                                        value: '1',
                                        name: '09:00',
                                        selected: true
                                      },{
                                        value: '2',
                                        name: '10:00'
                                      },{
                                        value: '3',
                                        name: '11:00'
                                      },{
                                        value: '4',
                                        name: '12:00'
                                    }]
                                }
                            });
                            Component.ChatClear.render({paren: parent});
                        }
                    });
                    Component.CallBackInput.render({
                        parent: parent,
                        attribute: {type: 'text', placeholder: "Ваше имя", value: !phone || phone == '' ? '' : phone},
                        action: [{type: 'input', name: function(event){
                                var event = event || window.event;
                                event.preventDefault ? event.preventDefault() : event.returnValue = false;
                                setState(_state.ClientName, {name: event.target.value});
                            }
                        }],
                        didMount: function(el){
                            addListener(el, _state.ClientName, 'name', function(v){el.value = v;});
                        }
                    });
                    Component.CallBackInput.render({
                        parent: parent,
                        attribute: {type: 'tel', placeholder: "Введите номер телефона", value: !phone || phone == ''? '' : phone},
                        action: [{type:'input', name:'maskChecker'}, {type: 'focus', name: 'maskInit'}, {type: 'blur', name: 'maskClear'}],
                        didMount: function(el){
                            addListener(el, _state.PhoneNumber, 'phone', function(v){el.value = v;});
                        }
                    });
                    Component.CallBackBtn.render({parent: parent});
                    Component.CallBackDesc.render({
                        className: ['k50_callback_desc_link'],
                        parent: parent,
                        text: 'Позвонить сейчас',
                        action: [{
                            type: 'click',
                            name: function(){
                                setState(props.component, {component: 'CallNow'});
                            }
                        }],
                    });
                },
                text: null,
                didMount: function(){
                    
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            Select: {
                tag: 'div',
                className: ['k50_select'],
                name: 'Select',
                parent: null,
                props: {},
                content: function(parent){
                    Component.SelectWrap.render({parent: parent, props: this.props});
                },//['SelectWrap'],
                text: null,
                didMount: function(){
                    
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            SelectWrap: {
                tag: 'div',
                className: ['k50_select_wrap'],
                name: 'SelectWrap',
                parent: 'Select',
                content: function(parent){
                    var elemValue = Component.SelectValue.render({parent: parent});
                    if(this.props.hasOwnProperty('options')){
                        this.props.options.oMap(function(item){
                            if(item.hasOwnProperty('selected')){
                                item.selected && (elemValue.innerHTML = item.name);
                            }
                            Component.SelectOption.render({parent: parent, props: item});
                        });
                    }
                },//['SelectValue'],
                text: null,
                props: {},
                didMount: function(el){
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            SelectValue: {
                tag: 'div',
                className: ['k50_select_value'],
                name: 'SelectValue',
                parent: 'SelectWrap',
                content: null,
                text: 'Выберите',
                action: [{
                    type: 'click',
                    name: 'selectOpen'
                }],
                didMount: function(el){
                    return
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            SelectValueInput: {
                tag: 'input',
                className: ['k50_select_value_input'],
                name: 'SelectValueInput',
                parent: 'SelectValue',
                attribute: {
                    value: 0,
                    name: null,
                    text: null,
                    type: 'hidden'
                },
                action: [{
                    type: 'onchange',
                    name: 'selectChange'
                }],
                content: null,
                didMount: function(el){
                    return
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            SelectOption: {
                tag: 'div',
                className: ['k50_select_option'],
                name: 'SelectOption',
                parent: 'SelectWrap',
                content: null,
                text: null,
                attribute: null,
                props: {
                    value: null,
                    name: null
                },
                action: [{
                    type: 'click',
                    name: 'selectOption'
                }],
                willMount: function(){
                    this.attribute = {value: this.props.value};
                    this.text = this.props.name
                },
                didMount: function(el){
                    return
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            Chat: {
                tag: 'div',
                className: ['k50_chat', 'k50_hidden'],
                name: 'Chat',
                parent: null,
                props: {},
                content: function(parent){
                    Component.ChatContainer.render({parent: parent});
                },
                text: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatContainer: {
                tag: 'div',
                className: ['k50_chat_container'],
                name: 'ChatContainer',
                parent: null,
                content: function(parent){
                    Component.ChatContent.render({parent: parent});
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
                content: function(parent){
                    Component.СhatSendInputWrap.render({parent: parent});
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
                children: null,
                text: 'Введите текст',
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
                content: function(parent){
                    Component.ChatSendInput.render({parent: parent});
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
                action: [{
                    type: 'keypress',// keydown keyup paste',
                    name: 'typemessage'
                },{
                    type: 'keyup',
                    name: 'checkmessage'
                }],
                didMount: function(el){
                    el.style.width = 'calc(100% + ' + el.getScrollBarWidth() + 'px)';
                    el.focus();
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
                action: [{
                    type: 'click',
                    name: 'sendmessage'
                }],
                text: 'Send',
                content: null,
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
                content: function(parent){
                    Component.ChatLogWrap.render({parent: parent});
                    Component.ChatSendWrap.render({parent: parent});
                },
                didMount: function(elem){
                    logContentHeight = elem.clientHeight;
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatLogWrap: {
                tag: 'div',
                className: ['k50_chat_log_wrap','k50_custom-scroll'],
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
                className: ['k50_chat_log'],
                name: 'ChatLog',
                parent: null,
                content: null,
                didMount: function(e) {
                    addListener(e, _state.ChatStack, 'messages', function(item) {
                        var msg = item.pop();
                        Component.ChatMessageItem.render({
                            parent: e,
                            className: ['k50_chat_message_' + msg.type],
                            props: {
                                text: msg.msg,
                                type: msg.type,
                                time: '15:22:02',
                                date: '14.03.2018'
                            }
                        });
                        e.parentNode.scrollTo(0, e.parentNode.scrollHeight);
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
                props: {
                    text: '',
                    type: 'out',
                    time: '15:22:02',
                    date: '14.03.2018'
                },
                content: function(parent){console.log('item');
                    var t = Component.ChatMessageBody.render({parent: parent, text: this.props.text});
                    console.log(t);
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
                    time: '15:22:02',
                    date: '14.03.2018'
                },
                parent: null,
                content: function(parent){console.log('body');
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
                    Component.ChatMessageDate.render({parent: parent, text: this.props.date});
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
            }
        };
            
        this.action = function(action){
            var action = action || 0;
            
            if(!action) return false;
            
            var ar = {
                selectOpen:
                    function(event){
                        var event = event || window.event;
                        event.stopPropagation();
                        _this.action('selectClose')();
                        this.parentNode.parentNode.style.width = this.parentNode.offsetWidth + 'px';
                        this.parentNode.addClass('k50_select_open');
                        var Node = this.parentNode;
                        Node.closeSelect = function(){_this.action('selectClose')()};
                        
                        window.addEventListener('click', Node.closeSelect, false);
                    },
                selectClose:
                    function(event){
                        var open = document.querySelectorAll('.k50_select_open');
                        if(open.length){
                            for(var io = 0; io < 1; io++){
                                open[io].removeClass('k50_select_open');
                                window.removeEventListener('click', open[io].closeSelect, false);
                            }
                            return false;
                        }
                        else{
                            return true;
                        }
                    },
                selectOption:
                    function(event){
                        var event = event || window.event;
                        event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        var elemValue = this.parentNode.querySelector('.k50_select_value');
                        elemValue.innerHTML = this.innerHTML;
                        elemValue.value = this.getAttribute('value');
                    },
                displayWidget:
                    function(){
                        //Component.WidgetWrap.render();
                        _state.button.elem.addClass('k50_novisible');
                        _this.app.removeClass('k50_widget_wrap_hidden');
//                        !WSch && _this.action('socketConnect')();
                    },
                maskChecker:
                    function(event){
                        var event = event || window.event;
                        event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        
                        var mask = '+7(___)-___-__-__';
                        var maskParts = mask.match(/(_)+/g);
                        var regExParts = '';
                        
                        for(var i = 0; i < maskParts.length; i++){
                            regExParts += '([0-9]{0,' + maskParts[i].length + '})';
                        }
                        var regexpPattern = new RegExp(regExParts);
                            var x = event.target.value.replace(/(\+\d+|\D)/g, '').match(regexpPattern);
                            var emptyValues = event.target.value.match(/(_)+$/g);
                            var value = '+7 (' + (x[1] ? x[1] :'')  + (x[2] ? ') ' + x[2] : '') + (x[3] ? '-' + x[3] : '') + (x[4] ? '-' + x[4] :'') ;
                        //event.target.value = value;
                        setState(_state.PhoneNumber, {phone: value});
                     },
                maskInit: 
                    function(){
                        var phone = _state.PhoneNumber.phone;
                        if(!phone || phone == ''){
                            var value = '+7 (';
                            setState(_state.PhoneNumber, {phone: value});
                        }
                        else{
                            setState(_state.PhoneNumber, {phone: phone});
                        }
                    },
                maskClear: 
                    function(){
                        var phone = _state.PhoneNumber.phone;
                        if(phone == '+7 ('){
                            setState(_state.PhoneNumber, {phone: ''});
                        }
                    },
                widgetclose:
                    function(){
                        var event = event || window.event;
                        event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        _this.app.addClass('k50_widget_wrap_hidden');
                        _state.button.elem.removeClass('k50_novisible');
                        setTimeout(function(){
                            setState(_state.Tab, {name: false});
                            setState(_state.Tab, {status: false});
                        }, 500);
                        if(WSch){
                            WSch.on("socket/disconnect", function(error){
                                //error provides us with some insight into the disconnection: error.reason and error.code

                                console.log("Disconnected for " + error.reason + " with code " + error.code);
                            });
                        }
                        /*
                        var elem = document.getElementsByClassName('k50_widget_wrap')[0];
                        document.body.removeChild(elem);
                        while(elem.firstChild){console.log('close');
                            elem.removeChild(elem.firstChild);
                        }
                        */
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
                                    type: type,
                                    msg: msg
                                }];
                                
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
                    function(input){
                      /*
                        var ChatSendInput = document.querySelector('[name="chat-send-input"]'),
                            ChatLogWrap = document.querySelector('[name="chat-log-wrap"]'),
                            ChatLog = document.querySelector('[name="chat-log"]'),
                            ChatScrollbarWrap = document.querySelector('[name="chat-scrollbar-wrap"]'),
                            */
                        var text = input.innerHTML;
                        if(!text || text == '' || text == 'undefined'){
                            return false;
                        }
                        var ChatStack = [{
                            type: 'out',
                            msg: text
                        }];
                        setState(_state.ChatStack, {messages: ChatStack});
                        input.innerHTML = '';

//                        _session.publish(_sessionID, text);//make uncom
                        
                        //Session.publish("chat/" + counterId + "/" + sessionId, text);//make uncom
                        
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
                            keycode = event.charCode || event.keyCode;
                          
                        if(keycode == 13 && !event.shiftKey){
                            event.preventDefault ? event.preventDefault() : event.returnValue = false;
                            _this.action('sendmessage')(event.target);
                            return false;
                        }
                    }
            }
            return ar[action];
        };
            
        
        this.renderWCall = function(){
            this.init = function(){
              document.body.innerHTML = '<div style="width:100%; height:100%;background-color:#ccc;color:#000;">test</div>';
                var meta = document.querySelector('meta[name="viewport"]');              
                if(!meta){
                    meta = document.createElement('meta');
                    meta.name='viewport';
                    meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
                    document.getElementsByTagName('head')[0].appendChild(meta);
                }
                Component.BTN.render();
                _this.app = Component.WidgetWrap.render();
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
