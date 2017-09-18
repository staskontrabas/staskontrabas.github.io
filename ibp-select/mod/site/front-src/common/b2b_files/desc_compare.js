function desc_compare()
{
	this.data={};
	this.all={};
	var _this=this;

	this.init = function(data)
	{
		_this.data=data;
		_this.all = _rt('p.compare_line').get();

		for(var i in _this.all)
		{
			if(! _this.all.hasOwnProperty(i)) continue;
			_this.handle_one(_this.all[i]);
		}
	}
	jsonp({interface:'catalog_desc_compare',action:'getList'},this.init);

	this.handle_one = function(obj)
	{
		var fk_good = /compare\_(\d+)/.exec(obj.id)[1] || 0;
		var from = obj.getAttribute('from') || 'xcom-shop.ru';

		_rt(obj).html('');
		var add_del_link = _rt('<a href="#" onclick="return false;"></a>');
		if(_this.data[fk_good])
		{
			_rt(add_del_link).bind('click',function(){
				jsonp({interface:'catalog_desc_compare',action:'del_desc',fk_good:fk_good},_this.init);
			});
			_rt(add_del_link).set({className:'compare_del_link'});
			_rt(add_del_link).html('<img src="'+_site_url+'mod/site/images/compare_remove.gif" />Убрать из сравнения');
		}
		else
		{
			_rt(add_del_link).bind('click',function(){
				jsonp({interface:'catalog_desc_compare',action:'add_desc',fk_good:fk_good,from:from},_this.init);
			});
			_rt(add_del_link).set({className:'compare_add_link'});
			_rt(add_del_link).html('<img src="'+_site_url+'mod/site/images/compare_add.gif" />Добавить к сравнению');
		}
        _rt(obj).append(add_del_link);

        _rt(obj).append('<span>&nbsp;&nbsp;&nbsp;</span>');

        var compare_link = _rt('<a class="compare_target_blank"></a>');
        var cc = objectLength(_this.data);
        var ffl = 0;
       	if(_this.data[fk_good] && cc>1)
       	{
       		_rt(compare_link).set({href:'http://www.xcom-shop.ru/compare/',target:'_blank'});
			_rt(compare_link).html('<img src="'+_site_url+'mod/site/images/target_blank.gif" />Сравнить выбранные ('+cc+')');
			ffl=1;
       	}
       	if(!_this.data[fk_good] && cc>0)
       	{
       		_rt(compare_link).set({href:'http://www.xcom-shop.ru/compare/add/?fk_good='+fk_good+'&from='+from,target:'_blank'});
			_rt(compare_link).html('<img src="'+_site_url+'mod/site/images/target_blank.gif" />Сравнить с выбранными');
			ffl=1;
       	}
       	if(ffl==1)
	       	_rt(obj).append(compare_link);
	}
}

function desc_compare_basket_handler()
{
	this.data={};
	this.all={};
	var _this=this;

	this.init = function(data)
	{
		_this.data=data.data;
		_this.all = _rt('div.compare_basket_button').get();
		var t_count = objectLength(_this.data);

		if(t_count >0)
			_rt('#go_check').html('<a href="/checkout/">В корзине '+t_count+' '+getNamedForm(t_count,'товар','товара','товаров')+', оформить заказ.</a>&nbsp;&rarr;');
		else
			_rt('#go_check').html('');

		for(var i in _this.all)
		{
			if(! _this.all.hasOwnProperty(i)) continue;
			_this.init_one(_this.all[i]);
		}
	}
	jsonp({interface:'basket',action:'getBasket'},this.init);

	this.init_one = function(obj)
	{
		var fk_good = /compare\_bb\_(\d+)/.exec(obj.id)[1] || 0;
		var from = obj.getAttribute('from') || 'xcom-shop.ru';

		_rt(obj).html('');

		var butt = _rt('<input type="button" value="" />');
		if(_this.data[fk_good])
		{
			_rt(butt).value('Убрать из корзины');
			_rt(butt).set({style:{width:'120px'}});
			_rt(butt).bind('click',function(){
				jsonp({interface:'basket',action:'handler',operation:'set',key:fk_good,amount:0},_this.init);
			});
		}
		else
		{
			_rt(butt).value('Купить');
			_rt(butt).set({style:{width:'60px'}});
			_rt(butt).bind('click',function(){
				jsonp({interface:'basket',action:'handler',operation:'add',key:fk_good,from:from},_this.init);
			});
		}
		_rt(obj).append(butt);
	}
}

