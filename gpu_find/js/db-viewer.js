$(document).ready(function(){
	var db = new loki('bd'),
    dataBase = db.addCollection('bd'),
    dbViewer = (function(){
      this.viewer = {
        page: '',
        boxbtn: [],
        subtitle: '',
        nameInDb: '',
        items: {
        },
        newitem: {
        }
      };
      this.structure = {
        table_list: {
          subtitle: "Список таблиц",
          buttons: [{
              block: 'box-btn',
              name: 'newtable',
              action: 'newtable',
              title: 'Создать таблицу'
            }
          ],
          items: {}
        }
      };
      this.init = function(){
        this.viewer.nameInDb = 'tables';
        actions.createDB();
      };
      this.set = function(item){
        var page = this.structure[item];
        this.viewer.page = item;
        this.viewer.boxbtn = page.buttons;
        this.viewer.subtitle = page.subtitle;
      };
      this.render = function(){
        console.log('render');
        drawViewer();
      };
      return this;
    })(),
    actions = (function(){
      this.table_list = function(item){
        dbViewer.set();
        dbViewer.render();
        this.getJSON('tables');
      },
      this.createDB = function(){
        $.ajax({
          url: 'bdget.php',
          success: function(res){
            //console.log(JSON.parse(res));
            var db = JSON.parse(res);
            for(var t in db){
              dataBase.insert({name: t, table: db[t]});
            }
            dbViewer.set('table_list');
            dbViewer.render();
            return true;
          },
          error: function(){
            console.log('error');
            return false;
          }
        });
      },
      this.getJSON = function(item){
        $.ajax({
          url: 'bdget.php',
          type: 'POST',
          data: {file: item},
          success: function(res){
            dataBase.insert({name: item, table: JSON.parse(res)});
            //console.log(dataBase.addDynamicView('bd').data());
            return true;
          },
          error: function(){
            console.log('error');
            return false;
          }
        });
      }
      return this;
    })(),
    drawViewer = function(){
      //var subtitle = $('.subtitle');
      //this.subtitleText = 
      $('.subtitle').html(dbViewer.viewer.subtitle);
      var arBtn = dbViewer.viewer.boxbtn;
      for(var i in arBtn){
        var btn = `<div class="btn staff" action="`+arBtn[i].action+`" name="`+arBtn[i].name+`">`+arBtn[i].title+`</div>`;
        $('.'+arBtn[i].block+'').append(btn);
      }
      var itemList = dataBase.findOne({'name': dbViewer.viewer.nameInDb}).table;
      for(var k in itemList){
        var item = `<li class="item menuitem tables" action="gettable" name="`+itemList[k]+`">`+itemList[k]+`</li>`;
        $('.items').append(item);
      }
    };
    
  dbViewer.init();
    
  /*  
    var fff = {
      table_list: {
        subtitle: "Список таблиц",
        buttons: [{
            block: 'box-btn',
            name: 'newtable',
            action: 'newtable',
            title: 'Создать таблицу'
          }
        ],
        items: {}
      },
      render: function(){
        
      }
    };
    
    
    
    
    
	var bdViewer = {
		list: $('.items'),
    boxBtn: $('.box-btn'),
    newtask: $('.new-item'),
    subtitle: $('.subtitle'),
    main: 'tables',
		init: function(){// инициализация списка
      this.hide(this.newtask);
      var get = this.getJSON(this.main, this.addTable);
			},
    getJSON: function(item, callback){
      $.ajax({
        url: 'bdget.php',
        type: 'POST',
        data: {file: item},
        success: function(res){
          callback(JSON.parse(res),item);
        console.log(dataBase.addDynamicView('bd').data());
          return true;
        },
        error: function(){
          console.log('vbfqew');
          return false;
        }
      });
    },
		hide: function(elem){
			elem.hide();
		},
		show: function(elem){
			elem.show();
		},
    drawMain: function(item){console.log('bfgw');
      var elem = '';
      this.list.html("");
      switch(item){
        case 'tables':
          this.drawTableList();
          break;
      }
    },
    drawTableList: function(item){
      this.drawSubtitle('Список таблиц');
			var t = dataBase.findOne({'name': 'tables'}),
        out = '';
      for(var k in t.table){
        out += `<li class="item menuitem tables" action="gettable" name="`+t.table[k]+`">`+t.table[k]+`</li>`;
      }
			this.list.append(out);
      var items = document.getElementsByClassName('tables');
      this.addAction(items);
      this.addButton(this.boxBtn,[
        {name: "newtable",
        title: "New table",
        action: "newtable"}
      ]);
    },
    addAction: function(ar){
      var attr = {action: '', name: ''};
        for(var i = 0; i < ar.length; i++){
          attr.action = ar[i].getAttribute('action');
          attr.name = ar[i].getAttribute('name');
          ar[i].addEventListener('click', function(){bdViewer.action(attr)});
        }
    },
    addButton: function(block, ar){console.log(ar);
      block.html("");
      var btn = '';
      for(var i in ar){
        btn += '<div class="btn staff" action="'+ar[i].action+'" name="'+ar[i].name+'">'+ar[i].title+'</div>';
      }
      block.append(btn);
      var items = block[0].getElementsByClassName('btn');
      this.addAction(items);
    },
    action: function(item){
      console.log(item);
    },
		render: function(){//отрисовка списка
      this.drawMain(this.main);
      return false;
			//tasks.insert({text: 'vbgrw', status: 'active'});
			this.list.html('');
			var status = $('.box-btn .btn.active').attr('name'),
				arTasks = status == 'all' ? tasks.addDynamicView('tasks').data() : tasks.chain().find({'status':status}).simplesort('$loki',false).data();
			tasks.data.length ? this.show() : this.hide();
			for(var i in arTasks){
				this.drawItem(arTasks[i]);
			}
		},
		item: function(item){//конструктор элемента списка
			return `<li class="item" name="`+item.$loki+`" status="`+item.status+`">
					<div class="text">`+item.text+`</div>
					<div class="staff">
						<div class="btn" name="done" task="`+item.$loki+`">Done</div>
						<div class="btn" name="delete" task="`+item.$loki+`">Delete</div>
					</div>
				</li>`
		},
		drawItem: function(item){//отрисовка элемента списка
			this.list.append(this.item(item));
		},
		done: function(task){//задача выполнена
			var t = tasks.findOne({'$loki': parseInt(task)});
			t.status = 'done';
			tasks.update(t);
			db.saveDatabase(tasks);
			this.render();
		},
		delete: function(task){//удалить задачу
			var t = tasks.findOne({'$loki': parseInt(task)});
			tasks.remove(t);
			db.saveDatabase(tasks);
			this.render();
		},
    addTable: function(item, name){
			var newTable = dataBase.insert({name: name, table: item});
      bdViewer.render();
    },
    drawSubtitle: function(str){
      this.subtitle.text(str);
    },
		addTask: function(text){//новая задача
			var newTask = tasks.insert({text: text, status: 'active'});
			db.saveDatabase(tasks);
			this.render();
		}
	};
	
  /*
	$('.tasks').on('click','.btn',function(){//завершить или удалить задачу
		var name = $(this).attr('name'),
			task = $(this).attr('task');
		switch(name){
			case 'done': bdViewer.done(task); break;
			case 'delete': bdViewer.delete(task); break;
		}
	});
  
	$('.box-btn').on('click','.btn',function(){//фильтр задач
		$('.box-btn .btn.active').removeClass('active');
		$(this).addClass('active');
		bdViewer.render();
	});*/
  /*
	$('.new-item').on('click','.btn',function(){//новая задача
		var text = $('.new-item textarea').val();
		$('.new-item textarea').val('');
		bdViewer.addTask(text);
	});
	
  
  bdViewer.init();
  /*
	db.loadDatabase({}, function(){//подключение базы из локального хранилища
		tasks = db.getCollection('tasks');
		bdViewer.init();
	});*/
	
  
});