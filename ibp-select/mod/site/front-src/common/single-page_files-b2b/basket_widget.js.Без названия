function basket_widget(basket)
{
	this.highlight=0;
	var _this = this;

	this.bh = new basket_handler();

	this.drawBillBox = function(basket)
	{
		_this.bh.uninit();

		$('#bill_box').html('<div id="bill_table_heading" class="gradient">Корзина</div><div id="bill_table"></div>');
		

		var goods_lines_cnt = objectLength(basket['data']);
		var cctr = 0;
		if(goods_lines_cnt == 0)
		{
			$('#bill_box #bill_table').append('<p>В корзине нет товаров</p>');
		}
		else
		{

			var goods_table = ''
			
			goods_table = _this.formGoodRow(basket['data']);

			$('#bill_box #bill_table').append('<div id="bill_goods"></div>');
			$('#bill_box #bill_table #bill_goods').append(goods_table);
			$('#bill_box #bill_table').append('<table width="100%" cellspacing=0 cellpadding=0 id="total">'+
											'<tr><td align="left"><input class="btn btn-blue" type="button" onclick="bw_obj.clear();return false;" value="Очистить" /></td>'+
											'<td align="right" class="vertical-middle"><span id="total_cost">'+number_format(basket['count']['total'])+' руб.</span></td></tr>'+
											'</table>'+
											'<form action="'+_site_url+'checkout/" method="get"><input type="submit" class="btn btn-blue btn-block btn-clear-basket" value="Оформить заказ" /></form>'+
											'');
		}

		if(_this.highlight != 0 && !_rt().isIE6())
		{
			_rt('#bl'+_this.highlight).set({style:{opacity:1}}).animate({opacity:0}).animate({opacity:1});
			_this.highlight=0;
		}
		_this.bh.init();

		try
		{
			fix_block.renew_height();
		}
		catch(e){}
	}//end drawBillBox

	this.formGoodRow = function(data,fk)
	{
		fk = fk || 0;
		var html = '';	var item_name = '';	var sub_goods = '';
		var c = 0;
		var len = objectLength(data);

		for(var i in data)
		{
			c++;

			item_name = data[i]['vendor']+' ';
			if(data[i]['model']!='') item_name+=data[i]['model'];
			else item_name+=data[i]['part_number'];

			if(fk!=0) sub_goods = ' sub_goods';
			html += '<div id="bl'+data[i]['pk_good']+'s'+fk+'" class="bill_good'+sub_goods+'"><div class="highlighter">';

			if(data[i]['name_url'] != '')
				html += '<p class="crop"><a href="'+_site_url+data[i]['name_url']+'_'+data[i]['pk_good']+'.html">'+item_name+'</a></p>';
			else
				html += '<p class="crop">'+item_name+'</p>';

			html += '<p class="minidesc crop">'+data[i]['minidesc']+'</p>';
			html += '<div class="price"><div class="amount">'+
						'<a href="#" class="minus" onclick="adder(\'ba'+data[i]['pk_good']+'s'+fk+'\',-1,'+data[i]['amount_order']+');return false;">&minus;</a>'+
						'<input name="g'+(fk==0?'':'['+fk+'][in]')+'['+data[i]['pk_good']+'][v]" type="text" value="'+data[i]['b_amount']+'" id="ba'+data[i]['pk_good']+'s'+fk+'">'+
						'<a href="#" class="plus" onclick="adder(\'ba'+data[i]['pk_good']+'s'+fk+'\',1,'+data[i]['amount_order']+');return false;">+</a>'+
						'</div>'+
						'<div class="cost">'+number_format(is_wholesaler?data[i]['price_opt']:data[i]['price'])+' руб.</div>'+
						'</div></div></div>';
			/*if(len != c) */{html +='<div class="interline">&nbsp;</div>';}

			if(data[i]['sub_goods']){html += _this.formGoodRow(data[i]['sub_goods'],i);}
		}
		return html;
	}

	this.drawBillBox(basket);

	this.add_good = function(pk,a)
	{
		try
		{
			yaCounter.reachGoal('put_in_basket_button');
		}catch(ee){}

		try { rrApi.addToBasket(pk) } catch(e) {}

		_this.highlight = pk+'s0';
		jsonp({interface:'basket',action:'handler',operation:'add',key:pk,amount:a},_this.drawBillBox);
	}
	this.add_good_credit = function(pk,a,f)
	{
		jsonp({interface:'basket',action:'handler',operation:'seta',d:'xgba'+pk+'!'+a+'xc!0xd!1xp!15'},function(data)
			{
				if(data){_rt('#card_buy_credit form').set({onsubmit:null}).first().submit();}
			});
	}
    this.clear = function()
    {
        jsonp({interface:'basket',action:'handler',operation:'clear'},_this.drawBillBox);
    }	
}//end basket_widget

