function fixed_slider(elem,bottom_elem)
{
	if( $(elem).length == 0 ) return;

	var _this = this;
	_this.push = 60;
	_this.p = _this.i_p = $(elem).offset().top;
	_this.h = $(elem).outerHeight();
	_this.b = $(bottom_elem).offset().top;
	_this.s = _this.i_s = 0;

	$(window).scroll( function(){
		if( $(window).scrollTop() + _this.push >= _this.i_p )
		{
			if( $(window).scrollTop() + _this.push + _this.h >= _this.b )
			{
				$(elem).css( {position:'static', top:0, marginTop: (_this.b - _this.h - _this.i_p)} );
				_this.s = 2;
			}
			else
			{
				$(elem).css( {position:'fixed', top:_this.push, marginTop:0} );
				_this.s = 1;
			}
		}
		else
		{
			$(elem).css( {position:'static', top:0} );
			_this.s = 0;
		}

		if( _this.i_s != _this.s )
		{
			_this.i_s = _this.s;

			_this.p = $(elem).position().top;
			if(_this.s != 2) $(window).resize();
		}
	} );

	$(window).resize( function(){
		if( $(window).height() <= _this.h + _this.p)
		{
			$(elem).addClass('scrollable');
			$('#bill_goods',elem).css( {height: ($(window).height() - _this.p - 115) } );
		}
		else
		{
			$(elem).removeClass('scrollable');
			$('#bill_goods',elem).css( {height: 'auto' } );
		}
	} );

	this.renew_height = function()
	{
		_this.h = $(elem).outerHeight();
		$(window).scroll();
		if(_this.s != 2) $(window).resize();
	}

	$(document).ready( function(){
		$(window).resize();
	} )
}

/*=========images slider=========*/
function images_slider()
{
	var w=0;
	var _this = this;
	var o_images={};
	var ctr=0;

	this.current_preview = 0;

	function init()
	{
		_rt('.card_pic_preview img').bind('click',setActiveImage);
	}
	init();

	function setActiveImage(event)
	{
		var obj=_rt().getTarget(event);
		var wide = /wide/.test(_rt('#left_column').first().className);
		var t = '';

		_rt('#pre_pic_'+_this.current_preview).first().parentNode.className='card_pic_preview left img rc5';
		obj.parentNode.className+=' act';
		_this.current_preview=obj.id.substr(8);

		if(wide)
		{
			t = obj.src.replace('_60','_310');
		}
		else
		{
			t = obj.src.replace('_60','_210');
		}
		if(_rt('#mainImg').first().src != t) _rt('#mainImg').set({src:t});

		try{rocon.update(obj.parentNode);}catch(ee){}
	}
}
/*==========end of slider========*/

// ======================================================
// ======================================================


// Catalog tree widget

