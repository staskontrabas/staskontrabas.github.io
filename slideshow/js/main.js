
var Slideshow = function(){
  var state = {
    pics: [],
    size: 0,
    width: 600,
    height: 300,
    curPic: 0,
    box: 0,
    go: true
  }
  this.init = function(obj){
    var self = this;
    var obj = obj || {width: 600, height: 300, pics: ['pic1.png','pic2.png','pic3.png']};
    if(window.addEventListener){ 
      window.addEventListener( "load", function(){self.run(obj)}, false );
    }
    else if(window.attachEvent){ 
      window.attachEvent( "onload", function(){self.run(obj)});
    }
    else if(window.onLoad){
      window.onload = self.run(obj);
    }
  }
  this.run = function(obj){//console.log(('pics' in obj));
    ('pics' in obj) && this.setPics(obj.pics);
    ('width' in obj) && this.setWidth(obj.width);
    ('height' in obj) && this.setHeight(obj.height);
    draw.drawContainer();
  }
  this.getBox = function(){
    return state.box;
  }
  this.setBox = function(el){
    state.box = el;
  }
  this.getPics = function(){
    return state.pics;
  }
  this.setPics = function(pics){
    state.pics = pics;
    state.size = pics.length;
  }
  this.getSize = function(){
    return {
      width: state.width,
      height: state.height,
      size: state.size
    }
  }
  this.setWidth = function(w){
    state.width = w;
  }
  this.setHeight = function(h){
    state.height = h;
  }
  this.setCurPic = function(i){
    state.curPic = i
  }
  this.getCurPic = function(){
    return state.curPic;
  }
  this.getGo = function(){
    return state.go;
  }
  this.setGo = function(go){
    state.go = go;
  }
  this.next = function(){
    if(!this.getGo()){ return false; }
    this.setGo(false);
    var curPic = this.getCurPic();
    if(this.getSize().size - 1 == curPic){
      curPic = 0;
    }
    else{
      curPic++;
    }
    this.setCurPic(curPic);
    var box = this.getBox();
    box.style.left = - this.getSize().width * curPic + 'px';
    this.setStage();
  }
  this.prev = function(){
    if(!this.getGo()){ return false; }
    this.setGo(false);
    var curPic = this.getCurPic();
    if(curPic){
      curPic--;
    }
    else{
      curPic = this.getSize().size - 1;
    }
    this.setCurPic(curPic);
    var box = this.getBox();
    box.style.left = - this.getSize().width * curPic + 'px';
    this.setStage();
  }
  this.setStage = function(){
    var pic = document.getElementById('pic'+this.getCurPic()),
      stage = document.getElementById('stage');
    pic = pic.cloneNode(true);
    pic.setAttribute('id', 'picstage');
    pic.style.opacity = 1;
    pic.style.filter = 'alpha(opacity=100)';
    if(stage.getElementsByTagName("img").length){
      this.fadeout(stage.childNodes[0], stage, pic, 100);
    }
    else{
      stage.appendChild(pic);
    }
  }
  this.fadeout = function(obj, stage, pic, alfa){
    obj.style.opacity -= 0.1;
    alfa -= 10;
    obj.style.filter = 'alpha(opacity='+alfa+')';
    var self = this;
    if(obj.style.opacity > 0 || alfa > 0){
      setTimeout(function(){self.fadeout(obj, stage, pic, alfa);},50);
    }
    else{
      stage.removeChild(obj);
      stage.appendChild(pic);
      this.setGo(true);
      return false;
    }
  }
}
var slideshow = new Slideshow();

var Draw = function(){
  this.drawContainer = function(){
    var container = templates.get('container');
    document.body.appendChild(container);
    container.appendChild(this.drawBox());
    container.appendChild(this.drawStage());
    slideshow.setStage();
    container.appendChild(this.drawStaff());
  }
  this.drawBox = function(){
    var box = templates.get('box');
    box.style.width = slideshow.getSize().width * slideshow.getSize().size + 'px';
    box.style.left = '0px';
    var pics = slideshow.getPics();
    for(var i in pics){
      box.appendChild(this.drawBoxEl(pics[i], i));
    }
    slideshow.setBox(box);
    return box;
  }
  this.drawStage = function(){
    var stage = templates.get('stage');
    return stage;
  }
  this.drawBoxEl = function(pic, ind){
    var boxEl = templates.get('boxEl');
    boxEl.style.width = slideshow.getSize().width + 'px';
    boxEl.appendChild(this.drawBoxElImg(pic, ind));
    return boxEl;
  }
  this.drawBoxElImg = function(pic, ind){
    var boxElImg = templates.get('boxElImg');
    boxElImg.setAttribute('src', 'img/'+pic);
    boxElImg.setAttribute('id', 'pic'+ind);
    return boxElImg;
  }
  this.drawStaff = function(){
    var staff = templates.get('staff');
    staff.appendChild(this.drawStaffArrow('prev'));
    staff.appendChild(this.drawStaffArrow('next'));
    staff.appendChild(this.drawStaffDesc());
    staff.appendChild(this.drawStaffBtn());
    return staff;
  }
  this.drawStaffArrow = function(dir){
    var staffArrow = templates.get('staffArrow'+dir);
    staffArrow.setAttribute('onclick','slideshow.'+dir+'()');
    return staffArrow;
  }
  this.drawStaffDesc = function(){
    var staffDesc = templates.get('staffDesc');
    return staffDesc;
  }
  this.drawStaffBtn = function(){
    var staffBtn = templates.get('staffBtn');
    return staffBtn;
  }
}
var draw = new Draw();

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
  this.box = {
    tagName: 'ul',
    attr: {
      'class': 'box',
      'id': 'box'
    }
  }
  this.stage = {
    tagName: 'div',
    attr: {
      'class': 'stage',
      'id': 'stage'
    }
  }
  this.boxEl = {
    tagName: 'li'
  }
  this.boxElImg = {
    tagName: 'img'
  }
  this.staff = {
    tagName: 'div',
    attr: {
      'class': 'staff'
    }
  }
  this.staffArrowprev = {
    tagName: 'div',
    attr: {
      'class': 'staff_arrow',
      'dir': 'prev'
    },
    text: '\u00ab'
  }
  this.staffArrownext = {
    tagName: 'div',
    attr: {
      'class': 'staff_arrow',
      'dir': 'next'
    },
    text: '\u00bb'
  }
  this.staffDesc = {
    tagName: 'div',
    attr: {
      'class': 'staff_desc'
    },
    text: 'Фотографиям вашего ребенка позавидуют даже звезды'
  }
  this.staffBtn = {
    tagName: 'div',
    attr: {
      'class': 'staff_btn'
    },
    text: 'НАЧАТЬ ОБУЧЕНИЕ \u00bb'
  }
}
var templates = new Templates();

slideshow.init({width: 600, height: 300, pics: ['pic1.png','pic2.png','pic3.png']});
