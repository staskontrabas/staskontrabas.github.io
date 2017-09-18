function fixed_slider(elem,bottom_elem)
{
	var _this = this;
	this.obj = elem;
	this.bottom_elem = bottom_elem;
	this.top = 0;

	this.reinit = function()
	{
		_this.static_rect = getOffset(_this.obj);
		_this.static_height = _this.obj.offsetHeight;
		_this.bottom_pos = getOffset(_this.bottom_elem).top-20;

		_this.handle_scroll();
	}

	this.handle_scroll = function()
	{
		if(! _this.static_rect) return;
		
		_this.top = getBodyScrollTop();
		if(_this.top >= _this.static_rect.top)
		{
			//_this.bottom_pos = getOffset(bottom_elem).top-20;
			if(_this.top+_this.static_height >= _this.bottom_pos)
			{//fix at bottom
				_rt(_this.obj).set({style:{marginTop:(_this.bottom_pos-_this.static_height-_this.static_rect.top)+'px',position:'static'}});
			}
			else
			{//fixed at top
				if(_rt().browser.msie && _rt().browser.version < 7)
				{
					_rt(_this.obj).set({style:{marginTop:(getBodyScrollTop()-_this.static_rect.top)+'px',position:'static'}});
				}
				else
					_rt(_this.obj).set({style:{marginTop:'0px',position:'fixed',top:'0px'}});
			}
		}
		else
		{//static at top
			_rt(_this.obj).set({style:{marginTop:'0px',position:'static'}});
		}
	}

	_rt(window).bind('load',_this.reinit);
	_rt(window).bind('scroll',_this.handle_scroll);
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







//------------------