function tree_handler(data)
{
	var _this = this;
	this.hover = '';
	this.active = '';
	this.tree = data;
	this.hover_timeout;
	this.outer_timeout;

	function init()
	{
		_rt('#tree_container .tree_item').each(function(obj)
		{
			_rt(obj).bind('mouseover',function(event)
			{
				event = _rt().getEvent(event);
				var target = event.relatedTarget || event.fromElement;

				if(target && target != obj && !isParent( target,obj ) && obj.className.search('hover') == -1)
					handle_mouseover(obj,target);
			});
			_rt(obj).bind('mouseout',function(event)
			{
				event = _rt().getEvent(event);
				var target = event.relatedTarget || event.toElement;
				if(!isParent( target,obj ))
				{
					handle_mouseout(obj,target);
				}
			});
		});
	}
	init();

	function handle_mouseover(obj,from)
	{
		clearTimeout(_this.outer_timeout);
		//clearTimeout(_this.hover_timeout);

		var ttt = _rt('#'+_this.hover).first();
		if(ttt && ttt.parentNode)ttt=ttt.parentNode;
		if(ttt && ttt.parentNode)ttt=ttt.parentNode;


		if(ttt.id != obj.id) // obj != hover.parent.parent (upper node)
		{
			clearTimeout(_this.hover_timeout);
			_this.hover = obj.id;
		}

		var inner_anchor = _rt('a',obj).first();
		if(inner_anchor.className.search('rc4') != -1)
		{
			inner_anchor.className = 'rc0 act';
			rocon.update(inner_anchor);
		}
		obj.className = obj.className.replace('tree_item','tree_item hover');

		_this.hover_timeout = setTimeout(function()
		{
			if(_this.hover == obj.id)
			{

				// delay on item passed
				_rt('.child_container').each(function(container) // remove unwanted children
				{
					if( !isParent(obj,container) )
					{
						container.className='hide';
						container.parentNode.removeChild(container);
					}
				});


				_this.active = _this.hover;
				if(! _rt('#'+_this.active.replace('node','children')).first() )
				{
					trace(_this.tree);
					get_children(obj);
				}
			}
		},250);
	}
	function handle_mouseout(obj,to)
	{
		obj.className = obj.className.replace('tree_item hover','tree_item');
		var inner_anchor = _rt('a',obj).first();
		if(inner_anchor.className.search('rc0') != -1)
		{
			inner_anchor.className = 'rc4 act';
			rocon.update(inner_anchor);
		}
		_this.hover = '';

		_this.outer_timeout = setTimeout(function()
		{
			//delay passed outer
			if(_this.hover == '') // remove children on hover outer
			{
				_rt('.child_container').each(function(container)
				{
					if( !isParent(obj,container) )
					{
						container.className='hide';
						container.parentNode.removeChild(container);
					}
				});
				var children = _rt('#'+_this.active.replace('node','children')).first();
				if(children && children.className.search('child_container') != -1)
				{
					_rt(children).set({className:'hide'});
					children.parentNode.removeChild(children);
				}
				_this.active = _this.hover;
			}
		},750);
	}

	function get_children(obj)
	{
		var id = obj.id.replace('node','');

		if(_this.tree[id] && _this.tree[id]['in'])
		{
			//got in cache
			if(_this.tree[id]['in'] != 'none'){ render_children(_this.tree[id]['in'],obj); }//render from cache
		}
		else
		{
			function handle_children_request(get,data)
			{
				eval('data='+data);
				if(objectLength(data) != 0)
				{
					_this.tree[id] = {'in':data};
					render_children(data,obj);
				}
				else
					_this.tree[id] = {'in':'none'};
			}
			if(_this.tree[id]['inner']!='')
				_rt().request({interface:'catalog_basic_tree',action:'getForSite',getForSite_fk:id},handle_children_request);
		}
	}
	function render_children(data,parent_node)
	{
		var id = parent_node.id.replace('node','');
		_rt(parent_node).append('<div id="children'+id+'" class="child_container rc4"></div>');
		rocon.update(_rt('#children'+id).first());

		var upper_node = parent_node.parentNode;
		if(upper_node.className == 'container0')
		{
			var tree_pos = getOffset(upper_node);
			var node_pos = getOffset(parent_node);
			_rt('#children'+id).set({style:{position:'absolute',zIndex:99,left:tree_pos.left+upper_node.offsetWidth-20+'px',top:node_pos.top+'px',width:'240px'}});
		}
		else
		{
			var node_pos = getOffset(parent_node);
			_rt('#children'+id).set({style:{position:'absolute',zIndex:99,left:upper_node.offsetWidth-20+'px',top:parent_node.offsetTop+'px',width:'240px'}});
		}

		var parent_url = _rt('a',parent_node).first().href;
		for(var i in data)
		{
			if(! _this.tree[i]) _this.tree[i] = data[i];
			_rt('#children'+id).append('<div id="node'+i+'" class="tree_item"><a href="'+parent_url+''+data[i]['name_url']+'/">'+data[i]['name']+'</a></div>');
			if(data[i]['inner'])
				_rt('#node'+i).first().className = _rt('#node'+i).first().className.replace('tree_item','inner tree_item');
		}

		_rt('#children'+id+' .tree_item').each(function(obj)
		{
			_rt(obj).bind('mouseover',function(event)
			{
				event = _rt().getEvent(event);
				var target = event.relatedTarget || event.fromElement;
				if(target != obj && !isParent( target,obj ) && obj.className.search('hover') == -1)
					handle_mouseover(obj);
			});
			_rt(obj).bind('mouseout',function(event)
			{
				event = _rt().getEvent(event);
				var target = event.relatedTarget || event.toElement;
				if(!isParent( target,obj ) && obj.className.search('hover') != -1)
					handle_mouseout(obj);
			});
		});
	}
} // end of tree_widget


// tabs in good card
function showTab(obj)
{
	_rt('#tabs_line nobr').set({className:''});
	obj.className = 'act rc3';
	rocon.update(obj);

	_rt('.real_tab').set({className:'real_tab hide'});
	_rt('#real_tab'+obj.id.replace('tab','')).set({className:'real_tab'});
}

