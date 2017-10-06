var Calculator = function(){
  var parent = document.body,
    btns = [
      {val: '7', action: 'print'},{val: '8', action: 'print'},{val: '9', action: 'print'},{val: '/', action: 'division'},{val: '\u2190', action: 'back'},
      {val: '4', action: 'print'},{val: '5', action: 'print'},{val: '6', action: 'print'},{val: '*', action: 'multiple'},{val: 'CE', action: 'lost'},
      {val: '1', action: 'print'},{val: '2', action: 'print'},{val: '3', action: 'print'},{val: '-', action: 'minus'},{val: 'C', action: 'wipe'},
      {val: '0', action: 'print'},{val: '.', action: 'dot'},{val: '\u00b1', action: 'sign'},{val: '+', action: 'plus'},{val: '=', action: 'calc'}
    ],
    state = {
      str: '',
      stack: 0,
      res: null,
      inputnum: true,
      num: 0,
      act: false,
      btn: false,
      error: false
    },
    store = [];
  
  this.init = function(elem){
    var self = this;
    elem && this.setParentelem(elem);
    if(window.addEventListener){ 
      window.addEventListener( "load", function(){self.run()}, false );
    }
    else if(window.attachEvent){ 
      window.attachEvent( "onload", function(){self.run()});
    }
    else if(window.onLoad){
      window.onload = self.run();
    }
  }
  
  this.run = function(){
    draw.drawContainer(this.getParent());
  }
  
  this.getState = function(){
    var st = {};
    for(var i in state){
      st[i] = state[i];
    }
    return st;
  }
  this.setState = function(obj){
    for(var i in obj){
      state[i] = obj[i];
    }
  }
  this.getStore = function(){
    if(!store.length){
      return false;
    }
    var storet = store.pop();
    return storet;
  }
  this.setStore = function(obj){
    var ob = {};
    
    for(var i in obj){
      ob[i] = obj[i];
    }
    store.push(ob);
  }
  
  this.getParent = function(){
    return parent;
  }
  this.setParent = function(elem){
    parent = elem;
  }
  this.getBtns = function(){
    return btns;
  }
}
var calculator = new Calculator;

var Action = function(){
  this.print = function(el){
    var num = el;//el.getAttribute('val');
    var state = calculator.getState();
    calculator.setStore(state);
    
    !state.inputnum && (calculator.setState({stack: 0, inputnum: true, store: state}), state = calculator.getState());
    num = state.stack == '0' ? num : state.stack + num;
    calculator.setState({stack: num, btn: 'num', num: num, error: false});
    this.render();
  }
  
  this.setAct = function(act){
    var state = calculator.getState();
    if(state.error) return false;
    calculator.setStore(state);
    calculator.setState({btn: act});
    state = calculator.getState();
    if(state.act){
      this.calculate();
    }
    state = calculator.getState();
    if(state.error) return false;
    
    calculator.setState({res: state.stack, inputnum: false, act: act});
    switch(act){
      case 'plus': calculator.setState({str: state.str + state.num + ' + '}); break;
      case 'minus': calculator.setState({str: state.str + state.num + ' - '}); break;
      case 'division': calculator.setState({str: state.str + state.num + ' / '}); break;
      case 'multiple': calculator.setState({str: state.str + state.num + ' * '}); break;
    }
    this.render();
  }
  
  this.plus = function(){
    this.setAct('plus');
  }
  this.minus = function(){
    this.setAct('minus');
  }
  this.division = function(){
    this.setAct('division');
  }
  this.multiple = function(){
    this.setAct('multiple');
  }
  
  this.cancel = function(){
    var store = calculator.getStore();
    calculator.setState(store);
    this.render();
  }
  
  this.dot = function(){
    var state = calculator.getState(),
      stack = parseFloat(state.stack);
    if(stack < 1 && stack > -1 && stack || state.stack.indexOf('.') != -1){
      return false;
    }
    else{
      calculator.setStore(state);
      //if(state.str == ''){ state.str = '0'; state.num = '0';}
      calculator.setState({stack: state.stack + '.', num: state.num + '.', inputnum: true});
      this.render();
    }
  }
  
  this.back = function(){
    var state = calculator.getState(),
      num  = state.stack,
      str = state.str;
    calculator.setStore(state);
    if(state.btn == 'calc'){
      return false;
    }
    num = num.slice(0, -1);
    !num.length ? (num = '0') : str.slice(0, -1);
    calculator.setState({stack: num, num: num, str: str});
    state = calculator.getState();
    calculator.setStore(state);
    this.render();
  }
  this.wipe = function(){
    var state = calculator.getState();
    calculator.setStore(state);
    calculator.setState({str: '', stack: '0', inputnum: false, act: false, res: '0', btn: false, num: '0'});
    this.render();
  }
  this.lost = function(){
    var state = calculator.getState();
    calculator.setStore(state);
    calculator.setState({stack: '0', num: '0'});
    this.render();
  }
  this.sign = function(){
    var state = calculator.getState(),
      num  = state.stack,
      str = state.str;
    calculator.setStore(state);
    calculator.setState({stack: (parseFloat(state.stack) * (-1)).toString()});
    this.render();
  }
  
  this.calc = function(){
    calculator.setState({btn: 'calc'});
    this.calculate();
  }
  
  this.calculate = function(){
    var state = calculator.getState(),
      res;
    if(state.stack.indexOf('.') != -1 && state.stack.indexOf('.') == state.stack.length - 1){
      state.stack += '0';
    }
    switch(state.act){
      case 'plus': res = parseFloat(state.res) + parseFloat(state.stack); break;
      case 'minus': res = parseFloat(state.res) - parseFloat(state.stack); break;
      case 'division': 
        if(!parseFloat(state.stack)){calculator.setState({error: true}); return false; break;}
        else{
          res = parseFloat(state.res) / parseFloat(state.stack); 
          break;
        }
      case 'multiple': res = parseFloat(state.res) * parseFloat(state.stack); break;
      default: res = state.stack;
    }
    calculator.setStore(state);
    if(state.btn == 'calc'){
      calculator.setState({str: '', stack: res.toString(), inputnum: false, act: false, num: res.toString()});
    }
    else{
      calculator.setState({stack: res.toString(), inputnum: false, act: false});
    }
    this.render();
  }
  
  this.keydown = function(event){
    var self = this;
    var keycode;
    if(!event) var event = window.event;
    if (event.keyCode) keycode = event.keyCode;
    else if(event.which) keycode = event.which;
    keycode = keycode.toString();
    console.log(keycode);
    switch(keycode){
      case '48': this.print(event.key); break;
      case '49': this.print(event.key); break;
      case '50': this.print(event.key); break;
      case '51': this.print(event.key); break;
      case '52': this.print(event.key); break;
      case '53': this.print(event.key); break;
      case '54': this.print(event.key); break;
      case '55': this.print(event.key); break;
      case '56': this.print(event.key); break;
      case '57': this.print(event.key); break;
      case '111': this.division(); break;
      case '191': this.division(); break;
      case '106': this.multiple(); break;
      case '109': this.minus(); break;
      case '189': this.minus(); break;
      case '107': this.plus(); break;
      case '8': this.back(); break;
      case '187': this.calc(); break;
      case '13': this.calc(); break;
      case '67': this.wipe(); break;
      case '27': this.wipe(); break;
      case '46': this.lost(); break;
    }
    event.preventDefault();
  }
  
  this.render = function(){
    var input = document.getElementById('input'),
      note = document.getElementById('input-note'),
      state = calculator.getState();
    input.value = state.stack;
    note.innerText = state.str;
  }
}
var action = new Action;