function basket_handler()
{
	var _this = this;
	this.names_requested = 0;
	this.mp = 0;
	this.total = null;
	this.points_use_limit = null;
	this.names = {};
	this.status = {city:0,delivery:0,payment:0};

	this.dp_requested = false;
	this.dlv_poss = {};
	this.dlv_dp_map = {};

	this.init = function()
	{
		_rt('.bill_good .amount input').bind('keyup',syn_amount);
		//if(_this.names_requested == 0) _rt('#bill_table').bind('mouseover',request_names);
		//_rt('#basket_city').bind('change',city_handler);
		//_rt('#basket_delivery').bind('change',delivery_handler);
		//_rt('#basket_payment').bind('change',payment_handler);
		_rt('a.del').bind('click',delete_good);
	}
	this.uninit = function()
	{
		_rt('.bill_good .amount input').unbind('keyup',syn_amount);
		//if(_this.names_requested == 0) _rt('#bill_table').unbind('mouseover',request_names);
		//_rt('#basket_city').unbind('change',city_handler);
		//_rt('#basket_delivery').unbind('change',delivery_handler);
		//_rt('#basket_payment').unbind('change',payment_handler);
		_rt('a.del').unbind('click',delete_good);
	}

	this.callbackSendStatus = function()
	{
		if(_this.callbackDP) _this.callbackDP(_this.status);
		if(_this.callbackCalendar) _this.callbackCalendar(_this.status['delivery']);
	}

	function delete_good(event)
	{
		event = _rt().getEvent(event);
		var obj = _rt().getTarget(event);

		var id = obj.id.replace('del_good','');

		_rt('#ba'+id).value(0);
		_rt('#good_inner'+id+' input').value(0);
		//syn_amount();
		_rt('#good_inner'+id+' input').trigger('keyup');
		_rt('#ba'+id).trigger('keyup');

		_rt('#good_line'+id).set({className:'hide'});
		_rt('#good_inner'+id).set({className:'hide'});
	}

	function syn_amount(event)
	{
		var obj = _rt().getTarget(event);
		
		var t = obj.value;
		var key = obj.id.match(/\d+/g);
		if(! key[1]) key[1]=0;

		if(t == '') t=0;
		else
		if(''+( t=parseInt(obj.value) ) == 'NaN') t=1;
		obj.value = Math.abs(t);

		jsonp({interface:'basket',action:'handler',operation:'set',key:key[0],amount:obj.value,fk:key[1]},_this.DP_handler);
	}

	function request_names()
	{
		if(_this.names_requested == 1) return;
		_rt('#bill_table').unbind('mouseover',request_names);
		_this.names_requested = 1;
		jsonp({interface:'delivery',action:'getNames',c:_this.status['city']},_this.render_city);
	}

	this.render_city = function(data)
	{
		_this.names = data;
		var obj=_rt('#basket_city').html('');
		for(var i in data['city_order'])
		{
			if(data['city_order'][i]!=_this.status['city'])
				obj.append(_rt().create('option',{value:data['city_order'][i],innerHTML:data['city'][data['city_order'][i]]}));
			else
				obj.append(_rt().create('option',{value:data['city_order'][i],innerHTML:data['city'][data['city_order'][i]],selected:true}));
		}

		if( ! _this.dp_requested)  _this.requestDP();
	}

	function dp_filter()
	{
		if(! _rt('#basket_delivery').first() ) {_this.callbackSendStatus();return;}

		var obj=_rt('#basket_delivery').html('');
		for(i in _this.dlv_poss)
		{
			if(_this.dlv_poss[i]!=_this.status['delivery'])
			{
				obj.append(_rt().create('option',{value:_this.dlv_poss[i],innerHTML:_this.names['delivery'][_this.dlv_poss[i]]}));
			}
			else
			{
				obj.append(_rt().create('option',{value:_this.dlv_poss[i],innerHTML:_this.names['delivery'][_this.dlv_poss[i]],selected:true}));
			}
		}
		_rt().cookie('pk_delivery',_this.status['delivery']=obj.value(),90);

		obj=_rt('#basket_payment').html('');
		for(i in _this.dlv_dp_map)
		{
			if(_this.dlv_dp_map[i]!=_this.status['payment'])
			{
				obj.append(_rt().create('option',{value:_this.dlv_dp_map[i],innerHTML:_this.names['payment'][_this.dlv_dp_map[i]]}));
			}
			else
			{
				obj.append(_rt().create('option',{value:_this.dlv_dp_map[i],innerHTML:_this.names['payment'][_this.dlv_dp_map[i]],selected:true}));
			}
		}
		_rt().cookie('pk_payment',_this.status['payment']=obj.value(),90);

		_this.callbackSendStatus();
	}

	function city_handler()
	{
		_rt().cookie('pk_city',_this.status['city']=_rt('#basket_city').value(),90);
		_this.requestDP();
	}
	function delivery_handler()
	{
		_rt().cookie('pk_delivery',_this.status['delivery']=_rt('#basket_delivery').value(),90);
		_this.requestDP();
	}
	function payment_handler()
	{
		_rt().cookie('pk_payment',_this.status['payment']=_rt('#basket_payment').value(),90);
		_this.requestDP();
	}

	this.requestDP = function()
	{
		var data='';
		/*var amount=_rt('.bill_good .amount input').get();
		for(var i=0;i<amount.length;i++)
		data+='xg'+amount[i].id+'!'+amount[i].value;*/
	 	data+='xc!'+_this.status['city'];
	 	data+='xd!'+_this.status['delivery'];
	 	data+='xp!'+_this.status['payment'];
	 	jsonp({interface:'basket',action:'handler',operation:'seta',d:data},_this.DP_handler);
	}
	this.DP_handler = function(data)
	{
		_this.dp_requested = true;
		//_this.dlv_poss = data.dlv.poss;
		//_this.dlv_dp_map = data.dlv.dp_map;

		if(objectLength(data.block_order) > 0)
		{
			_rt('#submit_order').set({disabled:true});
			_rt('#submit_order_warning').set({className:''});
		}
		else
		{
			_rt('#submit_order').set({disabled:false});
			_rt('#submit_order_warning').set({className:'hide'});
		}

		for(var k in data['data'])
		{
			_rt('#ba'+k+'s0').value(data['data'][k]['b_amount']);
			_rt('#cst'+k+'s0').html(number_format(data['data'][k]['b_amount']*data['data'][k]['price'])+' руб.');
		}
		_rt('#sub_total_cost').html(number_format(data['count']['sub_total'])+' руб.');
		//_rt('#bonus').html(number_format(Math.ceil(data['count']['total']*0.01)));


		/*if(data['dlv']['cost']=='-1')
		{
			_rt('#dlv_cost_cell').html('<span>Рассчитывается менеджером</span>');
		}
		else
		{
			_rt('#dlv_cost_cell').html(number_format(data['dlv']['cost'])+' руб.');
		}*/

		_this.total = data['count']['total'];
		//_this.points_use_limit = data['count']['points_use_limit'];
		/*if(_rt('#usepoints').first())
		{
			_this.apply_points(_rt('#usepoints').value());
		}
		else */_rt('#total_cost').html(number_format(data['count']['total'])+' руб.');

		_rt('#total_cleen').html(number_format(data['count']['total'])+' руб.');

		_rt('#total_weight').html(data['count']['weight']);

		//dp_filter();
	}//end DP_handler

	this.apply_points = function(input)
	{
		if(_this.points_use_limit == null)
		{
			_this.requestDP();
			return false;
		}

		var use = input;
		if(use > _this.mp) use = _this.mp;
		if(use > _this.points_use_limit) use = _this.points_use_limit;
		var t = _this.total - use;
		if(t<0) t=0;

		_rt('#total_cost').html(number_format(t)+' руб.');
	}
}