function select_contacts(obj)
{
	var container = obj.parentNode.parentNode;
	_rt('nobr',container).set({className:''});
	obj.parentNode.className = 'act rc6';
	_rt('.'+container.id+'_tab').set({className:container.id+'_tab hide'});
	_rt('#'+obj.parentNode.id+'_tab').set({className:container.id+'_tab act'});
	rocon.update(obj.parentNode);
}


/*==============================================================================*/
/* resize handler */
function card_resize()
{
	var _this=this;
	this.process = 0;
	this.state = -1;
	this.main_image = null;
	this.main_image_src = '';

	this.handle_resize = function()
	{
		if(_this.process) return;

		_this.process=1;
		var container = _rt('#card').first();
		var t = null;
		if(!container)return;

		if(container.offsetWidth >= 614)
		{//wide
			if(_this.state != 1)
			{
				_this.state=1;

				if(_this.main_image)
				{
					_rt('#left_column').set({className:'column-wide'});

					_this.main_image_src = _this.main_image.src;
					t = _this.main_image_src.replace('_120','_310');

					if(_this.main_image_src != t)
					{
						_rt('#mainImg').set({src:t});
						_this.main_image_src = _rt('#mainImg').first().src;
					}
				}
			}
		}
		else
		{//tiny
			if(_this.state != 0)
			{
				_this.state=0;

				if(_this.main_image)
				{
					_rt('#left_column').set({className:'column-tiny'});

					_this.main_image_src = _this.main_image.src;
					t = _this.main_image_src.replace('_310','_120');

					if(_this.main_image_src != t)
					{
						_rt('#mainImg').set({src:t});
						_this.main_image_src = _rt('#mainImg').first().src;
					}
				}
			}
		}

		_this.process=0;
	}

	this.init = function()
	{
		_this.main_image = _rt('#mainImg').first();
		if(_this.main_image) _this.main_image_src = _this.main_image.src;
		_this.handle_resize();
		_rt(window).bind('resize',_this.handle_resize);
	}
	_rt(window).bind('load',_this.init);
}

function init_card_tabs()
{
	var _this = this;
	this.tabs = _rt('#card_prop').add('#accessories').add('#similar').get();
	this.tabs_available = _rt('#card_prop').add('#accessories_content').add('#similar_content').get();
	if(! this.tabs_available) this.tabs_available = {};
	this.tabs_count = objectLength(this.tabs_available);

	this.update = function()
	{
		try
		{
			rocon.update(_rt('#tab_card_prop').first());
			rocon.update(_rt('#tab_accessories').first());
			rocon.update(_rt('#tab_similar').first());
			rocon.update(_rt('#tab_container').first());
		}catch(ee){}
	}

	this.show_tab = function(tab_id)
	{
		if(_rt('#tabs_line .act').first() && _rt('#tabs_line .act').first().id == 'tab_'+tab_id) return;

		_rt('#tabs_line .act').set({className:'tab rc5'});
		_rt('#tab_'+tab_id).set({className:'tab rc5 act'});

		_rt('#card_prop').add('#accessories').add('#similar').set({className:'tabs_content hide'});
		_rt('#'+tab_id).set({className:'tabs_content tiny'});

		if(tab_id == _this.tabs_available[0].id.replace('_content',''))
			_rt('#tab_container').set({className:'rc5 vertical-sync no-left-corner'});
		else
		{
			if(tab_id == 'comments')
				_rt('#tab_container').set({className:'rc5 vertical-sync no-right-corner'});
			else
				_rt('#tab_container').set({className:'rc5 vertical-sync'});
		}


		_this.update();
	}

	this.click_tab = function(event)
	{
		event = _rt().getEvent(event);
		var obj = _rt().getTarget(event);
		obj = obj.parentNode;
		_this.show_tab(obj.id.replace('tab_',''));
	}

	if(this.tabs_count > 0)
	{
		for(var i=0;i<this.tabs_count;i++)
		{
			_rt('#tab_'+this.tabs_available[i].id.replace('_content','')).set({className:'tab rc5'});
		}
		_rt('#tab_comments').set({className:''});
		this.show_tab(this.tabs_available[0].id.replace('_content',''));
	}
	else
		_rt('#tabs_line').add('#tab_container').set({className:'hide'});

	_rt('.tab a').bind('click',this.click_tab);
	_rt('#card_leaping_accessories a').bind('click',function(){_this.show_tab('accessories');});
}