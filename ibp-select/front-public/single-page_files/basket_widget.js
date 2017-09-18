function basket_widget(basket)
{
	this.highlight = 0;
	this.price_color_class = '';
	var _this = this;

	this.bh = new basket_handler(basket['dlv']['city'],basket['dlv']['delivery'],basket['dlv']['payment'],basket['dlv']['outlet']);
	this.bh.disable_crimea = basket.dlv.disable_crimea;

	this.yandex_add_good = 0;

	this.drawBillBox = function(basket)
	{
		_this.bh.uninit();

		_this.bh.renewStatus(basket);

		_this.price_color_class = '';


		$('#bill_box').html('<div id="bill_table"><div class="heading"></div><div class="triangle"></div></div>');

		$('#bill_table .triangle').after('<div id="pay_icons" align="center">'+
			'<img src="/mod/site/images/pay_icons/visa.gif" />'+
			'<img src="/mod/site/images/pay_icons/mc.gif" />'+
			'<img src="/mod/site/images/pay_icons/mir.gif" />'+
			'<img src="/mod/site/images/pay_icons/qiwi.gif" /><br />'+
			'<img src="/mod/site/images/pay_icons/wm.gif" />'+
			'<img src="/mod/site/images/pay_icons/ym.gif" />'+
			'<img src="/mod/site/images/pay_icons/sber.gif" />'+
			'<img src="/mod/site/images/pay_icons/thx.gif" />'+
			'<img src="/mod/site/images/pay_icons/pp.gif" />'+
		'</div>');

		var goods_lines_cnt = objectLength(basket['data']);
		var cctr = 0;
		if(goods_lines_cnt == 0)
		{
			$('#bill_table .heading').append('<a class="black">Корзина</a><br />');
			$('#bill_table .heading').append('<span>В корзине нет товаров</span>');
		}
		else
		{
			$('#bill_table .heading').append('<a href="http://www.xcom-shop.ru/checkout/" class="black">Корзина</a><br />');
			$('#bill_table .heading').append('<span>В корзине '+goods_lines_cnt+' '+getNamedForm(goods_lines_cnt,'товар','товара','товаров')+'</span>');
			$('#bill_box #bill_table').addClass('border-gray');


			if( bw_closed ) return;

			var goods_table = ''
			
			goods_table = _this.formGoodRow(basket['data']);

			_rt('#bill_table').append(goods_table);
			_rt('#bill_table').append('<div id="basket_clear"><a href="#" class="js" onclick="bw_obj.clear();return false;" />Очистить корзину</a></div><div class="interline">&nbsp;</div>');

			//draw delivery
			var dlv_selectors = '';
			if(basket.onsale)
			{
				dlv_selectors = '<tr><td>Регион:</td>'+
								'<td align="right"><select name="city" id="basket_city_onsale" size="1">'+
								'<option value="0">Москва</option>'+
								'</select></td></tr>'+
								'<tr><td>Доставка:</td>'+
								'<td align="right"><select size="1" name="delivery" id="basket_delivery_onsale">'+
								'<option value="5">Без доставки. Получение в офисе.</option>'+
								'</select></td></tr>'+
								'<tr><td>Оплата:</td>'+
								'<td align="right"><select size="1" name="payment" id="basket_payment_onsale">'+
								'<option value="7">Наличными в офисе</option>'+
								'</select></td></tr>';
			}
			else
			{
				dlv_selectors = '<tr><td>Регион:</td>'+
								'<td align="right"><select name="city" id="basket_city" size="1">'+
								'<option value="'+basket['dlv']['city']+'">'+basket['dlv']['short_names']['city_name']+'</option>'+
								'<option value="none">Загрузка ...</option></select></td></tr>'+
								'<tr><td>Доставка:</td>'+
								'<td align="right"><select size="1" name="delivery" id="basket_delivery">'+
								'<option value="'+basket['dlv']['delivery']+'">'+basket['dlv']['short_names']['delivery_name']+'</option>'+
								'<option value="none">Загрузка ...</option></select>'+
								'<select size="1" name="fk_outlet" id="basket_outlet"><option value="'+basket['dlv']['outlet']+'">'+basket['dlv']['short_names']['outlet_name']+'</option></select></td></tr>'+
								'<tr><td>Оплата:</td>'+
								'<td align="right"><select size="1" name="payment" id="basket_payment">'+
								'<option value="'+basket['dlv']['payment']+'">'+basket['dlv']['short_names']['payment_name']+'</option>'+
								'<option value="none">Загрузка ...</option></select></td></tr>';
			}

			_rt('#bill_table').append('<div id="dlv_gray_pad"><h3>Доставка товаров</h3>'+
				'<table id="delivery" width="100%" cellspacing=0 cellpadding=0>'+dlv_selectors+'</table><div id="warnings"></div>'+
				'<table width="100%" id="dlv_cost_line" cellpadding=0 cellspacing=0><tr><td align="left">Стоимость&nbsp;доставки:</td><td align="right" id="dlv_cost_cell"></td></table>'+
				'</div>');

			var dlv_comment='';
			var dlv_cost='';
			var dlv_cell='';
			if(basket['dlv']['cost']=='-1')
			{
				_rt('#dlv_cost_cell').html('<span>Рассчитывается менеджером</span>');
			}
			else
			{
				_rt('#dlv_cost_cell').html(number_format(basket['dlv']['cost'])+' руб.');
			}

			_rt('#bill_table').append('<table width="100%" cellspacing=0 cellpadding=0 id="total">'+
											'<tr><td align="left"><h3>Итого:</h3></td>'+
											'<td align="right"><span id="total_cost" class="'+_this.price_color_class+'">'+number_format(basket['count']['total'])+' руб.</span></td></tr>'+
											'</table>');

			if(!disable_points)
			_rt('#dlv_gray_pad').before('<div align="center" class="tx11 green">За&nbsp;данный заказ Вы получите <span id="bonus">'+number_format(Math.ceil(basket['count']['total']*0.01))+'</span>&nbsp;'+getNamedForm(Math.ceil(basket['count']['total']*0.01),'бонусный балл','бонусных балла','бонусных баллов')+'.</div>');

			_rt('#bill_table').append('<div id="goto_checkout"><a href="http://www.xcom-shop.ru/checkout/" class="button-blue">Оформить заказ</a></div>');
		}

		if(_this.highlight != 0 && !_rt().isIE6())
		{
			_rt('#bl'+_this.highlight).set({style:{opacity:1}}).animate({opacity:0}).animate({opacity:1});
			_this.highlight=0;
		}


		_this.bh.init();
		if( _this.bh.names_requested == 1 )
		{
			if( _this.bh.disable_crimea != basket.dlv.disable_crimea )
			{
				_this.bh.request_names( true );
				_this.bh.disable_crimea = basket.dlv.disable_crimea;
			}
			else
			{
				_this.bh.render_city();
			}
		}

		if(basket['cisco_off']==1)
		{
			_rt('#warnings').append('<div id="cisco_highlight"><div class="red">Оформление заказа в&nbsp;данной конфигурации доступно только для юридических лиц.</div></div>');

			if(!_rt().isIE6())
			{
				_rt('#cisco_highlight').set({style:{backgroundColor:'red'}});
				_rt('#cisco_highlight div').set({style:{backgroundColor:'#f5f5f5',padding:'6px 10px'}});
				_rt('#cisco_highlight div').set({style:{opacity:0}}).animate({opacity:1});
			}
		}
		else
		{
			var cr = _rt('#cisco_row').first()
			if(cr)
			{
				cr.parentNode.removeChild(cr);
			}
		}


		if (_this.yandex_add_good != 0) {
			var basket_item = basket.data[ _this.yandex_add_good ];

			_this.yandex_add_good = 0;

			window.dataLayer.push({
				"ecommerce": {
					"currencyCode": "RUB",
					"add":       {
						"products": [
							{
								"id":       basket_item.pk_good + '',
								"name":     basket_item.model ? basket_item.model : basket_item.part_number,
								"brand":    basket_item.vendor,
								"price":    parseInt(basket_item.price),
								"quantity": parseInt(basket_item.b_amount)
							}
						]
					}
				}
			});
		}

	}//end drawBillBox

	this.formGoodRow = function(data,fk)
	{
		fk = fk || 0;
		var html = '';	var item_name = '';	var sub_goods = '';
		var c = 0;
		var len = objectLength(data);

		var raw_price, discount_class;
		for(var i in data)
		{
			c++;
			discount_class = '';

			item_name = data[i]['vendor']+' ';
			if(data[i]['model']!='') item_name+=data[i]['model'];
			else item_name+=data[i]['part_number'];

			if (data[i]['discount']) {
				_this.price_color_class = discount_class = ' discount';
			} else {
				data[i]['discount'] = 0;
			}

			raw_price = is_wholesaler ? data[i]['price_opt'] : data[i]['price'];

			if(fk!=0) sub_goods = ' sub_goods';
			html += '<div id="bl'+data[i]['pk_good']+'s'+fk+'" class="bill_good'+sub_goods+'"><div class="highlighter">';

			if(data[i]['name_url'] != '')
				html += '<p class="crop"><a href="http://www.'+data[i]['from']+'/'+data[i]['name_url']+'_'+data[i]['pk_good']+'.html">'+item_name+'</a></p>';
			else
				html += '<p class="crop">'+item_name+'</p>';

			html += '<p class="tx11 gray crop">'+data[i]['minidesc']+'</p>';
			html += '<div class="amount left">'+
						'<a href="#" class="minus black" onclick="adder(\'ba'+data[i]['pk_good']+'s'+fk+'\',-1,'+data[i]['amount_order']+');return false;">&minus;</a>'+
						'<input class="center" name="g'+(fk==0?'':'['+fk+'][in]')+'['+data[i]['pk_good']+'][v]" type="text" value="'+data[i]['b_amount']+'" id="ba'+data[i]['pk_good']+'s'+fk+'" data-price="'+raw_price+'" data-discount="'+data[i]['discount']+'">'+
						'<a href="#" class="plus black" onclick="adder(\'ba'+data[i]['pk_good']+'s'+fk+'\',1,'+data[i]['amount_order']+');return false;">+</a>'+
						'</div>'+
						'<div class="cost right'+discount_class+'">'+ number_format( raw_price - data[i]['discount'] ) +' руб.</div>'+
						'<br class="clear" />'+
						'</div></div>';
			/*if(len != c) */{html +='<div class="interline">&nbsp;</div>';}

			if(data[i]['sub_goods']){html += _this.formGoodRow(data[i]['sub_goods'],i);}
		}
		return html;
	}

	this.drawBillBox(basket);

	this.add_good = function(pk,a,f,utm)
	{
		try
		{
			yaCounter.reachGoal('put_in_basket_button');
		}catch(ee){}

		_this.yandex_add_good = pk;


		_this.highlight = pk+'s0';

		if (utm) {
			jsonp({
				interface:'basket',action:'handler',operation:'add',key:pk,amount:a,from:f, 
				utm_source: utm.utm_source, utm_campaign: utm.utm_campaign, utm_content: utm.utm_content, utm_term: utm.utm_term
			}, _this.drawBillBox);
		} else {
			jsonp({interface:'basket',action:'handler',operation:'add',key:pk,amount:a,from:f},_this.drawBillBox);
		}
	}
	this.add_good_credit = function(pk,a,f)
	{
		jsonp({interface:'basket',action:'handler',operation:'seta',d:'xgba'+pk+'!'+a+'xc!0xd!1xp!15',from:f},function(data)
			{
				if(data){_rt('#card_buy_credit').set({onsubmit:null}).first().submit();}
			});
	}
	this.clear = function()
	{
		jsonp({interface:'basket',action:'handler',operation:'clear'},_this.drawBillBox);
	}
}//end basket_widget

