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
                },
                ChatHistory: [],
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
                            var handler = _this.action(clone.action[iaction].name),
                                name = clone.name;
                            if (window.addEventListener) {
                                elem.addEventListener(clone.action[iaction].type, handler, false);
                            }
                            else if(window.attachEvent){
                                elem.attachEvent('on' + clone.action[iaction].type, handler);
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
                    _state.Panel.elem = Component.WidgetPanel.render({parent: parent});
                    Component.WidgetContent.render({parent: parent});
                },
                text: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            BTN: {
                tag: 'div',
                className: ['k50_button', 'k50_callback_phone', 'k50_animation'],
                name: 'BTN',
                text: '<svg id="k50-callback-button" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" height="120px" viewBox="0 0 120 120" width="120px" version="1.1" y="0px" x="0px" xmlns:xlink="http://www.w3.org/1999/xlink"><g class="k50-ring"><path id="k50-track-background" d="m60 1c-32.585 0-59 26.415-59 59s26.415 59 59 59 59-26.415 59-59-26.415-59-59-59zm0 115c-30.928 0-56-25.072-56-56s25.072-56 56-56c30.928 0 56 25.072 56 56s-25.072 56-56 56z" fill="#1FB250"></path></g><g class="k50-wrapper"><circle class="k50-circle-back" cy="60" cx="60" r="34" fill="#1FB250"></circle><g class="k50-circle-front"><circle cy="60" cx="60" r="34" fill="#1FB250"></circle><path class="k50-icon-handset" d="m59.34 48.038c-0.843 0.181-1.681 0.434-2.504 0.778-6.003 2.52-9.252 8.718-8.221 14.78-0.042 0.26-0.04 0.527 0.072 0.786 0.316 0.733 1.178 1.074 1.923 0.763 0.746-0.313 1.094-1.162 0.778-1.896-0.011-0.024-0.034-0.041-0.046-0.063-0.819-4.893 1.81-9.887 6.652-11.917 0.363-0.152 0.73-0.275 1.099-0.384 0.308 0.082 0.639 0.089 0.956-0.044 0.746-0.313 1.094-1.161 0.778-1.896-0.255-0.589-0.86-0.905-1.476-0.853l-0.011-0.054zm7.877 4.865l0.855-13.908c-2.436 0.489-2.402 2.61-2.402 2.61l-0.473 5.671c-0.814 5.348 2.02 5.627 2.02 5.627zm-21.886 13.454c0.62-0.26 0.932-0.896 0.831-1.523l0.032-0.006c-1.627-7.491 2.303-15.316 9.738-18.437 0.873-0.366 1.76-0.634 2.653-0.845l-0.022-0.118c0.042-0.014 0.085-0.009 0.126-0.025 0.729-0.307 1.071-1.137 0.761-1.854s-1.153-1.052-1.882-0.745c-0.109 0.046-0.191 0.123-0.282 0.19-0.872 0.226-1.74 0.492-2.595 0.851-8.661 3.635-13.241 12.75-11.349 21.478l0.045-0.009c0.019 0.101 0.02 0.201 0.062 0.3 0.31 0.717 1.153 1.05 1.882 0.743zm29.689-26.205c-1.313-1.785-5.783-0.978-5.783-0.978l-0.982 14.23 0.313 0.267 1.793 0.85c0.318 0.267 0.414 0.961 0.414 0.961-1.289 4.879-3.496 7.473-3.496 7.473-3.616 6.393-6.278 8.244-6.278 8.244-0.65 0.539-1.199 0.369-1.199 0.369-0.475-0.002-2.29-1.375-2.29-1.375l-12.773 7.361c1.72 4.612 3.803 4.405 3.803 4.405 16.692-0.466 24.25-14.581 24.25-14.581 9.835-14.467 2.228-27.226 2.228-27.226zm-21.017 28.373s-5.689 2.388-9.379 5.004-0.963 1.07-0.371 2.759l12.28-7.089s-1.356-1.099-2.53-0.674z" fill="#FFFFFF"></path><path class="k50-icon-callback" d="m79 44.986h-38c-2.209 0-4 1.791-4 4v23.028c0 2.209 1.791 4 4 4h38c2.209 0 4-1.791 4-4v-23.028c0-2.209-1.791-4-4-4zm-20.5 23.014h-16c-0.829 0-1.5-0.672-1.5-1.5s0.671-1.5 1.5-1.5h16c0.828 0 1.5 0.672 1.5 1.5s-0.672 1.5-1.5 1.5zm0-7h-16c-0.829 0-1.5-0.672-1.5-1.5s0.671-1.5 1.5-1.5h16c0.828 0 1.5 0.672 1.5 1.5s-0.672 1.5-1.5 1.5zm0-7h-16c-0.829 0-1.5-0.672-1.5-1.5s0.671-1.5 1.5-1.5h16c0.828 0 1.5 0.672 1.5 1.5s-0.672 1.5-1.5 1.5zm20.5 5.005c0 1.656-1.344 3-3 3h-8c-1.657 0-3-1.344-3-3v-5c0-1.657 1.343-3 3-3h8c1.656 0 3 1.343 3 3v5z" fill="#FFFFFF"></path></g></g></svg>',
                parent: document.body,
                attribute: {
                    id: 'k50_callback_phone'
                },
                props: {},
                content: null,
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
                    Component.WidgetHeaderClose.render({parent: parent});
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
                            elem: null
                        },
                        CallBack: {
                            elem: null
                        },
                        FeedBack: {
                            elem: null
                        }
                    }
                },
                content: function(parent){
                    this.props.tabs.Chat.elem = Component.WidgetPanelTab.render({
                        parent: parent,
                        text: null,
                        action: [{
                            type: 'click',
                            name: 'displayChat'
                        }],
                        props: {
                            title: 'Чат',
                            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.333 16"><g transform="matrix(.13333 0 0 -.13333 0 16)"><path d="M51.988 99.03C23.28 99.03 0 81.14 0 59.03c0-10.82 5.62-20.66 14.73-27.85-.55-7.34-2.308-16.328-7.43-21.168 10.2 0 20.59 6.367 27.188 11.367 5.473-1.53 11.37-2.35 17.5-2.35 28.71 0 51.992 17.93 51.992 40 0 22.11-23.28 40-51.992 40z" class="k50_passive_icon"></path><path d="M121.13 55.172c4.382 5.816 6.882 12.61 6.882 19.88 0 22.108-23.282 40-51.992 40-12.66 0-24.258-3.482-33.25-9.224 4.218.78 8.68 1.21 13.25 1.21 30.89 0 55.968-19.686 55.968-43.98 0-9.57-3.867-18.437-10.468-25.667 6.57-5 17-11.4 27.19-11.4-7.26 6.87-7.77 22.14-7.58 29.184z" class="k50_passive_icon"></path></g></svg>'
                        },
                        //didMount: function(elem){ _state.Tabs.curtab == 'Chat' && elem.addClass('k50_widget_panel_tab_active');}
                    });
                    this.props.tabs.CallBack.elem = Component.WidgetPanelTab.render({
                        parent: parent,
                        text: null,
                        action: [{
                            type: 'click',
                            name: 'displayCallback'
                        }],
                        props: {
                            title: 'Звонки',
                            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 509.333 510.667"><g transform="matrix(.13333 0 0 -.13333 0 510.667)"><path d="M3800.08 784.36l-18.99 57.27c-45 133.75-192.54 273.24-328 310l-501.53 136.99c-135.97 36.99-330-12.74-429.49-112.27l-181.48-181.48c-659.65 178.24-1176.88 695.51-1354.89 1355l181.49 181.48c99.53 99.53 149.26 293.28 112.26 429.26l-136.75 501.76c-37 135.74-176.76 283.24-310.24 327.77l-57.26 19.22c-133.75 44.53-324.5-.51-423.99-100L79.69 3437.6C31.21 3389.36.2 3251.35.2 3250.88c-9.5-862.03 328.51-1692.5 938.24-2302.26C1546.68 340.38 2374.06 2.88 3233.55 10.103c4.54 0 146.53 30.507 195 78.75l271.53 271.527c99.49 99.49 144.49 290.23 100 423.98z" class="k50_passive_icon"></path></g></svg>'
                        },
                        //didMount: function(elem){ _state.Tabs.curtab == 'CallBack' && elem.addClass('k50_widget_panel_tab_active');}
                    });
                    this.props.tabs.FeedBack.elem = Component.WidgetPanelTab.render({
                        parent: parent,
                        text: null,
                        action: [{
                            type: 'click',
                            name: 'displayFeedback'
                        }],
                        props: {
                            title: 'Заявки',
                            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 848.57 990"><path d="M167.86 280.43H685.5l-135.44-136.7a125.85 125.85 0 1 0-248.84 2.1zM426.68 81.5a43.15 43.15 0 1 1-43.18 43.15 43.15 43.15 0 0 1 43.18-43.15zm201.36 469.83H225.33v69.52h402.71zM225.33 752.69h402.71v-69.52H225.33zm429.88-606.47s95.08 92.82 95.08 94.29v653.61H95.88V242.91c0-1.58 96.68-96.68 96.68-96.68H0V990h848.57V146.22zm-27.17 273.27H225.33V489h402.71z" style="fill-rule:evenodd" class="k50_passive_icon"></path></svg>'
                        },
                        //didMount: function(elem){ _state.Tabs.curtab == 'FeedBack' && elem.addClass('k50_widget_panel_tab_active');}
                    });
                    var e = this.props.tabs[_state.Tabs.curtab].elem,
                        x = e.offsetLeft,
                        w = e.clientWidth;
                    Component.WidgetPanelFrame.render({parent: parent, props: {x: x, w: w, tabs: this.props.tabs}});
                },
                text: null,
                create: render,
                render: function(o){
                    return this.create(o);
                },
                rerender: function(o){
                    var x = o.offsetLeft,
                        frame = document.querySelector('.k50_widget_panel_frame'),
                        container = document.querySelector('.k50_widget_panel_frame_container');
                    frame.style.left = x + 'px';
                    frame.style.width = o.clientWidth + 'px';
                    container.style.left = -x + 'px';
                  /*
                    while(_state.Panel.elem.firstChild){
                        _state.Panel.elem.removeChild(_state.Panel.elem.firstChild);
                    }
                    this.render({parent: _state.Panel.elem});
                    */
                }
            },
            WidgetPanelFrameContainer: {
                tag: 'div',
                className: ['k50_widget_panel_frame_container'],
                name: 'WidgetPanelFrameContainer',
                props: {
                    tabs: {}
                },
                parent: null,
                content: function(parent){
                    this.props.tabs.oMap(function(item){
                        var e = item.elem.cloneNode(true);
                        parent.appendChild(e);
                        for(var iservice in service){
                            e[iservice] = service[iservice];
                        }
                        e.style.width = item.elem.clientWidth + 'px';
                        e.addClass('k50_widget_panel_tab_active');
                    });
                },
                text: null,
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
                content: function(parent){
                    var e = Component.WidgetPanelFrameContainer.render({parent: parent, props: {tabs: this.props.tabs}});
                    e.style.left = -this.props.x + 'px';
                },
                text: null,
                didMount: function(elem){
                    elem.style.left = this.props.x + 'px';
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
                        text: this.props.title
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
                    if(!this.props.init){
                        _state.Tabs.components.oMap(function(item, key){
                            var componentElem = Component[key].render({parent: parent});
                            _state.Tabs.curtab != key && componentElem.addClass('k50_hidden');
                            item.elem = componentElem;
                        });
                        Component.WidgetContent.props.init = true;
                    }
                    //var componentElem = Component[_state.Tabs.curtab].render({parent: parent});
                    //_state.Tabs[_state.Tabs.curtab].elem = componentElem;
                },
                text: null,
                rerender: function(){
                    _state.Tabs.components.oMap(function(item, key){
                        _state.Tabs.curtab == key ? item.elem.removeClass('k50_hidden') : item.elem.addClass('k50_hidden');
                    });
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
                text: null,
                parent: null,
                content: function(parent){
                    Component.FeedContainer.render({parent: parent});
                },
                rerender: function(){
                    return;
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
                        attribute: {
                            placeholder: "Email"
                        }});
                    var phone = _state.Tabs.components.CallBack.props.phone;
                    Component.CallBackInput.render({
                        parent: parent,
                        attribute: {type: 'tel', placeholder: "Введите номер телефона", value: !phone ? '' : phone},
                        action: [{type:'input', name:'maskChecker'}, {type: 'focus', name: 'maskInit'}, {type: 'blur', name: 'maskClear'}],
                        didMount: function(el){
                            //_state.Tabs.components.CallBack.props.addListener(el, function(o){el.value = o.phone == '+7 (' || !o.phone ? '' : o.phone});
                            addListener('FeedBackPhone', _state.Tabs.components.CallBack.props, 'phone', function(v){el.value = v;});
                            //_state.Tabs.components.CallBack.props.phone.pub();
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
                className: ['k50_callback'],
                name: 'CallBack',
                text: null,
                parent: null,
                props: {
                    component: 'CallNow'
                },
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
                    component: 'CallNow'
                },
                content: function(parent){
                    _state.Tabs.components.CallBack.page.oMap(function(item){
                        if(item.elem){
                            //_state.removeListener(item.elem);
                            removeListener('CallBackPhone', _state.Tabs.components.CallBack.props, 'phone');
                            item.elem.parentNode.removeChild(item.elem);
                            item.elem = null;
                        }
                    });
                    var componentElem = Component[this.props.component].render({parent: parent});
                    _state.Tabs.components.CallBack.page[this.props.component].elem = componentElem;
                },
                text: null,
                willMount: function(){
                    var state = _state.Tabs.components.CallBack.page,//getState('CallBack'),
                        componentName;
                    for(var is in state){
                        if(state[is].status){
                            componentName = state[is].component;
                            break;
                        }
                    }
                    this.props['component'] = componentName;
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            CallNow: {
                tag: 'div',
                className: ['k50_callback_now'],
                name: 'CallNow',
                parent: null,
                props: {},
                content: function(parent){
                    Component.CallBackSpan.render({
                        parent: parent,
                        text: 'Спецусловия на покупку жилья.<br/>Оставьте свой номер и мы перезвоним вам'
                    });
                    var phone = _state.Tabs.components.CallBack.props.phone;
                    Component.CallBackInput.render({
                        parent: parent,
                        attribute: {type: 'tel', placeholder: "Введите номер телефона", value: !phone ? '' : phone},
                        action: [{type:'input', name:'maskChecker'}, {type: 'focus', name: 'maskInit'}, {type: 'blur', name: 'maskClear'}],
                        didMount: function(el){
                            //_state.Tabs.components.CallBack.props.addListener(parent, function(o){el.value = o.phone == '+7 (' || !o.phone ? '' : o.phone});
                            addListener('CallBackPhone', _state.Tabs.components.CallBack.props, 'phone', function(v){el.value = v;});
                        }
                    });
                    Component.CallBackBtn.render({parent: parent});
                    Component.CallBackDesc.render({
                        className: ['k50_callback_desc_link'],
                        parent: parent,
                        text: 'Позвонить позже',
                        action: [{
                            type: 'click',
                            name: 'setcallbefore'
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
                props: {},
                content: function(parent){
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
                    var phone = _state.Tabs.components.CallBack.props.phone;
                    Component.CallBackInput.render({
                        parent: parent,
                        attribute: {type: 'tel', placeholder: "Введите номер телефона", value: !phone ? '' : phone},
                        action: [{type:'input', name:'maskChecker'}, {type: 'focus', name: 'maskInit'}, {type: 'blur', name: 'maskClear'}],
                        didMount: function(el){
                            //_state.Tabs.components.CallBack.props.addListener(parent, function(o){el.value = o.phone == '+7 (' || !o.phone ? '' : o.phone});
                            addListener('CallBackPhone', _state.Tabs.components.CallBack.props, 'phone', function(v){el.value = v;});
                        }
                    });
                    Component.CallBackBtn.render({parent: parent});
                    Component.CallBackDesc.render({
                        className: ['k50_callback_desc_link'],
                        parent: parent,
                        text: 'Позвонить сейчас',
                        action: [{
                            type: 'click',
                            name: 'setcallnow'
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
                className: ['k50_chat'],
                name: 'Chat',
                parent: null,
                props: {},
                content: function(parent){
                    Component.ChatContainer.render({parent: parent});
                },
                text: null,
                rerender: function(){
                    if(_state.ChatHistoryBack.length){
                        var parent = document.querySelector('[name="chat-log"]');
                        _state.ChatHistoryBack.map(function(item){
                            Component.ChatMessageItem.render({parent: parent,  props: {text: item.msg, type: item.type}});
                        });
                        Component.ChatScrollbarWrap.rerender();
                    }
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
                parent: container.elem,
                content: function(parent){
                    //Component.ChatHead.render({parent: parent});
                    Component.ChatContent.render({parent: parent});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatHead: {
                tag: 'div',
                className: ['k50_chat_head'],
                name: 'ChatHead',
                parent: null,
                text: 'Chat',
                content: function(parent){
                  //console.log(Component);
                    //Component.ChatCloseWrap.render({parent: parent});
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
                attribute: {
                    name: 'chat-send-wrap'
                },
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
                attribute: {
                    name: 'chat-send-placeholder'
                },
                parent: null,
                children: null,
                text: 'Введите текст',
                content: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatSendInputClone: {
                tag: 'div',
                className: ['k50_chat_send_inclone'],
                name: 'ChatSendInputClone',
                parent: null,
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
                    contenteditable: 'true',
                    name: 'chat-send-input'
                },
                name: 'ChatSendInput',
                parent: null,
                children: null,
                action: [{
                    type: 'keypress',// keydown keyup paste',
                    name: 'typemessage'
                  },{
                    type: 'keydown',
                    name: 'checkmessage'
                  },{
                    type: 'keyup',
                    name: 'checkchat'
                  },{
                    type: 'mouseenter',
                    name: 'offwheel'
                  },{
                    type: 'mouseleave',
                    name: 'onwheel'
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
                    Component.ChatScrollbarWrap.render({parent: parent});
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
                className: ['k50_chat_log_wrap','k50_scrollable'],
                name: 'ChatLogWrap',
                parent: null,
                attribute: {
                    name: 'chat-log-wrap'
                },
                action: [{
                    type: 'scroll',
                    name: 'scrollcontent'
                  },{
                    type: 'mouseenter',
                    name: 'offwheel'
                  },{
                    type: 'mouseleave',
                    name: 'onwheel'
                }],
                didMount: function(el){
                    scbrWidth = el.getScrollBarWidth();
                    el.style.width = 'calc(100% + ' + scbrWidth + 'px)';
                },
                content: function(parent){
                    Component.ChatLog.render({parent: parent});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatScrollbarWrap: {
                tag: 'div',
                className: ['k50_chat_scrollbar_wrap k50_hidden'],
                name: 'ChatScrollbarWrap',
                attribute: {
                    name: 'chat-scrollbar-wrap'
                },
                parent: ['ChatContent'],
                rerender: function(){
                    var parent = document.querySelector('[name="chat-log-wrap"]'),
                        //top = parent.scrollHeight - parent.clientHeight,
                        wrapHeight = parent.clientHeight,
                        ChatScrollbar = document.querySelector('[name="chat-scrollbar"]'),
                        ChatScrollbarWrap = document.querySelector('[name="chat-scrollbar-wrap"]');
                    //this.element.style.top = top + 'px';
                    ChatScrollbarWrap.style.height = wrapHeight - 10 + 'px';
                    var scrollHandlerHeight = parseInt(ChatScrollbarWrap.clientHeight * parent.clientHeight / parent.scrollHeight);
                    ChatScrollbar.style.height = scrollHandlerHeight + 'px';
                    var top = parseInt(ChatScrollbarWrap.clientHeight * parent.scrollTop / parent.scrollHeight);
                    ChatScrollbar.style.top = top + "px";
                },
                content: function(parent){
                    Component.ChatScrollbar.render({parent: parent});
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatScrollbar: {
                tag: 'div',
                className: ['k50_chat_scrollbar'],
                name: 'ChatScrollbar',
                attribute: {
                    name: 'chat-scrollbar'
                },
                parent: null,
                action: [{
                    type: 'mousedown',
                    name: 'ondragscrollhandler'
                  }],
                content: null,
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatLog: {
                tag: 'div',
                className: ['k50_chat_log'],
                name: 'ChatLog',
                attribute: {
                    name: 'chat-log'
                },
                parent: null,
                content: function(parent){
                  /*
                    if(_state.ChatHistory.length){
                        _state.ChatHistory.map(function(item){
                            Component.ChatMessageItem.render({parent: parent, props: {text: item.msg, type: item.type}});
                        });
                    }
                    */
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
                    type: 'out'
                },
                content: function(parent){
                    Component.ChatMessageBody.render({parent: parent, text: this.props.text});
                    Component.ChatClear.render({parent: parent});
                },
                willMount: function(){
                    this.className.push('k50_chat_message_' + this.props.type);
                },
                create: render,
                render: function(o){
                    return this.create(o);
                }
            },
            ChatMessageBody: {
                tag: 'div',
                className: ['k50_chat_message_body'],
                attribute: {
                    mes: 'inner'
                },
                name: 'ChatMessageBody',
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
            //var Component = new Component();
            
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
                        event.preventDefault();
                        var elemValue = this.parentNode.querySelector('.k50_select_value');
                        elemValue.innerHTML = this.innerHTML;
                        elemValue.value = this.getAttribute('value');
                    },
                displayWidget:
                    function(){
                        //Component.WidgetWrap.render();
                        _state.button.elem.addClass('k50_novisible');
                        _this.app.removeClass('k50_widget_wrap_hidden');
                        !WSch && _this.action('socketConnect')();
                    },
                displayChat:
                    function(){
                        _this.action('displayTab')(this, 'Chat');
                    },
                displayCallback:
                    function(){
                        _this.action('displayTab')(this, 'CallBack');
                    },
                displayFeedback:
                    function(){
                        _this.action('displayTab')(this, 'FeedBack');
                    },
                displayTab:
                    function(e, tab){
                        //var parent = _state.Tabs.components[_state.Tabs.curtab].elem.parentNode;
                        //_state.Tabs.components[_state.Tabs.curtab].elem && parent.removeChild(_state.Tabs.components[_state.Tabs.curtab].elem);
                        _state.Tabs.components[_state.Tabs.curtab].status = false;
                        //_state.Tabs.components[_state.Tabs.curtab].elem = null;
                        _state.Tabs.curtab = tab;
                        _state.Tabs.components[tab].status = true;
                        Component.WidgetPanel.rerender(e);
                        Component.WidgetContent.rerender();
                        Component[tab].rerender();
                        //_state.Tabs.components[tab].elem = Component[tab].render({parent: parent});
                    },
                setcallbefore:
                    function(){
                        _state.Tabs.components.CallBack.page.CallNow.status = false;
                        _state.Tabs.components.CallBack.page.CallBefore.status = true;
                      /*
                        setState({
                            callBack: {
                                callNow: {status: false},
                                callBefore: {status: true}
                            }
                        });*/
                        var parent = _state.Tabs.components.CallBack.elem;
                        parent.removeChild(parent.firstChild);
                        Component.CallContainer.render({parent: _state.Tabs.components.CallBack.elem});
                    },
                setcallnow:
                    function(){
                        _state.Tabs.components.CallBack.page.CallNow.status = true;
                        _state.Tabs.components.CallBack.page.CallBefore.status = false;
                      /*
                        setState({
                            callBack: {
                                callNow: {status: false},
                                callBefore: {status: true}
                            }
                        });*/
                        var parent = _state.Tabs.components.CallBack.elem;
                        parent.removeChild(parent.firstChild);
                        Component.CallContainer.render({parent: _state.Tabs.components.CallBack.elem});
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
                        event.target.value = value;
                        setState(_state.Tabs.components.CallBack.props, {phone: value});
                     },
                maskInit: 
                    function(){
                        var phone = _state.Tabs.components.CallBack.props.phone;
                        if(!phone || phone == ''){
                            this.value = '+7 (';	
                        }
                        else{
                            this.value = phone;
                        }
                    },
                maskClear: 
                    function(){
                        if(this.value == '+7 ('){
                            this.value = '';	
                            setState(_state.Tabs.components.CallBack.props, {phone: this.value});
                        }
                    },
                widgetclose:
                    function(){
                        var event = event || window.event;
                        event.preventDefault();
                        _this.app.addClass('k50_widget_wrap_hidden');
                        _state.button.elem.removeClass('k50_novisible');
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
                stopScroll:
                    function(event){
                        var container = document.querySelector('[name="chat-scrollbar-wrap"]'),
                            content = _stopScroll.target,
                            scroll = document.querySelector('[name="chat-scrollbar"]'),
                            e = event || window.event,
                            delta = e.deltaY || e.detail || e.wheelDelta;
                        if(_stopScroll.status){
                            if(content.clientHeight + content.scrollTop >= content.scrollHeight && delta > 0){
                                event.preventDefault();
                            }
                            if(content.scrollTop <= 0 && delta < 0){
                                event.preventDefault();
                            }
                        }
                    },
                socketConnect:
                    function(){
                        //WSch = WS.connect("ws://" + gos_web_socket_server_host + ":" + gos_web_socket_server_port);//make uncom
                        //console.log('WSch',WS,WSch);
                        WSch && WSch.on("socket/connect", function(session) {
                            Session = session;
                            console.log(sessionId);
                            session.subscribe("chat/" + counterId + "/" + sessionId, function (uri, payload) {
                                //console.log("Received message", payload.msg);
                                //addMessage(payload.msg);

                                var incomingMessage = payload.msg;
                                var tt = logContentHeight - sendWrapHeight,
                                    ChatLog = document.querySelector('[name="chat-log"]'),
                                    ChatLogWrap = document.querySelector('[name="chat-log-wrap"]'),
                                    ChatLog = document.querySelector('[name="chat-log"]'),
                                    ChatScrollbarWrap = document.querySelector('[name="chat-scrollbar-wrap"]');

                                _state.ChatHistory.push({
                                    msg: incomingMessage,
                                    type: 'in'
                                });
                                Component.ChatMessageItem.render({parent: ChatLog, props: {text: incomingMessage, type: 'in'}});
                                if(ChatLog.clientHeight > tt){
                                    ChatLogWrap.style.height = tt + 'px';
                                    //var sendWrapHeight = components.chatSendWrap.element.clientHeight;
                                    Component.ChatScrollbarWrap.rerender();
                                    ChatScrollbarWrap.show();
                                };
                                ChatLogWrap.style.bottom = sendWrapHeight + 'px';
                                ChatLogWrap.scrollTo(0, ChatLogWrap.scrollHeight);
                            });
                        });
                    },
                sendmessage:
                    function(){
                        var ChatSendInput = document.querySelector('[name="chat-send-input"]'),
                            ChatLogWrap = document.querySelector('[name="chat-log-wrap"]'),
                            ChatLog = document.querySelector('[name="chat-log"]'),
                            ChatScrollbarWrap = document.querySelector('[name="chat-scrollbar-wrap"]'),
                            text = ChatSendInput.innerHTML;
                        if(!text || text == '' || text == 'undefined'){
                            return false;
                        }
                        _state.ChatHistory.push({
                            msg: text,
                            type: 'out'
                        });
                        
                        //Session.publish("chat/" + counterId + "/" + sessionId, text);//make uncom
                        
                        Component.ChatMessageItem.render({parent: ChatLog, props: {text: text, type: 'out'}});
                        ChatSendInput.innerHTML = '';
                            
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
                    },
                checkchat:
                    function(event) {
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
                      },
                checkmessage:
                    function(event) {
                          //var ChatScrollbarWrap = document.querySelector('[name="chat-scrollbar-wrap"]');
                          //ChatScrollbarWrap.addClass('k50_novisible');
                      },
                typemessage:
                    function(event){
                        var event = event || window.event,
                            keycode = event.charCode || event.keyCode;
                        //_this.action('socketConnect');
                        //!WSch && _this.action('socketConnect')();
                          
                        if(keycode == 13 && !event.shiftKey){
                            event.preventDefault();
                            _this.action('sendmessage')();
                            return false;
                        }
                        
                        //window.getComputedStyle(elem, null).getPropertyValue("background-color");
                    },
                scrollcontent:
                    function(event){
                        var event = event || window.event,
                            //container = document.querySelector('[name="chat-scrollbar-wrap"]'),
                            //content = document.querySelector('[name="chat-log-wrap"]'),
                            //scroll = document.querySelector('[name="chat-scrollbar"]');
                            content = event.target,//components.chatLogWrap.element,
                            container = content.parentNode.querySelector('[name="chat-log-wrap"]'),//getElementsByClassName('k50_chat_scrollbar_wrap')[0],
                            scroll = container.parentNode.querySelector('[name="chat-scrollbar"]');//getElementsByClassName('k50_chat_scrollbar')[0];
                        scroll.style.top = parseInt(container.clientHeight * content.scrollTop / content.scrollHeight) + "px";
                    },
                onMove: function(event){
                    if(_onMove.status){
                        /*var container = document.querySelector('[name="chat-scrollbar-wrap"]'),
                            content = document.querySelector('[name="chat-log-wrap"]'),
                            scroll = document.querySelector('[name="chat-scrollbar"]');*/
                        var scroll = _onMove.target,
                            container = scroll.parentNode,
                            content = container.parentNode.querySelector('.k50_scrollable'),//getElementsByClassName('k50_scrollable')[0],
                            y = _onMove.top,
                            end = event || window.event,
                            delta = end.pageY - _onMove.pageY;
                        scroll.style.top = Math.min(container.clientHeight - scroll.clientHeight, Math.max(0, y + delta)) + 'px';
                        content.scrollTop = parseInt(content.scrollHeight * scroll.offsetTop / container.clientHeight);
                    }
                },
                ondragscrollhandler:
                    function(event){
                        var start = event || window.event,
                            scroll = event.target;//document.querySelector('[name="chat-scrollbar"]');
                        scroll.addClass('.k50_chat_scrollbar-hover');
                        start.preventDefault();
                        _onMove.target = scroll;
                        _onMove.pageY = start.pageY;
                        _onMove.top = scroll.offsetTop;
                        _onMove.status = true;
                    },
                offdragscrollhandler:
                    function(){
                        if(_onMove.status){
                            var scroll = _onMove.target;//document.querySelector('[name="chat-scrollbar"]');
                            scroll.removeClass('.k50_chat_scrollbar-hover');
                            _onMove.target = null;
                            _onMove.pageY = null;
                            _onMove.top = null;
                            _onMove.status = false;
                        }
                    },
                offwheel:
                    function(event){
                        var event = event || window.event;
                        _stopScroll.target = event.target;
                        _stopScroll.status = true;
                    },
                onwheel:
                    function(){
                        _stopScroll.target = null;
                        _stopScroll.status = false;
                    },
                hideplaceholder:
                    function(){
                        var ChatSendPlaceholder = document.querySelector('[name="chat-send-placeholder"]');
                        ChatSendPlaceholder.hide();
                    },
                showplaceholder:
                    function(){
                        var ChatSendPlaceholder = document.querySelector('[name="chat-send-placeholder"]');
                        ChatSendPlaceholder.show();
                    }
            }
            return ar[action];
        };
            
        
        this.renderWCall = function(){
            this.init = function(){
                Component.BTN.render();
                _this.app = Component.WidgetWrap.render();
                document.addEventListener('mousewheel', _this.action('stopScroll'));
                document.addEventListener('mousemove', _this.action('onMove'));
                document.addEventListener('mouseup', _this.action('offdragscrollhandler'));
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
            if (window.addEventListener) {
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