function checkout_handler(basket_handler)
{
	var _this = this;
	this.mp = 0;
	this.pv = _rt('#usepoints').value();
	this.sber_plastik_msg = _rt('#sber_plastik_msg').first();

	this.tcompany_messages = {
		1:	'',
		4:	'<p><b>Внимание!</b><br /><span class="warn">Мы&nbsp;не&nbsp;отправляем СПСР:</span> '+
			'товары весом более 31кг, в&nbsp;длину более 1,5м, телевизоры и&nbsp;мониторы более 24&nbsp;дюймов, домашние кинотеатры, '+
			'микроволновые печи, мини-печи, аэрогрили.<br /><br />'+
			'Доставка заказов через ТК&nbsp;&laquo;СПСР&raquo; качественнее и&nbsp;быстрее, но&nbsp;и&nbsp;дороже чем у&nbsp;ТК&nbsp;&laquo;ПЭК&raquo; или EMS.</p>',
		6: 	'<p><b>Внимание!</b><br />Доставка осуществляется через EMS с помощью сервисной компании Мегаполис.<br />'+
			'Мегаполис обладает собственными сортировочными центрами и диспетчерской службой, что позволяет обеспечить высокий уровень сервиса доставки Вашего заказа.</p>',
		7: 	'<p><b>Внимание!</b><br />Доставка осуществляется через EMS с помощью сервисной компании Мегаполис.<br />'+
			'Мегаполис обладает собственными сортировочными центрами и диспетчерской службой, что позволяет обеспечить высокий уровень сервиса доставки Вашего заказа.</p>',
		8: 	'<p><a href="http://www.pecom.ru/ru/services/send/warehouses/" target="_blank">Адреса складов компании</a>.</p>',
		36:	'<p><b>Внимание!</b><br />Доставка осуществляется через EMS с помощью сервисной компании Мегаполис.<br />'+
			'Мегаполис обладает собственными сортировочными центрами и диспетчерской службой, что позволяет обеспечить высокий уровень сервиса доставки Вашего заказа.</p>',
		37:	'<p><b>Внимание!</b><br />Доставка осуществляется через EMS с помощью сервисной компании Мегаполис.<br />'+
			'Мегаполис обладает собственными сортировочными центрами и диспетчерской службой, что позволяет обеспечить высокий уровень сервиса доставки Вашего заказа.</p>'
	};

	this.payment_messages = {
		5: '<p>Карты American Express к оплате не принимаются. Приносим извинения за неудобства.</p>',
		8: '<p>Карты American Express к оплате не принимаются. Приносим извинения за неудобства.</p>',
		15:	'<p><a href="'+_site_url+'pages/credits_all/" target="_blank">Условия покупки в кредит</a>.</p>',
	};

	this.CDP_handler = function(status)
	{
		_rt('#c_address_line').set({className:''});
		_rt('#c_metro_line').set({className:'hide'});

		if((status['delivery']+'')[0]!=5)
		{
			if(status['city']==0) _rt('#c_metro_line').set({className:''});
		}
		else
		{
			_rt('#c_address_line').set({className:'hide'});
		}

		status['delivery'] = status['delivery']	-0;
		status['payment'] = status['payment']	-0;

		if([6,7,36,37].indexOf(status['delivery'])!=-1)
		{
			_rt('.dlv_ems_contract').set({className:'tx11 error dlv_ems_contract'});
		}
		else _rt('.dlv_ems_contract').set({className:'tx11 error dlv_ems_contract hide'});

		if([4,21,22,23,24,25,26].indexOf(status['delivery'])!=-1)
		{
			_rt('.dlv_spsr_dpd_contract').set({className:'tx11 error dlv_spsr_dpd_contract'});
		}
		else _rt('.dlv_spsr_dpd_contract').set({className:'tx11 error dlv_spsr_dpd_contract hide'});

		if(_this.tcompany_messages[status['delivery']])
		{
			_rt('#tcompany_message').html(_this.tcompany_messages[status['delivery']]).set({className:''});
		}else _rt('#tcompany_message').html('').set({className:'hide'});

		if(_this.payment_messages[status['payment']])
		{
			 _rt('#payment_message').html(_this.payment_messages[status['payment']]).set({className:''});
		}else _rt('#payment_message').html('').set({className:'hide'});


		if(_rt('#agree').first() != false) // handle "agree" checkboxes
		{
			if(status['payment'] == 1 || status['payment'] == 7)
			{//Нал.
				_rt('#agree').html('Нажимая на&nbsp;кнопку &laquo;Оформить заказ&raquo; я&nbsp;подтверждаю, что ознакомлен и&nbsp;согласен с&nbsp;условиями <a href="'+_site_url+'pages/payment/" target="_blank">Оплаты</a>, <a href="'+_site_url+'pages/delivery/" target="_blank">Доставки</a> и&nbsp;<a href="'+_site_url+'pages/warranty/" target="_blank">Гарантийного обслуживания</a> и&nbsp;даю разрешение на&nbsp;обработку своих персональных данных.');
			}
			else
			{//Безнал.
				if(status['payment'] == 15)
				{
					_rt('#agree').html('Нажимая на&nbsp;кнопку &laquo;Оформить заказ&raquo; я&nbsp;подтверждаю, что ознакомлен и&nbsp;согласен с&nbsp;условиями <a href="'+_site_url+'pages/credits_all/" target="_blank">покупки в&nbsp;кредит</a>, <a href="'+_site_url+'pages/payment/" target="_blank">Оплаты</a>, <a href="'+_site_url+'pages/delivery/" target="_blank">Доставки</a> и&nbsp;<a href="'+_site_url+'pages/warranty/" target="_blank">Гарантийного обслуживания</a> и&nbsp;даю разрешение на&nbsp;обработку своих персональных данных.'+
					'<br />Я предупрежден и согласен с&nbsp;тем, что товар должен быть получен только держателем банковской карты или владельцем электронного кошелька, либо другим лицом строго по&nbsp;нотариально заверенной доверенности.');
				}
				else
				{
					_rt('#agree').html('Нажимая на&nbsp;кнопку &laquo;Оформить заказ&raquo; я&nbsp;подтверждаю, что ознакомлен и&nbsp;согласен с&nbsp;условиями <a href="'+_site_url+'pages/payment/" target="_blank">Оплаты</a>, <a href="'+_site_url+'pages/delivery/" target="_blank">Доставки</a> и&nbsp;<a href="'+_site_url+'pages/warranty/" target="_blank">Гарантийного обслуживания</a> и&nbsp;даю разрешение на&nbsp;обработку своих персональных данных.'+
					'<br />Я предупрежден и согласен с&nbsp;тем, что товар должен быть получен только держателем банковской карты или владельцем электронного кошелька, либо другим лицом строго по&nbsp;нотариально заверенной доверенности.');
				}
			}
		}

		if( (status['payment']!=1 && status['payment']!=7) || (status['city']!=0) )
		{
			_rt('#customer_name_right_message').html('Для ускорения оформления заказа укажите ваши полные ФИО и&nbsp;точный адрес с&nbsp;индексом.');
		}
		else
		{
			_rt('#customer_name_right_message').html('');
		}
	}

	function init()
	{
		basket_handler.callbackDP = _this.CDP_handler;
		_rt('.amount input').bind('keyup',syn);
		_rt('.plus').add('.minus').bind('click',syn);
		_rt('#usepoints').bind('keyup',handle_points);

		if(user_logged==0)
		{
			_rt('.customer input').add('.customer select').each(function (obj)
			{
				_rt(obj).bind('change',function(){ _rt().cookie(obj.id,_rt(obj).value(),90); });
				_rt(obj).value(_rt().ifCookie(obj.id,''));
			});
		}

		_this.CDP_handler(basket_handler.status);
	}
	init();


	function handle_points(event)
	{
		event = _rt().getEvent(event);
		var obj = _rt().getTarget(event);
		var points = parseInt(obj.value,10);
		if(isNaN(points))points=0;
		_rt(obj).value(points);

		basket_handler.apply_points(_rt(obj).value());
	}

	function syn(event)
	{
		event = _rt().getEvent(event);
		var obj = _rt().getTarget(event);
	 	var key=obj.id.replace(/[a-zA-Z]+/,'');
	 	obj = _rt('#ba'+key).first();
	 	if(obj.value > 1)
		 	_rt('#cc'+key).set({className:'gray'});
	 	else
		 	_rt('#cc'+key).set({className:'gray hide'});

	 	_rt('#cst'+key).html(number_format(parseInt(obj.value)*parseInt(obj.title))+' руб.');
	}
}