$(document).ready(function(){
	var db = new loki('Tasks'),
		tasks;
	
	var todoList = {
		list: $('.tasks'),
		init: function(){// инициализация списка
				if(!tasks){
					tasks = db.addCollection('tasks');
					this.render();
				}
				else{
					this.render();
				}
			},
		hide: function(){//скрыть интерфэйс
			$('.tasks').hide();
			$('.box-btn').hide();
		},
		show: function(){//показать интерфэйс
			$('.tasks').show();
			$('.box-btn').show();
		},
		render: function(){//отрисовка списка
			this.list.html('');
			var status = $('.box-btn .btn.active').attr('name'),
				arTasks = status == 'all' ? tasks.addDynamicView('tasks').data() : tasks.chain().find({'status':status}).simplesort('$loki',false).data();
			tasks.data.length ? this.show() : this.hide();
			for(var i in arTasks){
				this.drawItem(arTasks[i]);
			}
		},
		item: function(item){//конструктор элемента списка
			return `<li class="task" name="`+item.$loki+`" status="`+item.status+`">
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
		addTask: function(text){//новая задача
			var newTask = tasks.insert({text: text, status: 'active'});
			db.saveDatabase(tasks);
			this.render();
		}
	};
	
	$('.tasks').on('click','.btn',function(){//завершить или удалить задачу
		var name = $(this).attr('name'),
			task = $(this).attr('task');
		switch(name){
			case 'done': todoList.done(task); break;
			case 'delete': todoList.delete(task); break;
		}
	});
	$('.box-btn').on('click','.btn',function(){//фильтр задач
		$('.box-btn .btn.active').removeClass('active');
		$(this).addClass('active');
		todoList.render();
	});
	$('.new-task').on('click','.btn',function(){//новая задача
		var text = $('.new-task textarea').val();
		$('.new-task textarea').val('');
		todoList.addTask(text);
	});
	
	db.loadDatabase({}, function(){//подключение базы из локального хранилища
		tasks = db.getCollection('tasks');
		todoList.init();
	});
	
});
