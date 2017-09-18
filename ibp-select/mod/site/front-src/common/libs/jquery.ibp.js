(function( $ ){
  $.fn.ibp = function(options){
    var settings = $.extend({
      'location'         : 'xcom-shop.ru'
    }, options);
    
    var LOCATION = settings.location,
      CONTAINER = 'battery-selection',
      CONTAINER_ELEM,
      BLOCK_CHOICE = CONTAINER + '__choice',
      VENDORS = 'vendors',
      MODELS = 'models',
      ITEMS = 'items',
      MODELS_BOX = CONTAINER + '__' + MODELS + '__box',
      NOACTIVE = 'noactive',
      ACTIVE = 'active',
      SELECTED = 'selected',
      LOADING = 'loading',
      MIN_AMOUNT = 1,
      MAX_AMOUNT = 999;
    
    var State = function(){
      var stagePrev = {
          vendors: ACTIVE,
          models: NOACTIVE,
          items: NOACTIVE,
          vendorsItem: null,
          modelsItem: null,
          model_props: null
        },
        stage = {
          vendors: ACTIVE,
          models: NOACTIVE,
          items: NOACTIVE,
          vendorsItem: null,
          modelsItem: null,
          model_props: null
        },
        init = false,
        vendors = {},
        models = [],
        batteries = {
          inner: {
            all: 0,
            items: []
          },
          outer: {
            all: 0,
            items: []
          },
          params: {
            bat_prop_index: 0,
            bat_mod_index: 0,
            callback: 0
          }
        },
        hash = {
          vendor: 0,
          model: 0
        };
      
      this.setHash = function(obj){
        for(var k in obj){
          hash[k] = obj[k];
        }
        hash.vendor && (window.location.hash = '#vendor='+ hash.vendor);
        hash.model && (window.location.hash += '&model='+ hash.model);
      };
      this.getHash = function(){
        var str = window.location.hash;
        if(str && str.indexOf('vendor') != -1 && str.indexOf('model') != -1){
          str = str.slice(1);
          str = str.split('&');
          var ar = [];
          for(var kh in str){
            ar = str[kh].split('=');
            hash[ar[0]] = ar[1];
          }
          return hash;
        }
        else{
          return 0;
        }
      };
      this.getBatteries = function(prop){
        var prop = prop || null;
        if(prop) return batteries[prop];
        else return batteries;
      };
      this.setBatteries = function(prop, obj){
        for(var k in obj){
          batteries[prop][k] = obj[k];
        }
      };
      this.getInit = function(){
        return init;
      };
      this.setInit = function(val){
        init = val;
      };
      this.getStagePrev = function(){
        return stagePrev;
      };
      this.setStagePrev = function(obj){
        for(var k in obj){
          stagePrev[k] = obj[k];
        }
      };
      this.getStage = function(prop){
        var prop = prop || null;
        if(prop) return stage[prop];
        else return stage;
      };
      this.setStage = function(obj){
        for(var k in obj){
          stagePrev[k] = stage[k];
          stage[k] = obj[k];
        }
      };
      this.setVendors = function(obj){
        vendors = obj;
      };
      this.getVendors = function(){
          return vendors;
      };
      this.setModels = function(ar){
        models = ar;
      };
      this.getModels = function(){
          return models;
      };
        
      return this;
    };
    var state = new State();
    
    var Ibp = function(){
      this.hashfinder = function(){
        ;
      };
      this.init = function(elem){
        CONTAINER_ELEM = elem;
        
        var Hash = state.getHash();
        if(Hash){
          var getModels = function(){
            var arVendors = state.getVendors();
            for(var kv in arVendors){
              if(arVendors[kv].url == Hash['vendor']){
                state.setStage({vendorsItem: kv});
              }
            }
            ibp.getModels(Hash['vendor'], 0, getBattery);
          };
          var callback = function(){
            state.setStage({items: ACTIVE});
            view.render();
          };
          var getBattery = function(){
            var arModels = state.getModels();
            state.setStage({vendors: SELECTED});
            view.render();
            for(var km in arModels){
              if(arModels[km].product.fk_product == Hash['model']){
                state.setStage({modelsItem: arModels[km].product});
                break;
              }
            }
            state.setStage({vendors: SELECTED, models: SELECTED, items: LOADING});
            view.render();
            ibp.getModelProp(Hash['model'], callback);
          };
          ibp.getVendors(getModels);
        }
        else{
          state.setStage({vendors: ACTIVE});
          this.getVendors(view.render.bind(view));
        }
      };
      
      this.getVendors = function(callback){
        var callback = callback || null;
        $.ajax({
          url: 'http://www.'+ LOCATION +'/ajax_request/?interface=catalog_site&action=goodList&api_init_filters=1&type_url=ibp_i_stabilizator&pk_tree=2338&o=wd&list_page=1',
          type: 'GET',
          success: function(res){
            res = JSON.parse(res);
            var vendors = res.filters.response.vendor.dict;
            state.setVendors(vendors);
            callback && callback();
          },
          error: function(){
            console.log('error');
            return false;
          }
        });
      };
      
      this.getModels = function(url, page, callback){
        var all_page = 0,
          page = page || 1,
          callback = callback || null;
        
        $.ajax({
          url: 'http://www.'+ LOCATION +'/ajax_request/?interface=catalog_site&action=goodList&api_init_filters=1&type_url=ibp_i_stabilizator&vendor_url='+url+'&s=&pk_tree=2338&o=n&list_page='+ page,
          type: 'GET',
          success: function(res){
            res = JSON.parse(res);
            var models = res.data;
            !all_page && (all_page = res.all);
            state.setModels(state.getModels().concat(models));
            if(page == all_page){
              models = state.getModels();
              var idForRemove = [];
              for(var km in models){
                if(!models[km].product.image){
                  idForRemove.push(models[km].product.fk_product);
                }
              }
              for(var kr in idForRemove){
                for(var krm in models){
                  if(models[krm].product.fk_product == idForRemove[kr]){
                    models.splice(krm, 1);
                    break;
                  }
                }
              }
              state.setModels(models);
              callback && callback();
            }
            else{
              page++;
              ibp.getModels(url, page, callback);
            }
          },
          error: function(){
            console.log('error');
            return false;
          }
        });
      };
      
      this.getModelProp = function(id, callback){//APC BC650-RSX761 Back-UPS 650VA/360W
        var callback = callback || null;
        $.ajax({
          url: 'http://www.'+ LOCATION +'/ajax_request/?interface=catalog_desc&action=getDesc_json&fk_good='+ id +'&from='+ LOCATION +'',
          type: 'GET',
          success: function(res){
            res = JSON.parse(res);//console.log(res);
            var model_props = {inner:{count: null}, outer: {count: null}},
              arProps = res.product.specification.props,
              prop_1008 = 0, prop_25636 = 0, prop_37731 = 0, prop_42510 = 0;
            for(var k in arProps){
              if(k == 'prop_1008'){
                prop_1008 = parseInt(arProps[k].value);
              }
              if(k == 'prop_25636'){
                for(var i in arProps[k]){
                  prop_25636 = arProps[k][i].value;
                }
              }
              if(k == 'prop_37731'){
                prop_37731 = parseInt(arProps[k].value);
              }
              if(k == 'prop_42510'){
                for(var j in arProps[k]){
                  prop_42510 = arProps[k][j].value;
                }
              }
            }
            model_props['inner']['count'] = prop_1008;
            model_props['inner']['standart'] = prop_25636;
            model_props['outer']['count'] = prop_37731;
            model_props['outer']['standart'] = prop_42510;
            state.setStage({model_props: model_props});
                ibp.getBatteries(1, callback);
          },
          error: function(){
            console.log('error');
            return false;
          }
        });
      };
      
      this.getBatteries = function(page, callback){
        var callback = callback,
          all_page = 0,
          batteries = {
            inner: {
              all: 0,
              items: []
            },
            outer: {
              all: 0,
              items: []
            }
          },
          page = page || 1,
          model_props = state.getStage('model_props'),
          bat_prop = ['inner', 'outer'],
          bat_prop_index = state.getBatteries('params')['bat_prop_index'];
          
        !state.getBatteries('params')['callback'] && state.setBatteries('params', {callback: callback});
        !bat_prop_index && page == 1 && (state.setBatteries('inner', batteries.inner), state.setBatteries('outer', batteries.outer));
        if(bat_prop_index == bat_prop.length){
          state.setBatteries('params', {bat_prop_index: 0});
          state.getBatteries('params')['callback']();
          state.setBatteries('params', {callback: 0});
          return false;
        }
        if(!model_props[bat_prop[bat_prop_index]]['standart']){
          bat_prop_index++;
          state.setBatteries('params', {bat_prop_index: bat_prop_index});
          ibp.getBatteries(page, 0);
        }
        else{
          $.ajax({
            url: 'http://www.'+ LOCATION +'/ajax_request/?interface=catalog_site&action=goodList&api_init_filters=1&type_url=akkymylyatornaya_batareya_dlya_ibp_i_yniversalnaya&pk_tree=2338&prop_26193[value]=6654&prop_25637['+ model_props[bat_prop[bat_prop_index]]['standart'] +'][value]='+ model_props[bat_prop[bat_prop_index]]['standart'] +'&o=n&list_page='+ page,
            type: 'GET',
            success: function(res){
              res = JSON.parse(res);
              if(!all_page){
                all_page = parseInt(res.all);
                batteries[bat_prop[bat_prop_index]]['all'] = parseInt(res.total_rows_count);
                state.setBatteries(bat_prop[bat_prop_index], {all: batteries[bat_prop[bat_prop_index]]['all'] + state.getBatteries(bat_prop[bat_prop_index]).all});
              }
              if(all_page){
                batteries[bat_prop[bat_prop_index]]['items'] = res.data;
                state.setBatteries(bat_prop[bat_prop_index], {items: state.getBatteries()[bat_prop[bat_prop_index]]['items'].concat(batteries[bat_prop[bat_prop_index]]['items'])});
                if(page == all_page){
                  var batteries_mod = state.getBatteries(bat_prop[bat_prop_index]).items;
                  for(var kb in batteries_mod){
                    batteries_mod[kb].product['modules'] = [];
                    batteries_mod[kb].product['available'] = batteries_mod[kb].availability_block['available'];
                  }
                  state.setBatteries('params', {bat_prop_index: bat_prop_index});
                  ibp.getBatteryProps(batteries_mod);
                }
                else{
                  page++;
                  ibp.getBatteries(page, 0);
                }
              }
              else{
                bat_prop_index++;
                if(bat_prop_index == bat_prop.length){
                  state.setBatteries('params', {bat_prop_index: 0});
                  state.getBatteries('params')['callback']();
                  state.setBatteries('params', {callback: 0});
                }
                else{
                  state.setBatteries('params', {bat_prop_index: bat_prop_index});
                  ibp.getBatteries(page, 0);
                }
              }
            },
            error: function(){
              console.log('error');
              return false;
            }
          });
        }
      };
      
      this.getBatteryProps = function(arBattery, index){
        var strid = ''
        for(var kb in arBattery){
          strid += arBattery[kb].product['fk_product'];
          if(parseInt(kb)+1 != arBattery.length){
            strid += ',';
          }
        }
        
        $.ajax({
          url: 'http://www.'+ LOCATION +'/ajax_request/?interface=catalog_desc&action=getDescBulk&keys='+strid,
          type: 'GET',
          success: function(res){
            res = JSON.parse(res);
            var standart = 0, props;
            for(var ks in arBattery){
              fk = arBattery[ks].product['fk_product'];
              for(var kp in res){
                if(kp == fk){
                  props = res[kp].product.specification.props;
                  arBattery[ks].product['props'] = {
                    voltage: 0,
                    size: 0,
                    capacity: 0,
                    warranty: 0
                  };
                  for(var kpp in props){
                    if(kpp == 'prop_25638'){
                      for(var kv in props[kpp]){
                        standart = props[kpp][kv].value;
                        break;
                      }
                    }
                    if(kpp == 'prop_756'){
                      arBattery[ks].product['props']['voltage'] = {
                        name: 'Напряжение',
                        value: props[kpp].value + ' В'
                      }
                    }
                    if(kpp == 'prop_781'){
                      arBattery[ks].product['props']['size'] = {
                        name: 'Габариты',
                        value: props[kpp].width + ' x ' + props[kpp].height + ' x ' + props[kpp].deep + ' мм'
                      }
                    }
                    if(kpp == 'prop_26091'){
                      arBattery[ks].product['props']['capacity'] = {
                        name: 'Емкость',
                        value: props[kpp].value + ' Ач'
                      }
                    }
                  }
                  arBattery[ks].product['standart'] = standart;
                  standart = 0;
                  arBattery[ks].product['props']['warranty'] = {
                    name: 'Гарантия',
                    value: res[kp].product.warranty + ' месяцев'
                  }
                }
              }
            }
            if(arBattery[0].product.modules !== undefined){
              ibp.getBatteryModules(1, 0, arBattery);
            }
            else{
              var bat_prop = ['inner', 'outer'],
                bat_prop_index = state.getBatteries('params')['bat_prop_index'],
                arBatteryTmp = state.getBatteries(bat_prop[bat_prop_index])['items'];
              arBatteryTmp[index].product.modules = arBattery;
              state.setBatteries(bat_prop[bat_prop_index], {items: arBatteryTmp});
              index++;
              ibp.getBatteryModulesProps(index);
            }
          },
          error: function(){
            console.log('error');
            return false;
          }
        });
        
        return false;
      };
      
      this.getBatteryModulesProps = function(index){
        var bat_prop = ['inner', 'outer'],
          bat_prop_index = state.getBatteries('params')['bat_prop_index'],
          arBattery = state.getBatteries(bat_prop[bat_prop_index])['items'];
        if(index != arBattery.length){
          if(arBattery[index].product.modules.length){
            ibp.getBatteryProps(arBattery[index].product.modules, index);
          }
          else{
            index++;
            ibp.getBatteryModulesProps(index);
          }
        }
        else{
          bat_prop_index++;
          state.setBatteries('params', {bat_prop_index: bat_prop_index});
          ibp.getBatteries(1, 0);
        }
      };
      
      this.getBatteryModules = function(page, index, arBattery){
        var all_page = 0,
          modules = [],
          page = page || 1,
          bat_prop = ['inner', 'outer'],
          bat_prop_index = state.getBatteries('params')['bat_prop_index'],
          standart;
        if(index == arBattery.length){
          state.setBatteries(bat_prop[bat_prop_index], {items: arBattery});
          ibp.getBatteryModulesProps(0);
          return false;
        }
        standart = arBattery[index].product.standart;
        if(standart){
          $.ajax({
            url: 'http://www.'+ LOCATION +'/ajax_request/?interface=catalog_site&action=goodList&api_init_filters=1&type_url=akkymylyatornaya_batareya_dlya_ibp_i_yniversalnaya&pk_tree=2338&prop_26193[value]=6654&prop_25637['+ standart +'][value]='+ standart +'&o=n&list_page='+ page,
            type: 'GET',
            success: function(res){
              res = JSON.parse(res);
              if(!all_page){
                all_page = parseInt(res.all);
              }
              if(all_page){
                modules = res.data;
                arBattery[index].product['modules'] = arBattery[index].product['modules'].concat(modules);
                if(page == all_page){
                  for(var z in arBattery[index].product['modules']){//удаление модульной батареи, аналогичной совместимой
                    if(arBattery[index].product['fk_product'] == arBattery[index].product['modules'][z].product['fk_product']){
                      arBattery[index].product['modules'].splice(z, 1);
                      break;
                    }
                  }
                  page = 1;
                  index++;
                  ibp.getBatteryModules(page, index, arBattery);
                }
                else{
                  page++;
                  ibp.getBatteryModules(page, index, arBattery);
                }
              }
              else{
                  page = 1;
                  index++;
                  ibp.getBatteryModules(page, index, arBattery);
              }
            },
            error: function(){
              console.log('error');
              return false;
            }
          });
        }
        else{
          page = 1;
          index++;
          ibp.getBatteryModules(page, index, arBattery);
        }
      };
      
      return this;
    };
    var ibp = new Ibp();
    
    var Actions = function(){
      
      this.selectVendor = function(id, url){
        if(id != state.getStage()['vendorsItem']){
          state.setModels([]);
          state.setStage({model_props: null});
          state.setStage({vendors: SELECTED, models: ACTIVE, vendorsItem: id, modelsItem: null});
          ibp.getModels(url, 1, view.render.bind(view));
          state.setHash({vendor: url, model: 0});
        }
      };
        
      this.showModels = function(){
        var show = $('.'+ MODELS_BOX +' ul').is(':visible');
        !show && $('.'+ MODELS_BOX +' ul').show();
        return show;
      };
        
      this.hideModels = function(){
        $('.'+ MODELS_BOX +' ul').hide();
      };
      
      this.activeModels = function(){
        state.setStage({vendors: SELECTED, models: ACTIVE, items: NOACTIVE});
        view.render();
      };
      
      this.selectModel = function(model){
        state.setHash({model: model.fk_product});
        this.hideModels();
        
        if(model.fk_product != state.getStage()['modelsItem']){
          state.setStage({model_props: null});
          state.setStage({vendors: SELECTED, models: SELECTED, items: LOADING, modelsItem: model});
          view.render();
          var callback = function(){
            state.setStage({items: ACTIVE});
            view.render();
          };
          ibp.getModelProp(model.fk_product, callback);//view.render.bind(view));
        }
        else if(state.getStage()['modelsItem'] && model.fk_product == state.getStage()['modelsItem']){
          state.setStage({vendors: SELECTED, models: SELECTED, items: ACTIVE});
          view.render();
        }
      };
      
      this.toggleInner = function(elem){
        elem.closest('[name="item"]').find('[name="inner"]').slideToggle();
      };
      
      this.toggleHelp = function(elem, e){
        e.stopPropagation();
        e.preventDefault();
        var daddy = elem.parent(),
          help = '.' + daddy.attr('class'),
          box = daddy.find(help + '__box');
        if(!box.hasClass('open-help')){
          $(help + '__box.open-help').hide();
          $(help + '__box.open-help').removeClass('open-help');
          $(document).off('click.help');
          box.css({left: '35px', right: 'auto'});
          box.show();
          var br = box.offset(),
            bw = box.width();
          var w = window.innerWidth
          || document.documentElement.clientWidth
          || document.body.clientWidth,
            dx = w - (br.left + bw);
          if(dx > 55){
            box.css({left: '35px', right: 'auto'});
            box.find('.arrow').css({
              left: 'auto',
              right: '100%',
              'border-left-color': 'transparent',
              'border-right-color': 'rgba(208, 153, 255, 0.7)'
            });
          }
          else{
            box.css({right: '35px', left: 'auto'});
            box.find('.arrow').css({
              right: 'auto',
              left: '100%',
              'border-right-color': 'transparent',
              'border-left-color': 'rgba(208, 153, 255, 0.7)'
            });
          }
          box.addClass('open-help');
          $(document).on('click.help', function(e){
            e.stopPropagation();
            e.preventDefault();
            if($(e.target).closest(help+'__box').length == 0 || $(e.target).closest(help+'__close').length){
              $(help + '__box.open-help').hide();
              $(help + '__box.open-help').removeClass('open-help');
              $(document).off('click.help');
            }
          });
        }
        else{
          $(help + '__box.open-help').hide();
          $(help + '__box.open-help').removeClass('open-help');
          $(document).off('click.help');
        }
      };
      
      this.basket_minus = function(e, id){
        var daddy = $(e.target).closest('[name="basket-'+ id +'"]');
        var input = daddy.find('input');
        var val = parseInt(input.val());
        val--;
        if(val >= MIN_AMOUNT){
          input.attr('amount', val);
          input.val(val + ' шт.');
          this.basket_input(e, id);
        }
      };
      
      this.basket_plus = function(e, id){
        var daddy = $(e.target).closest('[name="basket-'+ id +'"]');
        var input = daddy.find('input');
        var val = parseInt(input.attr('amount'));
        val++;
        if(val <= MAX_AMOUNT){
          input.attr('amount', val);
          input.val(val + ' шт.');
          this.basket_input(e, id);
        }
      };
      
      this.basket_input_focus = function(e, id){
        var daddy = $(e.target).closest('[name="basket-'+ id +'"]');
        var input = daddy.find('input');
        var amount = parseInt(input.attr('amount'));
        if(amount > 0){
          input.val(amount);
        }
      };
      
      this.basket_input_blur = function(e, id){
        var daddy = $(e.target).closest('[name="basket-'+ id +'"]');
        var input = daddy.find('input');
        var amount = parseInt(input.attr('amount'));
        if(amount > 0){
          input.val(amount + ' шт.');
        }
      };
      
      this.basket_input = function(e, id){
        var daddy = $(e.target).closest('[name="basket-'+ id +'"]');
        var input = daddy.find('input');
        var total = daddy.find('[action="basket-total"]');
        var price = parseInt(total.attr('value'));
        var total_value = daddy.find('[action="basket-value"]');
        var val = parseInt(input.val());
        if(isNaN(val)){
          val = parseInt(input.attr('amount'));
        }
        if(val < MIN_AMOUNT){
          val = MIN_AMOUNT;
        }
        if(val > MAX_AMOUNT){
          val = MAX_AMOUNT;
        }
        
        input.attr('amount', val);
        val = String(price * val).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1 ');
        total_value.text(val);
      };
      
      this.basket_total = function(e, id){
        var daddy = $(e.target).closest('[name="basket-'+ id +'"]');
        var total = daddy.find('[action="basket-total"]');
        var price = parseInt(total.attr('value'));
        var input = daddy.find('input');
        var amount = parseInt(input.attr('amount'));
        var amount_goods = total.find('[action="basket-amount-goods"]');
        var order = total.parent().find('[action="basket-order"]');
        var order_class = order.attr('class');
        amount_goods.text(amount);
        total.parent().attr('order', 'true');
        
        $.ajax({
          url: 'http://www.'+ LOCATION +'/ajax_request/?interface=basket&action=handler&operation=add&key='+ id +'&amount='+ amount +'&from='+ LOCATION +'',
          type: 'GET',
          success: function(res){
            var res = JSON.parse(res);
            amount_goods.text(res.data[id].b_amount);
            if(parseInt(res.data[id].b_amount)){
              total.parent().attr('order', 'true');
              $('.'+ order_class).hide();
              order.show();//'','',function(){order.show();}
            }
            else{
              total.parent().attr('order', 'false');
            }
          },
          error: function(){
            console.log('error');
            return false;
          }
        });
        
        //console.log('basket ', 'id=', id,'amount=', amount);
      };
      
      this.basket_order = function(e, id){
        console.log(id);
      };
      
      return this;
    };
    var actions = new Actions();
    
    var View = function(){
      this.drawVendors = function(){
        if(!state.getInit()){
          //templates.battery_selection().appendTo(CONTAINER_ELEM);
          templates.title_block().appendTo('.'+ CONTAINER);
          templates.vendors_block().appendTo('.'+ CONTAINER);
        }
        var items = state.getVendors(),
          container = CONTAINER + '__' + VENDORS,
          box,
          stage = state.getStage(),
          stagePrev = state.getStagePrev(),
          elem;
        if(stage.vendors != stagePrev.vendors){
          $('.'+container).removeClass(container + '-' + stagePrev[VENDORS]).addClass(container + '-' + stage[VENDORS]);
        }
        if(!state.getInit()){
          box = templates.vendors_box().appendTo('.'+ container);
          for(var k in items){
            this.drawVendorsItem(k, items[k].url, items[k].value, box);
          }
        }
        if(stage.vendorsItem != stagePrev.vendorsItem){
          $('.'+ container + '__item[name="'+ stagePrev.vendorsItem +'"]').removeClass(container + '__item-active');
          $('.'+ container + '__item[name="'+ stage.vendorsItem +'"]').addClass(container + '__item-active');
        }
        //console.log(state.getBatteries());
      };
      this.drawVendorsItem = function(id, url, value, parent){
        var elem = templates.vendors_item(id, url, value).appendTo(parent);
        
        elem.on('click', function(e){
          e.preventDefault();
          actions.selectVendor(id, url);
        });
      };
      
      this.drawModels = function(){
        if(!state.getInit()){
          templates.models_block().appendTo('.'+ CONTAINER);
        }
        var items = state.getModels(),
          container = CONTAINER + '__' + MODELS,
          stage = state.getStage(),
          stagePrev = state.getStagePrev(),
          parent = $('.'+ MODELS_BOX +' ul'),
          elem;
          
        $('.'+container).removeClass(container + '-' + stagePrev[MODELS]).addClass(container + '-' + stage[MODELS]);
        if(!stage.modelsItem){
          parent.empty();
          //for(var k in items){
          var k, i, hidden = false, li_item;
          for(k = items.length - 1, i = 0; k >= 0; k--, i++){//последние 10
            if(i >= 10) hidden = true;
            //if(k < 0) break;
            li_item = this.drawModelsItem(items[k], parent, hidden);
            !hidden && li_item.addClass('battery-selection__models__item-open');
            parent.on('mouseover', 'li', function(e){
                $('li', parent).removeClass('active');
              });
          }
          templates.models_item_nofound().appendTo(parent);
          !$('.'+ container).hasClass(container +'-noactive') && $('.'+ MODELS_BOX +' input').trigger('focus').val('');
        }
        if(stage.modelsItem){//console.log(stage.modelsItem);
          this.drawModelDetail(stage.modelsItem, $('.'+ container + '__detail'));
        }
        if(!state.getInit()){
          templates.models_message().appendTo('.'+container);
          
          $('.'+ MODELS_BOX +' input').on('focus click', function(e){
            e.stopPropagation();
            e.preventDefault();
            if(!actions.showModels()){
              $(document).one('click', function(e){
                e.stopPropagation();
                e.preventDefault();
                actions.hideModels();
              });
            }
          }).on('input', function(e){
            var val = this.value.trim(), id, daddy, model, nfnd, str, index, arModels = [], items = state.getModels();
            nfnd = parent.find('[name="model-nofound"]');
            for(var m in items){
              index = items[m].product.name.toLowerCase().indexOf(val.toLowerCase());
              id = items[m].product.fk_product;
              daddy = parent.find('[name="'+ id +'"]');
              model = daddy.find('.text-item');
              if(index != -1){
                str = items[m].product.name.slice(index, val.length + index);
                model.html(items[m].product.name.replace(new RegExp(str,'i'),'<span class="text-item-color">'+ str + '</span>'));
                daddy.hide().removeClass('battery-selection__models__item-open');
                arModels.push(daddy);
                for(var d in arModels){
                  arModels[d].show().addClass('battery-selection__models__item-open');
                  if(d >= 9) break;
                }
              }
              else{
                model.html(items[m].product.name);
                daddy.hide().removeClass('battery-selection__models__item-open');
              }
            }
            if(!arModels.length){
              nfnd.show().addClass('battery-selection__models__item-open');
            }
            else{
              nfnd.hide().removeClass('battery-selection__models__item-open');
            }
          }).on('keydown',function(e){
            var code = (e.keyCode ? e.keyCode : e.which),
              li_active = parent.find('.battery-selection__models__item-open.active');
            switch (code){
              case 40:
                if(!li_active.length){
                  $(this).val($('.battery-selection__models__item-open:first').addClass('active').find('.text-item').text());
                }
                else if($('.battery-selection__models__item-open').index(li_active) == $('.battery-selection__models__item-open').length - 1){
                  li_active.removeClass('active');
                  $(this).val($('.battery-selection__models__item-open:first').addClass('active').find('.text-item').text());
                }
                else{
                  li_active.removeClass('active');
                  $(this).val(li_active.next().addClass('active').find('.text-item').text());
                }
                break;
              case 38:
                if(!li_active.length){
                  $(this).val($('.battery-selection__models__item-open').last().addClass('active').find('.text-item').text());
                }
                else if($('.battery-selection__models__item-open').index(li_active) == 0){
                  li_active.removeClass('active');
                  $(this).val($('.battery-selection__models__item-open').last().addClass('active').find('.text-item').text());
                }
                else{
                  li_active.removeClass('active');
                  $(this).val(li_active.prev().addClass('active').find('.text-item').text());
                }
                break;
              case 13:
                li_active.trigger('click');
                break;
            }
          });
        }
      };
      this.drawModelsItem = function(item, parent, hidden){
        var elem = templates.models_item(item.product.fk_product, item.product.image, item.product.name, hidden).appendTo(parent);
        
        elem.on('click', function(e){
          e.stopPropagation();
          e.preventDefault();
          actions.selectModel(item.product);
        });
        return elem;
      };
      this.drawModelDetail = function(item, parent){
        parent.empty();
        var elem = templates.model_detail(item.image, item.name, item.minidesc).appendTo(parent);
        
        elem.on('click', '.close', function(e){
          e.stopPropagation();
          e.preventDefault();
          actions.activeModels();
          $('.'+ MODELS_BOX +' input').trigger('focus');
        });
      };
      
      this.drawBatteries = function(){
        if(!state.getInit()){
          templates.items_block().appendTo('.'+ CONTAINER);
        }
        var container = CONTAINER + '__' + ITEMS,
          stage = state.getStage(),
          stagePrev = state.getStagePrev(),
          bats = state.getBatteries(),
          countBat = 0,
          elem;
          
        $('.'+container).removeClass(container + '-' + stagePrev[ITEMS]).addClass(container + '-' + stage[ITEMS]);
        
        $('.'+ container).empty();
        stage[ITEMS] == 'loading' && templates.items_loading().prependTo('.'+ container);
        if(stage.model_props){
          for(var bi in stage.model_props){
            countBat += bats[bi]['all'];
          }
          elem = templates.items_result(countBat).prependTo('.'+ container);
          for(var bpi in stage.model_props){
            var arItems = {
              prop: stage.model_props[bpi],
              count: stage.model_props[bpi]['count'],
              items: bats[bpi]['items'],
              all: bats[bpi]['all'],
              sub: bpi
            };
            if(arItems['all']){
              this.drawItemsContainer('outer', arItems, $('.'+ container));
            }
          }
        }
      };
      
      this.drawItemsContainer = function(position, arItems, parent){
        var parent = templates.items_container(position, arItems.sub == 'inner' ? 'odd' : 'even').appendTo(parent);
        templates.items_container_head(position, arItems).appendTo(parent);
        parent = templates.items_container_box(arItems['items']).appendTo(parent);
        for(var ki in arItems.items){
          arItems.items[ki].product['count'] = arItems.count;
          this.drawItem(arItems.items[ki].product, parent);
        }
      };
      
      this.drawItem = function(item, parent){
        var parent = templates.items_item().appendTo(parent),
          elem = templates.items_card(item).appendTo(parent);
        templates.items_img(item).appendTo(elem);
        this.drawItemDescription(item, elem);
        this.drawItemBasket(item, elem);
        if(item.modules !== undefined){
          if(item.modules.length){
            this.drawItemsContainer('inner', {items: item.modules, count: item.count}, parent);
          }
        }
      };
      
      this.drawItemDescription = function(item, parent){
        var elem = templates.items_description(item).appendTo(parent);
        this.drawItemDescUl(item, elem);
        if(item.modules !== undefined){
          if(item.modules.length){
            elem = templates.items_desc_additional(item).appendTo(elem);
            var arAction = elem.find('[action]');
            $.each(arAction, function(){
              $(this).on('click', function(e){
                //actions[$(this).attr('action')]($(this), e);
                //actions[$(this).attr('action')]($(this));
              });
            });
          }
        }
        
      };
      
      this.drawItemDescUl = function(item, parent){
        var elem = templates.items_desc_ul().appendTo(parent);
        if(item.modules !== undefined){
          item.props.capacity && templates.items_desc_li(item.props.capacity).appendTo(elem);
          item.props.voltage && templates.items_desc_li(item.props.voltage).appendTo(elem);
          item.props.size && templates.items_desc_li(item.props.size).appendTo(elem);
          item.props.warranty && templates.items_desc_li(item.props.warranty).appendTo(elem);
        }
        else{
          item.props.capacity && templates.items_desc_li(item.props.capacity).appendTo(elem);
          item.props.voltage && templates.items_desc_li(item.props.voltage).appendTo(elem);
          item.props.size && templates.items_desc_li(item.props.size).appendTo(elem);
        }
      };
      
      this.drawItemBasket = function(item, parent){
        var elem = templates.items_basket(item).appendTo(parent);
        elem.find('[action="basket-minus"]').on('click', function(e){
          e.stopPropagation();
          e.preventDefault();
          actions.basket_minus(e, item.fk_product);
        });
        elem.find('[action="basket-plus"]').on('click', function(e){
          e.stopPropagation();
          e.preventDefault();
          actions.basket_plus(e, item.fk_product);
        });
        elem.find('[action="basket-input"]').on('input', function(e){
          e.stopPropagation();
          e.preventDefault();
          actions.basket_input(e, item.fk_product);
        }).on('focus', function(e){
          e.stopPropagation();
          e.preventDefault();
          actions.basket_input_focus(e, item.fk_product);
        }).on('blur', function(e){
          e.stopPropagation();
          e.preventDefault();
          actions.basket_input_blur(e, item.fk_product);
        });
        elem.find('[action="basket-total"]').on('click', function(e){
          e.stopPropagation();
          e.preventDefault();
          actions.basket_total(e, item.fk_product);
        });
        elem.find('[action="basket-order"]').on('click', function(e){
          e.stopPropagation();
        });
      };
      
      this.render = function(){
        this.drawVendors();
        this.drawModels();
        this.drawBatteries();
        !state.getInit() && state.setInit(true);
      };
      
      return this;
    };
    var view = new View();

    var Templates = function(){
      this.arItem;
      
      this.battery_selection = function(){
        var elem = $('<div/>', {
          class: 'battery-selection'
        });
        return elem;
      };
      
      this.title_block = function(){
        var elem = $('<div/>', {
          class: 'battery-selection__title',
          append: $('<h1/>', {
            text: 'Подбор батарей для ИБП'
          })
          .add($('<p/>', {
            text: 'Поможем найти батареи для замены в разных источниках бесперебойного питания.'
          }))
        });
        return elem;
      };
      
      this.vendors_block = function(){
        var elem = $('<div/>', {
          class: 'battery-selection__choice battery-selection__vendors battery-selection__vendors-active',
          append: $('<div/>', {
            class: 'battery-selection__choice__title battery-selection__vendors__title',
            text: 'Выбор производителя ИБП'
          })
        });
        return elem;
      };
      
      this.models_block = function(){
        var elem = $('<div/>', {
          class: 'battery-selection__choice battery-selection__models battery-selection__models-noactive',
          append: $('<div/>', {
            class: 'battery-selection__choice__title battery-selection__models__title',
            text: 'Выбор модели ИБП'
          })
          .add($('<div/>', {
            class: 'battery-selection__models__box',
            append: $('<input/>', {
              placeholder: 'Введите название модели ИБП...'
            })
            .add($('<div/>', {
              class: 'battery-selection__models__detail'
            }))
            .add($('<ul/>', {
            }))
          }))
        });
        return elem;
      };
      
      this.items_block = function(){
        var elem = $('<div/>', {
          class: 'battery-selection__items battery-selection__items-noactive'
        });
        return elem;
      };
      
      this.vendors_item = function(id, url, text){
        var elem = $('<div/>', {
          class: 'battery-selection__vendors__item',
          name: id,
          append: $('<img/>', {
            class: 'down',
            src: 'mod/static/battery-selection/img/'+ id +'.png'
          })
          .add($('<img/>', {
            class: 'up',
            src: 'mod/static/battery-selection/img/'+ id +'-active.png'
          }))
          .add($('<span/>', {
            text: text
          }))
        });
        return elem;
      };
      
      this.vendors_box = function(){
        var elem = $('<div/>', {
          class: 'battery-selection__vendors__box'
        });
        return elem;
      };
      
      this.models_message = function(){
        var elem = $('<div/>', {
          class: 'battery-selection__models__message',
          append: $('<div/>', {
            class: 'message-title',
            text: 'Обнаружили ошибку в справочнике?'
          })
          .add($('<div/>', {
            class: 'message-desc',
            text: 'Знаете расходные материалы, которые подходят к данному устройству, но отсутствуют здесь?'
          }))
          .add($('<a/>', {
            class: 'message-link',
            href: '#',
            text: 'Сообщите нам'
          }))
        });
        
        return elem;
      };
      
      this.models_item = function(id, image, model_name, hidden){
        var elem = $('<li/>', {
          class: 'battery-selection__models__item',
          name: id,
          css: {display: hidden ? 'none' : 'block'},
          append: $('<div/>', {
            class: 'text-item',
            text: model_name
          })
          .add($('<div/>', {
            class: 'img-item',
            append: $('<img/>', {
              src: 'http://img.xcomdb.ru/'+ image +'_60.jpg'
            })
          }))
        });
        return elem;
      };
      
      this.models_item_nofound = function(id, image, model_name, hidden){
        var elem = $('<li/>', {
          class: 'battery-selection__models__item',
          name: 'model-nofound',
          css: {display: 'none'},
          append: $('<div/>', {
            class: 'text-item',
            text: 'Модели не найдены.'
          })
        });
        return elem;
      };
      
      this.model_detail = function(image, name, desc){
        var elem = $('<div/>', {
          append: $('<div/>', {
            class: 'img-item',
            append: $('<img/>', {
              src: 'http://img.xcomdb.ru/'+ image +'_60.jpg'
            })
          })
          .add($('<div/>', {
            class: 'title',
            text: name
          }))
          .add($('<div/>', {
            class: 'desc',
            text: desc
          }))
          .add($('<div/>', {
            class: 'close'
          }))
        });
        return elem;
      };
      
      this.items_loading = function(){
        var elem = $('<div/>', {
          class: 'loading',
          append: $('<span/>', {
            text: 'Поиск совместимых батарей…'
          })
        });
        return elem;
      };
      
      this.items_result = function(count){
        var elem = $('<div/>', {
          class: 'result' + (count ? '' : ' no-result'),
          append: $('<span/>', {
            text: count ? 'Найдено '+ count +' совместимых батарей для замены:' : 'К сожалению, совместимые батареи не найдены…'
          })
        });
        return elem;
      };
      
      this.items_container = function(position, inrow){
        var elem = $('<div/>', {
          class: 'container-items__'+ position,
          name: position,
          inrow: inrow
        });
        return elem;
      };
      
      this.items_container_head = function(position, ar){//console.log('ar',ar);
        var elem = $('<div/>', {
          class: 'container-items__head',
          append: $('<div/>', {
            class: 'title',
            text: position == 'inner' ? 'Совместимые батареи-модули' : ar.sub == 'inner' ? 'Внутренние батареи' : 'Внешние батареи'
          })
          .add($('<div/>', {
            class: 'count',
            text: '\u0020' + ar.items.length
          }))
          .add($('<div/>', {
            class: 'require',
            name: 'high',
            text: 'необходимо '+ ar['count'] + ' шт.'
          }))
        });
        return elem;
      };
      
      this.items_container_box = function(ar){
        var elem = $('<div/>', {
          class: 'container-items__box'
        });
        return elem;
      };
      
      this.items_item = function(){
        var elem = $('<div/>', {
          class: 'container-items__item',
          name: 'item'
        });
        return elem;
      };
      
      this.items_card = function(item){
        var elem = $('<div/>', {
          class: 'container-items__card'
        });
        return elem;
      };
      
      this.items_img = function(item){
        var elem = $('<div/>', {
          class: 'container-items__img',
          append: $('<div/>', {
            class: 'container-items__img__box',
            append: $('<img/>', {
              src: 'http://img.xcomdb.ru/'+ item.image + '_120.jpg'
            })
          })
        });
        return elem;
      };
      
      this.items_description = function(item){
        var elem = $('<div/>', {
          class: 'container-items__description',
          append: $('<div/>', {
            append: $('<a/>', {
              class: 'container-items__name',
              href: 'http://www.'+ LOCATION +'/' + item.name_url + '_' + item.fk_product + '.html',
              text: item.name
            })
          })
        });
        return elem;
      };
      
      this.items_desc_ul = function(item){
        var elem = $('<ul/>', {
        });
        return elem;
      };
      
      this.items_desc_li = function(props){
        var elem = $('<li/>', {
          append: $('<div/>', {
            append: $('<span/>', {
              text: props.name
            })
          })
          .add($('<div/>', {
            append: $('<span/>', {
              text: props.value
            })
          }))
        });
        return elem;
      };
      
      this.items_desc_additional = function(props){
        var elem = $('<div/>', {
          class: 'additional',
          append: $('<div/>', {
            class: 'additional__btn',
            //action: 'toggleInner',
            append: $('<span/>', {
              text: 'Модульная батарея '
            })
            .add($('<span/>', {
              text: '(2 модуля) '
            }))
          })
          .add($('<div/>', {
            class: 'container-items__help',
            append: $('<div/>', {
              class: 'container-items__help__mark',
              //action: 'toggleHelp',
            })
            .add($('<div/>', {
              class: 'container-items__help__box',
              //append: $('<div/>', {
              //  class: 'container-items__help__close'
              //})
              //.add($('<div/>', {
              append: $('<div/>', {
                class: 'arrow'
              })
              .add($('<div/>', {
                class: 'container-items__help__title',
                text: 'Модульная батарея'
              }))
              .add($('<p/>', {
                text: 'Модульные батареи ИБП представляют собой единый конструктив (стойку), куда устанавливаются силовые модули. '
              }))
              .add($('<p/>', {
                text: 'Увеличением их числа наращивается мощность и/или привносится необходимая для отказоустойчивой работы избыточность. '
              }))
            }))
          }))
        });
        return elem;
      };
      
      this.items_basket = function(item){
        var amount = item.count < 1 ? 1 : item.count;
        var elem = $('<div/>', {
          class: 'container-items__basket',
          name: 'basket-'+ item.fk_product,
          append: $('<div/>', {
            class: 'container-items__count',
            append: $('<div/>', {
              class: 'container-items__minus',
              name: item.fk_product,
              action: 'basket-minus'
            })
            .add($('<input/>', {
              name: item.fk_product,
              value: amount +' шт.',
              amount: amount,
              action: 'basket-input'
            }))
            .add($('<div/>', {
              class: 'container-items__plus',
              name: item.fk_product,
              action: 'basket-plus'
            }))
          })
          .add($('<div/>', {
            class: 'container-items__total-box',
            order: 'false',
            append: $('<div/>', {
              class: 'container-items__total-btn',
              action: 'basket-total',
              value: item.price,
              append: $('<div/>', {
                class: 'container-items__total-value',
                name: item.fk_product,
                append: $('<span/>', {
                  action: 'basket-value',
                  text: String(item.price * amount).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1 ')
                })
                .add($('<span/>', {
                  class: 'b-rub',
                  text: 'Р'
                }))
              })
              .add($('<div/>', {
                class: 'container-items__total-amount-goods',
                action: 'basket-amount-goods'
              }))
              .add($('<div/>', {
                class: 'container-items__total-desc',
                name: item.fk_product,
                action: 'basket-desc',
                text: String(item.price).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1 '),
                append: $('<span/>', {
                  class: 'b-rub',
                  text: 'Р'
                })
                .add($('<span/>', {
                    text: ' / шт'
                }))
              }))
            })
            .add($('<a/>', {
              class: 'container-items__total-order',
              action: 'basket-order',
              href: LOCATION == 'xcom-shop.ru' ? 'http://www.xcom-shop.ru/checkout/' : 'http://b2b.xcom.ru/store/checkout/',
              append: $('<span/>', {
                text: 'Оформить заказ...'
              })
            }))
          }))
          .add($('<div/>', {
            class: 'container-items__comm',
            html: item.available && item.available.replace('&nbsp;', ' ')
          }))
        });
        return elem;
      };
      
      return this;
    };
    var templates = new Templates();
    
    return this.each(function(ind, elem){
      ibp.init(elem);
    });
  }
})(jQuery);