function basket_handler(c,d,p,o)
{
	var _this = this;
	this.names_requested = 0;
	this.disable_crimea = false;
	this.mp = 0;
	this.total = null;
	this.points_use_limit = null;
	this.names = {};
	this.status = {city:c,delivery:d,payment:p,outlet:o};
	this.status.user_type = $('#c_usertype:checked').length;

	this.dp_requested = false;
	this.possible = {
		delivery:{},
		outlet:{},
		payment:{}
	};

	this.updateKladr = true;

	this.init = function()
	{
		_this.toggle_outlets();
		_rt('.bill_good .amount input').bind('keyup',syn_amount);
		if(_this.names_requested == 0) $('#bill_table').bind('mouseover',_this.request_names);
		$('#basket_city').bind('change',city_handler);
		_rt('#basket_delivery').bind('change',delivery_handler);
		_rt('#basket_payment').bind('change',payment_handler);
		_rt('#basket_outlet').bind('change',outlet_handler);
		$('#c_usertype').change(usertype_handler);
		_rt('a.del').bind('click',delete_good);
	}
	this.uninit = function()
	{
		_rt('.bill_good .amount input').unbind('keyup',syn_amount);
		if(_this.names_requested == 0) $('#bill_table').unbind('mouseover',_this.request_names);
		$('#basket_city').unbind('change',city_handler);
		_rt('#basket_delivery').unbind('change',delivery_handler);
		_rt('#basket_payment').unbind('change',payment_handler);
		_rt('#basket_outlet').unbind('change',outlet_handler);
		$('#c_usertype').unbind('change',usertype_handler);
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

		if (obj.value == 0) {
			$.get(
				'/ajax_request/',
				{
					'interface': 'catalog_good',
					'action':    'get_good_for_basket',
					'pk_good':   key[0]
				},
				function (response) {
					if (response.pk_good) {
						window.dataLayer.push({
							"ecommerce": {
								"currencyCode": "RUB",
								"remove":       {
									"products": [
										{
											"id":       parseInt(response.pk_good),
											"name":     response.model ? response.model : response.part_number,
											"price":    parseInt(response.price),
											"brand":    response.vendor
										}
									]
								}
							}
						});
					}
				},
				'json'
			);
		}

		jsonp({interface:'basket',action:'handler',operation:'set',key:key[0],amount:obj.value,fk:key[1]},_this.DP_handler);
	}

	this.request_names = function(force)
	{
		if( force !== true )
		{
			if( _this.names_requested == 1 ) return;
			_rt('#bill_table').unbind( 'mouseover', _this.request_names );
			_this.names_requested = 1;
		}

		jsonp({interface:'delivery',action:'getNames'},_this.render_city);
	}

	this.render_city = function(data)
	{
		if( data ) _this.names = data;

		var selector = $('#basket_city').html('');
		$.each( _this.names['city_order'], function(i,item){
			selector.append( $('<option>').text( _this.names['city'][item] ).val(item) );
		} );
		selector.val( _this.status['city'] );

		if( _this.dp_requested ) dp_filter();
		else _this.requestDP();
	}

	this.toggle_outlets = function()
	{

		$('#basket_outlet').hide();
		$('#may2017-outlet-info').hide();

		if(_this.status['delivery']==5)
		{
			$('#basket_outlet').show();
			$('#may2017-outlet-info').show();
		}
	}

	function dp_filter()
	{
		if(! _rt('#basket_delivery').first() ) {_this.callbackSendStatus();return;}

		_this.toggle_outlets();

		var selector;

		selector = $('#basket_delivery').html('');
		$.each( _this.possible.delivery, function(i,item){
			selector.append( $('<option>').text(_this.names['delivery'][item]).val(item) );
		} );
		selector.val(_this.status['delivery']);
		_rt().cookie('pk_delivery',_this.status['delivery']=selector.val(),90);


		selector = $('#basket_outlet').html('');
		$.each( _this.possible.outlet, function(i,item){
			selector.append( $('<option>').text(_this.names['outlet'][item]).val(item) );
		} );
		selector.val(_this.status['outlet']);
		_rt().cookie('pk_outlet',_this.status['outlet']=selector.val(),90);


		selector = $('#basket_payment').html('');
		$.each( _this.possible.payment, function(i,item){
			selector.append( $('<option>').text(_this.names['payment'][item]).val(item) );
		} );
		selector.val(_this.status['payment']);
		_rt().cookie('pk_payment',_this.status['payment']=selector.val(),90);

		_this.callbackSendStatus();
	}

	function city_handler()
	{
		_rt().cookie('pk_city',_this.status['city']=_rt('#basket_city').value(),90);

		if (_this.updateKladr) {
			try	{
				if (kladr_id = _this.names.city_kladr_map[_this.status['city']]) {
					_this.updateKladr = false;
					setKladr(kladr_id + '');
					_this.updateKladr = true;
				}
			} catch(e) {}
		}

		_this.requestDP();

		if (typeof(simulate_card_delivery) !== 'undefined' && $.isFunction(simulate_card_delivery)) {
			simulate_card_delivery();
		}
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
	function outlet_handler()
	{
		_rt().cookie('pk_outlet',_this.status['outlet']=_rt('#basket_outlet').value(),90);
		_this.requestDP();
	}
	function usertype_handler() {
		_this.status.user_type = $('#c_usertype:checked').length;
		_this.requestDP();
	}

	this.setCityByKladr = function(kladr_id) {
		_this.updateKladr = false;

		var pk_city = null;
		if (typeof(_this.names.kladr_city_map[kladr_id]) !== 'undefined') {
			pk_city = _this.names.kladr_city_map[kladr_id];
		}

		if (pk_city !== null) {
			$('#basket_city').val(pk_city).change();
		}

		_this.updateKladr = true;
	}

	this.renewStatus = function(basket)
	{
		var dlv = basket.dlv;
		if(basket.onsale)
		{
			_this.status = {city:0,delivery:5,payment:7,outlet:5,user_type:basket.user_type};
		}
		else
		{
			_this.status = {
				city:dlv.city,
				delivery:dlv.delivery,
				payment:dlv.payment,
				outlet:dlv.outlet,
				user_type:basket.user_type
			};
		}

		_this.possible.delivery       = dlv.possible_delivery;
		_this.possible.delivery_costs = dlv.possible_delivery_costs;
		_this.possible.outlet         = dlv.possible_outlet;
		_this.possible.payment        = dlv.possible_payment;
	}

	this.requestDP = function()
	{
		var data='';
	 	data+='xc!'+_this.status.city;
	 	data+='xd!'+_this.status.delivery;
	 	data+='xp!'+_this.status.payment;
	 	data+='xo!'+_this.status.outlet;
	 	data+='xu!'+_this.status.user_type;
	 	jsonp({interface:'basket',action:'handler',operation:'seta',d:data},_this.DP_handler);
	}
	this.DP_handler = function(data)
	{
		_this.dp_requested = true;
		_this.renewStatus(data);

		var dp_was_filtered = false;
		if( _this.disable_crimea != data.dlv.disable_crimea )
		{
			_this.request_names( true );
			_this.disable_crimea = data.dlv.disable_crimea;
			dp_was_filtered = true;
		}

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

		var raw_price, amount, discount;
		for(var k in data['data'])
		{
			amount		= data['data'][k]['b_amount'];
			discount	= data['data'][k]['discount'];
			raw_price	= parseInt($('#ba'+k+'s0').attr('data-price'));

			$('#ba'+k+'s0')
				.val(amount)
				.attr('data-discount', discount);

			$('#cst_old'+k+'s0').html(number_format(raw_price * amount) + ' руб.');
			$('#cst'+k+'s0').html(number_format(data['data'][k]['subtotal']) + ' руб.');
			$('#cc'+k+'s0 span').html(number_format(raw_price - discount));
			$('#bl'+k+'s0 .cost').html(number_format(raw_price - discount) + ' руб.');

			if (discount) {
				$('#cst_old'+k+'s0').removeClass('hide');
				$('#bill_box #bl'+k+'s0 .cost').addClass('discount');
			} else {
				$('#cst_old'+k+'s0').addClass('hide');
				$('#bill_box #bl'+k+'s0 .cost').removeClass('discount');
			}
		}

		if ($('#bill_box .bill_good .discount').length) {
			$('#bill_box #total_cost').addClass('discount');
		} else {
			$('#bill_box #total_cost').removeClass('discount');
		}

		_rt('#sub_total_cost').html(number_format(data['count']['sub_total']) + ' руб.');
		_rt('#bonus').html(number_format(Math.ceil(data['count']['total'] * 0.01)));


		if(data['dlv']['cost']=='-1') {
			_rt('#dlv_cost_cell').html('<span class="unknown">Рассчитывается менеджером</span>');
		} else {
			_rt('#dlv_cost_cell').html(number_format(data['dlv']['cost'])+' руб.');
		}

		_this.total = data['count']['total'];
		_this.points_use_limit = data['count']['points_use_limit'];
		if(_rt('#usepoints').first()) {
			_this.apply_points(_rt('#usepoints').value());
		} else {
			_rt('#total_cost').html(number_format(data['count']['total'])+' руб.');
		}

		_rt('#total_cleen').html(number_format(data['count']['total'])+' руб.');

		_rt('#total_weight').html(data['count']['weight']);

		if( ! dp_was_filtered ) dp_filter();
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
		4:	'<p>Доставка заказов через ТК&nbsp;&laquo;СПСР&raquo; качественнее и&nbsp;быстрее, но&nbsp;и&nbsp;дороже чем у&nbsp;ТК&nbsp;&laquo;ПЭК&raquo; или EMS.</p>',
		8: 	'<p><a href="http://www.pecom.ru/ru/services/send/warehouses/" target="_blank">Адреса складов компании</a>.</p>'
	};

	this.payment_messages = {
		5: '<p>Карты American Express к оплате не принимаются. Приносим извинения за неудобства.</p>',
		8: '<p>Карты American Express к оплате не принимаются. Приносим извинения за неудобства.</p>',
		15:	'<p><a href="/pages/credits_all/" target="_blank">Условия покупки в кредит</a>.</p>'
	};

	this.CDP_handler = function(status)
	{
		$('#c_address_line').hide();
		$('#c_metro_line').hide();
		$('#necessary_addr').hide();
		$('#kladr').hide();
		$('#eaist').hide().find('input').prop('disabled',true);

		if( status['city'] == 0  &&  $('#c_usertype').is(':checked') )
		{
			$('#eaist').show().find('input').prop('disabled',false);
		}
		else
		{
			$('#eaist input').prop('checked',false).change();
		}


		if((status['delivery']+'')[0]!=5)
		{
			$('#kladr').show();
			if (!$('#kladr').length) {
				$('#c_address_line').show();
			}
			if(status['city']==0) $('#c_metro_line').show();
		}

		status['delivery'] = status['delivery']	-0;
		status['payment'] = status['payment']	-0;

		if ([5,8,25].indexOf(status['delivery'])==-1) {
			$('#necessary_addr').show();
		};

		if([76,77].indexOf(status['delivery'])!=-1)
		{
			_rt('.dlv_ems_contract').set({className:'tx11 error dlv_ems_contract'});
		}
		else _rt('.dlv_ems_contract').set({className:'tx11 error dlv_ems_contract hide'});

		if([4,21,22,23,24,25,26].indexOf(status['delivery'])!=-1)
		{
			_rt('.dlv_spsr_dpd_contract').set({className:'tx11 error dlv_spsr_dpd_contract'});
		}
		else _rt('.dlv_spsr_dpd_contract').set({className:'tx11 error dlv_spsr_dpd_contract hide'});

		if(status['delivery'] == 87)
		{
			_rt('.dlv_russian_post_contract').set({className:'tx11 error dlv_russian_post_contract'});
		}
		else _rt('.dlv_russian_post_contract').set({className:'tx11 error dlv_russian_post_contract hide'});

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
				_rt('#agree').html('Нажимая на&nbsp;кнопку &laquo;Оформить заказ&raquo; я&nbsp;подтверждаю, что ознакомлен и&nbsp;согласен с&nbsp;условиями <a href="/pages/payment/" target="_blank">Оплаты</a>, <a href="/pages/delivery/" target="_blank">Доставки</a> и&nbsp;<a href="/pages/warranty/" target="_blank">Гарантийного обслуживания</a> и&nbsp;даю разрешение на&nbsp;обработку своих персональных данных.');
			}
			else
			{//Безнал.
				if(status['payment'] == 15)
				{
					_rt('#agree').html('Нажимая на&nbsp;кнопку &laquo;Оформить заказ&raquo; я&nbsp;подтверждаю, что ознакомлен и&nbsp;согласен с&nbsp;условиями <a href="/pages/credits_all/" target="_blank">покупки в&nbsp;кредит</a>, <a href="/pages/payment/" target="_blank">Оплаты</a>, <a href="/pages/delivery/" target="_blank">Доставки</a> и&nbsp;<a href="/pages/warranty/" target="_blank">Гарантийного обслуживания</a> и&nbsp;даю разрешение на&nbsp;обработку своих персональных данных.'+
					'<br />Я предупрежден и согласен с&nbsp;тем, что товар должен быть получен только держателем банковской карты или владельцем электронного кошелька, либо другим лицом строго по&nbsp;нотариально заверенной доверенности.');
				}
				else
				{
					_rt('#agree').html('Нажимая на&nbsp;кнопку &laquo;Оформить заказ&raquo; я&nbsp;подтверждаю, что ознакомлен и&nbsp;согласен с&nbsp;условиями <a href="/pages/payment/" target="_blank">Оплаты</a>, <a href="/pages/delivery/" target="_blank">Доставки</a> и&nbsp;<a href="/pages/warranty/" target="_blank">Гарантийного обслуживания</a> и&nbsp;даю разрешение на&nbsp;обработку своих персональных данных.'+
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

		if (status['payment'] == 14) {
			$('#sberbank_instruction').show();
		} else {
			$('#sberbank_instruction').hide();
		}
	}

	function init()
	{
		basket_handler.callbackDP = _this.CDP_handler;
		_rt('.amount input').bind('keyup',syn);
		_rt('#usepoints').bind('keyup',handle_points);
		$('#c_usertype').change( function(){_this.CDP_handler(basket_handler.status);} );

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
		var key = obj.id.replace(/[a-zA-Z]+/,'');

		$input = $('#ba'+key);
		if($input.val() > 1) {
			$('#cc'+key).removeClass('hide');
		} else {
			$('#cc'+key).addClass('hide');
		}

		var price = parseInt($input.attr('data-price'));
		var discount = parseInt($input.attr('data-discount'));
		var total = $input.val() * price;
		var total_discount = $input.val() * discount;

		$('#cst_old'+key).html(number_format(total)+' руб.');
		$('#cst'+key).html(number_format(total - total_discount)+' руб.');
	}
}