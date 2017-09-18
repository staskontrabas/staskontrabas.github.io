$(document).ready(function(){
  
  //вспомогательные функции
  $(window).on('resize', resizeRightSideBarScrollWrapper);
  $(window).scroll(function() {
    shadowToggle($('.header'), $(window).scrollTop());
  });
  $('.right-sidebar__scroll-wrapper').scrollbar({
    disableBodyScroll: true,
    onScroll: function(e){
      shadowToggle($('.list-control-wrapper'), e.scroll);
    }
  });
  resizeRightSideBarScrollWrapper();

  function resizeRightSideBarScrollWrapper() {
    var padTop = $('.list-control-wrapper').outerHeight();
    var elem = $('.right-sidebar__scroll-wrapper');
    elem.height(elem.parent().outerHeight() - padTop);
    elem.parent().css('padding-top', padTop + 'px');
  }

  function shadowToggle(elem, scrollPosition) {
    if(scrollPosition > 0) {
      if (!elem.hasClass('shadow')) elem.addClass('shadow');
    }else elem.removeClass('shadow');
  }

  var getObjectByPropValue = function(ar, prop, value){//поиск объекта по значению ключа
    var res = false;
    for(var k in ar){
      if(ar[k][prop] == value){
        res = ar[k];
        break;
      };
    }
    return res;
  };
  var getArrayByPropValue = function(ar, prop, value){//поиск объектов по значению ключа
    var res = [];
    for(var k in ar){
      if(ar[k][prop] == value){
        res.push(ar[k]);
      };
    }
    !res.length && (res = false);
    return res;
  };
  var getPlural = function(number, titles){
    var cases = [2, 0, 1, 1, 1, 2];
    return number + " " + titles[ (number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)] ];
  };
  /*
  Array.prototype.max = function() {
    return Math.max.apply(null, this);
  };

  Array.prototype.min = function() {
    return Math.min.apply(null, this);
  };
  */
  
	var dataBase = [],//база джойсонов
  
    State = function(){//класс состояния (выбранные и просматриваемые в данный момент игры)
      var gameSelectedList = [],
        computerList = {
          low: [],
          middle: [],
          high: []
        },
        gameGraphSet = {
          active: 'max',
          values: [{key: 'max', value: 'Макс.', link: 'low'}, {key: 'middle', value: 'Средняя', link: 'middle'}, {key: 'min', value: 'Мин.', link: 'high'}]
        },
        graphicList = [],
        ratingList = false,
        changeGameId;
      this.addgame = function(id){
        gameSelectedList.push(id);
        changeGameId = id;
        this.setComputerList();
        var compList = this.getComputerList(),
          gameGraphSet = this.getCurrentGraphSet();
        for(var k in gameGraphSet.values){
          if(compList[gameGraphSet.values[k].link].length){
            this.setCurrentGraphSet(gameGraphSet.values[k].key);
            break;
          }
          else{
            this.setCurrentGraphSet('none');
          }
        }
      };
      this.removegame = function(id){
        gameSelectedList.splice(gameSelectedList.indexOf(id), 1);
        changeGameId = id;
        this.setComputerList();
      };
      this.setComputerList = function(){
        computerList = gameSelector.calculate();
      };
      this.getComputerList = function(){
        return computerList;
      };
      this.getCurrentGraphSet = function(){
        return gameGraphSet;
      };
      this.setCurrentGraphSet = function(btn){
        gameGraphSet.active = btn;
      };
      this.getList = function(){
        return gameSelectedList;
      };
      this.getItem = function(i){
        return gameSelectedList[i];
      };
      this.setChangeGameId = function(id){
        changeGameId = id;
      };
      this.getChangeGameId = function(){
        return changeGameId;
      };
      return this;
    };
    var state = new State();
    
    var GameSelector = function(){//класс инициализации приложения и подбора компьютеров
      this.options = {//параметры инициализации
        range: {
          middle: 25,
          high: 40
        },
        json: ['gamelist','computers','gamesnameid','ratings']
      };
      
      this.setOptions = function(obj){
        this.options.range = obj.range || this.options.range;
        this.options.json = obj.json || this.options.json;
      };
      
      this.loadDB = function(k){
        var json = this.options.json,
          k = k || json.length,
          self = this;
        $.getJSON({
          url: 'json/' + json[k - 1] + '.json',
          success: function(res){
            var db = res;
            dataBase[json[k - 1]] = db[json[k - 1]];
            k--;
            k ? self.loadDB(k) : view.drawGamesList();
          },
          error: function(){
            console.log('error');
            return false;
          }
        });
      };
      
      this.init = function(obj){
        this.setOptions(obj);
        this.loadDB();
      };
      
      this.calculate = function(){
        var arGameid = state.getList(),//список id выбранных игр
          arComputersSelected = {
            low: [],
            middle: [],
            high: []
          },
          arRatings = [],
          arRatingsMin = [],
          Ratings = [],
          Graphics = [],
          strikeGraphics = [];
        
        for(var k in arGameid){//поиск рейтингов (Р) видеокарт (ВК) для каждой из выбранных игр
          arRatings.push(getArrayByPropValue(dataBase.ratings, 'gameid', getObjectByPropValue(dataBase.gamelist, 'id', arGameid[k]).gameid));
        }//получили массив массивов Р ВК для каждой игры
        
        var min = 0, val = 0;
        for(var a in arRatings){//поиск массива Р ВК игры с наименьшим общим средним значением Р ВК, в случае равных значений добавляем массив 
          for(var r in arRatings[a]){
            parseInt(arRatings[a][r].value) && (val += parseFloat(arRatings[a][r].value));
          }
          val = val / arRatings[a].length;
          if(!min){
            min = val;
            arRatingsMin.push(arRatings[a]);
            val = 0;
          }
          else if(min > val){
            min = val;
            arRatingsMin = [];
            arRatingsMin.push(arRatings[a]);
            val = 0;
          }
          else if(min == val){
            arRatingsMin.push(arRatings[a]);
            val = 0;
          }
        }
        
        if(arRatingsMin.length > 1){//выборка пересекающихся рейтингов и удаление рейтингов с нулевым значением
          for(var i = 1; i < arRatingsMin.length; i++){
            for(var j in arRatingsMin[0]){
              if(parseFloat(arRatingsMin[0][j].value) && parseFloat(arRatingsMin[0][j].value) == parseFloat(arRatingsMin[i][j].value)){
                Ratings.push(arRatingsMin[0][j]);
              }
            }
          }
        }
        else if(arRatingsMin.length){//удаление рейтингов с нулевым значением
          for(var i in arRatingsMin[0]){
            if(parseFloat(arRatingsMin[0][i].value)){
              Ratings.push(arRatingsMin[0][i]);
            }
          }
        }
        for(var r in Ratings){//поиск и сортировка компьтеров в зависимости от Р ВК
          var ar = [];
          if((parseFloat(Ratings[r].value) < this.options.range.middle) && parseFloat(Ratings[r].value)){
            arComputersSelected.low = arComputersSelected.low.concat(getArrayByPropValue(dataBase.computers, 'graphicid', Ratings[r].modelid));
          }
          else if((parseFloat(Ratings[r].value) >= this.options.range.high) && parseFloat(Ratings[r].value)){
            arComputersSelected.high = arComputersSelected.high.concat(getArrayByPropValue(dataBase.computers, 'graphicid', Ratings[r].modelid));
          }
          else{
            arComputersSelected.middle = arComputersSelected.middle.concat(getArrayByPropValue(dataBase.computers, 'graphicid', Ratings[r].modelid));
          }
        }
        
        return arComputersSelected;
      };
      
      return this;
    };
    var gameSelector = new GameSelector();
    
    var Actions = function(){//класс обработки пользовательских действий
      this.addGame = function(id){
        state.addgame(id);
        view.render();
      };
      this.removeGame = function(id){
        state.removegame(id);
        view.render();
      };
      this.toggleModal = function(id){
        id && state.setChangeGameId(id);
        view.modal.render();
      };
      this.toggleGraphSet = function(btn){
        btn && state.setCurrentGraphSet(btn);
        view.comp.render();
      };
      return this;
    };
    var actions = new Actions();

    var View = function(){//класс отрисовки html элементов
      this.drawGamesList = function(){
        var elem, items = dataBase.gamelist;
        var body = $('body');
        var parentNode = $('.grid-games');
        var bodyHeight;
        var winHeight = $(window).height();
        var countItem = 0;
        for(var k = 0; k < items.length; k += 2){
          elem = this.drawGameBlock(parentNode, items, countItem);
          countItem += 2;
          bodyHeight = body.outerHeight(true);
          if(bodyHeight > winHeight){
            break;
          }
        }
        var elemPos, self = this;
        $(window).scroll(function() {
          elemPos = elem[0].getBoundingClientRect();
          if(elemPos.bottom - 50 <= winHeight && countItem + 1 < items.length){
            elem = self.drawGameBlock(parentNode, items, countItem);
            countItem += 2;
          }
        });
      };
      this.drawGameBlock = function(parentNode, items, index){
        var elem;
        for(var k = index; k < index + 2; k++){
          elem = this.drawGameItem(parentNode, items[k]);
          this.drawBtnAddGame(elem, items[k].id);
          this.drawBtnRemoveGame(elem, items[k].id, templates.BtnRemoveGameFront());
        }
        return elem;
      };
      this.drawGameItem = function(parentNode, item){
        
        var img_list = item.images.img_list.value;
        var gameItem = templates.GameItem({
            id: item.id,
            gameid: item.gameid,
            img_list: img_list,
            img_title: item.images.img_title_thumb.value,
            name: item.name,
            genre: item.details.genre.value
          });
        gameItem = $(gameItem).appendTo(parentNode);
        gameItem.on('click', function(e){
          e.stopPropagation();
          e.preventDefault();
          actions.toggleModal(item.id);
        });
        return gameItem;
      };
      this.drawBtnAddGame = function(elem, id){
        var btn = templates.BtnAddGame();
        btn = $(btn).appendTo(elem);
        btn.on('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          actions.addGame(id);
        });
      };
      this.drawBtnRemoveGame = function(elem, id, template){
        var btn = template;
        btn = $(btn).appendTo(elem);
        btn.on('click', function(e){
          e.stopPropagation();
          e.preventDefault();
          actions.removeGame(id);
        });
      };
      this.drawRightSideGameList = function(){
        var list = state.getList();
        $('.select-games__title span').html(list.length);
        var items = dataBase.gamelist;
        $('.games-items-wrapper').html("");
        for(var k in list){
          var item = getObjectByPropValue(items, 'id', list[k]);
          this.drawRightSideGameItem(item);
        }
        this.drawCompCount();
        this.drawGraphBtnBox();
      };
      this.drawRightSideGameItem = function(item){
        var img = item.images.img_title_thumb.value;
        var elem = templates.RightSideGameItem({img: img});
        elem = $(elem).appendTo('.games-items-wrapper');
        this.drawBtnRemoveGame(elem, item.id, templates.BtnRemoveGameRight());
      };
      this.toggleSelected = function(){
        var gameId = state.getChangeGameId();
        if(state.getList().indexOf(gameId) != -1){
          $('.games-item-holder[prop-id="' + gameId + '"]').addClass('selected');
        }
        else{
          $('.games-item-holder[prop-id="' + gameId + '"]').removeClass('selected');
        }
      };
      this.toggleSidebar = function(){
        var rightSidebar = $('.right-sidebar');
        if(state.getList().length){
          if (!rightSidebar.hasClass('open')) {
            rightSidebar.addClass('open');
          }
        }else{
          rightSidebar.removeClass('open');
        }
      };
      this.modal = {
        modal: $('.modal'),
        modalInit: false,
        open: false,
        gameId: null,
        fotorama: null,
        elemDetail: null,
        elemInfo: null,
        elemGallery: null,
        checkOpen: function(){
          return this.open;
        },
        drawModalDetail: function(){
          if(!this.elemDetail){
            var elem = templates.modalDetail();
            var btnClose = templates.modalBtnClose();
            elem = $(elem).appendTo(this.modal);
            btnClose = $(btnClose).appendTo(elem);
            btnClose.on('click', function(e){
              e.preventDefault();
              e.stopPropagation();
              actions.toggleModal(0);
            });
            this.elemDetail = elem;
          }
          this.drawModalGallery(this.elemDetail);
          this.drawModalInfo(this.elemDetail);
          return this.elemDetail;
        },
        drawModalInfo: function(parent){
          this.elemInfo && this.elemInfo.remove();
          var game = getObjectByPropValue(dataBase.gamelist, 'id', this.gameId),
            btnSelect;
          if(state.getList().indexOf(this.gameId) != -1){
            btnSelect = 'remove'; 
            game['btn_select_game'] = $(templates.modalBtnRemoveGame()).attr('id','btn_'+ btnSelect +'_game').get(0).outerHTML;
          }
          else{
            btnSelect = 'add';
            game['btn_select_game'] = $(templates.modalBtnAddGame()).attr('id','btn_'+ btnSelect +'_game').get(0).outerHTML;
          }
          
          var elem = templates.modalInfo(game);
          elem = $(elem).appendTo(parent);
          var id = this.gameId,
            self = this;
          $('#btn_'+ btnSelect +'_game').on('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            switch(btnSelect){
              case 'add': actions.addGame(id); break;
              case 'remove': actions.removeGame(id); break;
            }
            self.drawModalInfo(parent);
          });
          this.elemInfo = elem;
          return elem;
        },
        drawModalGallery: function(parent){
          if(!this.elemGallery){
            var elem = templates.modalGallery();
            elem = $(elem).appendTo(parent);
            this.elemGallery = elem;
          }
          this.drawModalFotorama(this.elemGallery);
        },
        drawModalFotorama: function(parent){
          var arImg = [],
            items = dataBase.gamelist,
            item = getObjectByPropValue(items, 'id', this.gameId),
            imgList = item.images.img_detail.value;
          for(var k in imgList){
            arImg.push({img: imgList[k].img_big, thumb: imgList[k].img_thumb});
            //arImg.push({img: imgList[k].img_big});
          }
          item.video.src && arImg.push({video: item.video.src, thumb: item.video.preview});
          if(!this.fotorama){
            var elem = templates.modalFotorama();
            elem = $(elem).appendTo(parent);
            var $fotorama = elem.fotorama({
              height: 500,
              data: arImg
            });
            this.fotorama = $fotorama.data();
          }
          else{
            this.fotorama.fotorama.load(arImg);
          }
        },
        render: function(){
          if(this.open){
            this.modal.scrollTop(0);
            this.modal.removeClass('open'); 
            $('body').removeClass('overflow'); 
            this.open = false;
            return false;
          }
          this.open = true;
          this.gameId = state.getChangeGameId();
          this.modal.addClass('open');
          $('body').addClass('overflow');
          var innerModel = this.drawModalDetail();
          if(!this.modalInit){
            innerModel.on('click', function(e){
              e.preventDefault();
              e.stopPropagation();
            });
            this.modal.on('click', function(e){
              e.preventDefault();
              e.stopPropagation();
              actions.toggleModal(0);
            });
            this.modalInit = true;
          }
        }
      };
      this.drawRightSideCompList = function(){
        var list = state.getComputerList();
        $('.list-control__title span').html(list.length);
        var items = dataBase.gamelist;
        $('.games-items-wrapper').html("");
        for(var k in list){
          var item = getObjectByPropValue(items, 'id', list[k]);
          this.drawRightSideGameItem(item);
        }
      };      
      this.drawCompCount = function(){
        var list = state.getComputerList(),
          count = (function(){
            var c = 0;
            for(var i in list){
              c += list[i].length;
            }
            return c;
          })();
        $('.list-control__title').html(getPlural(count, ['компьютер', 'компьютера','компьютеров']));
      };
      this.drawGraphBtnBox = function(){
          var elem = $('.list-control__btn-wrapper'),
            compList = state.getComputerList();
          elem.empty();
          var graphSet = state.getCurrentGraphSet();
          for(var k in graphSet.values){
            this.drawGraphBtn({
              elem: elem,
              title: graphSet.values[k].value,
              classBtn: compList[graphSet.values[k].link].length ? graphSet.active == graphSet.values[k].key ? 'active' : '' : 'disable',
              key: graphSet.values[k].key
            });
          }
      };
      this.drawGraphBtn = function(props){
          var btn = templates.BtnGraph(props);
          btn = $(btn).appendTo(props.elem);
          btn.on('click',function(e){
            e.preventDefault();
            e.stopPropagation();
            $('.'+ $(this).attr('class').replace(/\s/ig, '') +'.active').removeClass('active');
            $(this).addClass('active');
            actions.toggleGraphSet(props.key);
          });
          return btn;
      };
      this.comp = {
        drawComps: function(){
          var elem = $('.list-pc-wrapper');
          var listComp = state.getComputerList();
          var graphSet = state.getCurrentGraphSet();
          elem.empty();
          for(var i in graphSet.values){
            if(graphSet.values[i].key == graphSet.active){
              graphSet = graphSet.values[i].link;
              break;
            }
          }
          listComp = listComp[graphSet];
          var item;
          for(var k in listComp){
            item = templates.Comp(listComp[k]);
            $(item).appendTo(elem);
          }
        },
        render: function(){
          this.drawComps();
          resizeRightSideBarScrollWrapper();
        }
      };
      this.render = function(){
        this.toggleSelected();
        this.toggleSidebar();
        this.drawRightSideGameList();
        this.comp.render();
      };
      return this;
    };
    var view = new View();
    
    var Templates = function(){//класс шаблонов html элементов
      this.Comp = function(props){
        var elem = `<div class="list-pc__item">
              <div class="list-pc__item__img-wrapper"><img class="list-pc__item__img" src="`+ props.img +`"></div>
              <div class="list-pc__item__text-wrapper"><a class="list-pc__item__link" href="`+ props.link +`" target="_blank">`+ props.name +`</a>
                <div class="list-pc__item__price-wrapper"><a class="list-pc__item__price" href="`+ props.link +`" target="_blank">`+ String(props.price).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1 ') +` ₽</a></div>
              </div>
            </div>`;
        return elem;
      };
      this.BtnGraph = function(props){
        var btn = `<a class="list-control__btn `+ props.classBtn +`" href="#">`+ props.title +`</a>`;
        return btn;
      };
      this.GameItem = function(props){
        var elem = `<div class="games-item-holder" prop-id="`+props.id+`" prop-gameid="`+props.gameid+`">
                    <div class="games-item__shade"></div>
                    <div class="games-item__img" style="background-image: url(`+props.img_list[0]+`);"></div>
                    <div class="games-item__img-wrapper">
                      <ul class="games-item__img-list">`;
        for(var k in props.img_list){
          elem += `<li class="games-item__img-list__item"  style="background-image: url(`+props.img_list[k]+`);"></li>`;
        }
        
        elem +=`                        
                      </ul>
                    </div>
                    <div class="games-item__title-wrapper"><img class="games-item__title__img" src="`+props.img_title+`">
                      <p class="games-item__title__text">`+props.name+`
                      </p>
                    </div>
                    <div class="games-item__type-wrapper">
                      <p class="games-item__type__text">`+props.genre+`</p>
                    </div>
                  </div>`;
        return elem;
      };
      this.BtnRemoveGameFront = function(){
        var btn = `<div class="games-item__selected">
                      <div class="games-item__selected-wrapper"><img class="games-item__selected__icon" src="img/grid-games/game-icon-choosed.png"><span class="games-item__selected__text">Выбрано</span></div><a class="games-item__remove" href="#"><img class="games-item__remove__img" src="img/grid-games/game-icon-choosed-remove.png"><span class="games-item__remove__text">Убрать из выбора</span></a>
                    </div>`;
        return btn;
      };
      this.BtnRemoveGameRight = function(){
        var btn = `<a class="game-item__btn-delete" href="#"></a>`;
        return btn;
      };
      this.computerItem = function(props){
        var elem = `<div class="list-pc__item">
              <div class="list-pc__item__img-wrapper"><img class="list-pc__item__img" src="img/list-pc/pc-item_03.png"></div>
              <div class="list-pc__item__text-wrapper"><a class="list-pc__item__link" href="http://www.xcom-shop.ru/asus_g20cb-ru018t_522179.html" target="_blank">Acer Aspire<br>TC-704 DM</a>
                <div class="list-pc__item__price-wrapper"><a class="list-pc__item__price" href="http://www.xcom-shop.ru/asus_g20cb-ru018t_522179.html" target="_blank">254 432 ₽</a></div>
              </div>
            </div>`;
        return elem;
      };
      this.RightSideGameItem = function(props){
        var elem = `<div class="game-item" style="background-image: url(`+props.img+`);"></div>`;
        return elem;
      };
      this.BtnAddGame = function(){
        var elem = `<a class="games-item__add-btn" href="#"><img src="img/grid-games/game-hover-icon-white.png"><span class="games-item__add-text">Добавить в выбор</span></a>`
        return elem;
      };
      this.modalDetail = function(){
        var elem = `<div class="game-detail-wrapper"></div>`;
        return elem;
      };
      this.modalBtnClose = function(){
        var btn = `<a class="modal-close" href="#"><img src="img/modal-game-detail/modal_close.png"></a>`;
        return btn;
      };
      this.modalGallery = function(){
        var elem = `<div class="game-detail__gallery-wrapper" style="width: 800px; min-height: 500px;"></div>`;
        return elem;
      };
      this.modalFotorama = function(){
        var elem = `<div class="fotorama" data-auto="false" data-nav="thumbs" data-width="100%" data-minheight="500" data-arrows="false" data-thumbBorderWidth="2" data-thumbwidth="89" data-thumbheight="50" style="width: 800px; min-height: 500px;"></div>`;
        return elem;
      };
      this.modalBtnAddGame = function(){
        var btn = `<a class="game-detail__btn-add" href="#"><img class="game-detail__btn-add__icon" src="img/modal-game-detail/modal_icon-add-game.png"><span class="game-detail__btn-add__text">Добавить <br>в выбор</span></a>`;
        return btn;
      };
      this.modalBtnRemoveGame = function(){
        var btn = `<a class="game-detail__btn-delete" href="#"><img class="game-detail__btn-delete__icon" src="img/modal-game-detail/modal_icon-delete-game.png"><span class="game-detail__btn-delete__text">Убрать <br>из выбора</span></a>`;
        return btn;
      };
      this.modalInfo = function(props){
        var elem = `<div class="game-detail__info-wrapper">
          <div class="game-detail__info__right-sidebar">
            <img class="game-detail__info__img" src="`+ props.images.img_title.value +`">
            `+ props.btn_select_game +`
            <div class="game-detail__param-wrapper">
              <p class="game-detail__param__title">`+ props.details.release.title +`</p>
              <p class="game-detail__param__val">`+ props.year +`</p>
            </div>
            <div class="game-detail__param-wrapper">
              <p class="game-detail__param__title">`+ props.details.genre.title +`</p>
              <p class="game-detail__param__val">`+ props.details.genre.value +`</p>
            </div>
            <div class="game-detail__param-wrapper">
              <p class="game-detail__param__title">`+ props.details.platform.title +`</p>
              <p class="game-detail__param__val"> `+ (function(){
                var str = '';
                for(var k in props.details.platform.value){
                  str += `<span>`+ (function(){if(parseInt(k) != 0) return `, `; else return '';})() + props.details.platform.value[k] +`</span>`;
                }
                return str;
              })() +`
            </div>
          </div>
          <div class="game-detail__info__content">
            <p class="game-detail__info__title">`+ props.name +`</p>
            <p class="game-detail__info__text">`+ props.description.replace('\\n','</p><p class="game-detail__info__text">') +`</p>
            <hr>
            <div class="game-detail__developers-wrapper">
              <p class="game-detail__developers__text"><span>Официальный сайт: </span><a class="game-detail__link" href="`+ props.links.ofsite.link +`">`+ props.links.ofsite.value +`</a></p>
              <p class="game-detail__developers__text"><span>Разработчик: </span><a class="game-detail__link" href="`+ props.links.developer.link +`">`+ props.links.developer.value +`</a></p>
              <p class="game-detail__developers__text"><span>Издатель: </span><a class="game-detail__link" href="`+ props.links.company.link +`">`+ props.links.company.value +`</a></p>
            </div>
            <p class="game-detail__info__subtitle">Материалы про игру`+ (function(){
                var str = '';
                for(var k in props.about){
                  str += `<p class="game-detail__link-wrapper"><a class="game-detail__link" href="`+ props.about[k].link +`">`+ props.about[k].value +`</a></p>`;
                }
                return str;
              })() +`
            </p>
          </div>
        </div>`;
        return elem;
      };
      
      return this;
    };
    var templates = new Templates();
    
    
    
    var params = {//параметры инициализации
      range: {
        middle: 60,
        high: 100
      },
      json: ['gamelist','computers','gamesnameid','ratings']
    }
    
    gameSelector.init(params);//пуск

});