var Draw = function(){
  this.drawContainer = function(parent){
    var container = templates.get('container');
    parent.appendChild(container);
    container.appendChild(this.drawInputBox());
    var btns = calculator.getBtns();
    for(var i in btns){
      container.appendChild(this.drawBtn(btns[i]));
    }
  }
  this.drawInputBox = function(){
    var input_box = templates.get('input_box');
    input_box.appendChild(this.drawInputNote());
    input_box.appendChild(this.drawInput());
    return input_box;
  }
  this.drawInputNote = function(){
    var input_note = templates.get('input_note');
    return input_note;
  }
  this.drawInput = function(){
    var input = templates.get('input');
    input.setAttribute('onkeydown', 'action["keydown"](event)');
    input.setAttribute('readonly', true);
    return input;
  }
  this.drawBtn = function(item){
    var btn = templates.get('btn');
    btn.appendChild(this.drawBtnTable(item));
    return btn;
  }
  this.drawBtnTable = function(item){
    var btnT = templates.get('btn_table');
    btnT.appendChild(this.drawBtnCell(item));
    return btnT;
  }
  this.drawBtnCell = function(item){
    var btnC = templates.get('btn_cell');
    btnC.innerText = item.val;
    btnC.setAttribute('onclick', 'action[\''+item.action+'\'](\''+item.val+'\')');
    btnC.setAttribute('val', item.val);
    return btnC;
  }
}
var draw = new Draw;

var Templates = function(){
  this.get = function(tag){
    var el = document.createElement(this[tag].tagName);
    if('attr' in this[tag]){
      for(var i in this[tag].attr){
        el.setAttribute(i, this[tag].attr[i]);
      }
    }
    if('text' in this[tag]){
      el.innerText = this[tag].text;
    }
    return el;
  }
  this.container = {
    tagName: 'div',
    attr: {
      'class': 'container'
    }
  }
  this.input_box = {
    tagName: 'div',
    attr: {
      'class': 'input-box'
    }
  }
  this.btn = {
    tagName: 'div',
    attr: {
      'class': 'btn'
    }
  }
  this.input = {
    tagName: 'input',
    attr: {
      'value': '0',
      'id': 'input'
    }
  }
  this.input_note = {
    tagName: 'div',
    attr: {
      'class': 'input-note',
      'id': 'input-note'
    }
  }
  this.btn_table = {
    tagName: 'div',
    attr: {
      'class': 'btn-table'
    }
  }
  this.btn_cell = {
    tagName: 'div',
    attr: {
      'class': 'btn-cell'
    }
  }
}
var templates = new Templates;


calculator.init();