function show_same(pk_type)
{
	if(pk_type)
	{
		_rt('#show_same_'+pk_type).set({className:'act'});
		_rt('#hide_same_'+pk_type).set({className:''});

		_rt('.type_'+pk_type).set({style:{display:''}});
	}
	else
		_rt('tr.prop_line').set({style:{display:''}});
}

function hide_same(pk_type)
{
	var full;
	if(pk_type)
	{
		_rt('#show_same_'+pk_type).set({className:''});
		_rt('#hide_same_'+pk_type).set({className:'act'});

		full = _rt('.type_'+pk_type+' .prop_val').get();
	}
	else
		full = _rt('.prop_val').get();

	var tr = full[0].parentNode;
	var same = 1;
	var last_val = full[0].innerHTML;
	for(var i in full)
	{
		if(! full.hasOwnProperty(i)) continue;
		if(full[i].parentNode != tr)
		{
			if(same == 1) _rt(tr).set({style:{display:'none'}});

			tr = full[i].parentNode;
			same = 1;
			last_val = full[i].innerHTML;
			continue;
		}
		if(full[i].innerHTML != last_val) same = 0;
		last_val = full[i].innerHTML;
	}
	if(same == 1) _rt(tr).set({style:{display:'none'}});;
	hide_empty_delimiters(pk_type);
}

function hide_empty_delimiters(pk_type)
{
	var full;
	if(pk_type)
		full = _rt('.type_'+pk_type+' .prop_call').get();
	else
		full = _rt('.prop_call').get();

    var was_delimiter = false;
    var now_delimiter = false;
    var was_i = 0;
	for(var i in full)
	{
		if(! full.hasOwnProperty(i)) continue;
		if(full[i].parentNode.style.display == 'none') continue;
		now_delimiter = /delimiter/.test(full[i].className);
		if(was_delimiter && now_delimiter) _rt(full[was_i].parentNode).set({style:{display:'none'}});
		was_delimiter = now_delimiter;
		was_i = i;
	}
	if(was_delimiter) _rt(full[was_i].parentNode).set({style:{display:'none'}});
}

function clear_same_empty()
{
	var full = _rt('.prop_val').get();
	var tr = full[0].parentNode;
	var same = 1;
	var last_val = full[0].innerHTML;
	for(var i in full)
	{
		if(! full.hasOwnProperty(i)) continue;
		if(full[i].parentNode != tr)
		{
			if(same == 1)
			{
				tr.parentNode.removeChild(tr);
			}

			tr = full[i].parentNode;

			same = 1;
			last_val = full[i].innerHTML;
			continue;
		}
		if(full[i].innerHTML != last_val || ! /\u2014/.test(full[i].innerHTML)) same = 0;
		last_val = full[i].innerHTML;
	}
	if(same == 1)
	{
		tr.parentNode.removeChild(tr);
	}
}

function clear_empty_delimiters()
{
	var full = _rt('.prop_call').get();
    var was_delimiter = false;
    var now_delimiter = false;
    var was_i = 0;
	for(var i in full)
	{
		if(! full.hasOwnProperty(i)) continue;
		now_delimiter = /delimiter/.test(full[i].className);
		if(was_delimiter && now_delimiter) full[was_i].parentNode.removeChild(full[was_i]);
		was_delimiter = now_delimiter;
		was_i = i;
	}
	if(now_delimiter) full[was_i].parentNode.removeChild(full[was_i]);
}

function hide_column(obj)
{
	var id = /del\_link\_(\d+)/.exec(obj.id)[1];
	_rt('.item_'+id).each(function(obj){obj.parentNode.removeChild(obj)});
	_rt().request({interface:'catalog_desc_compare',action:'del_desc',fk_good:id},null);
	clear_same_empty();
	clear_empty_delimiters();
}