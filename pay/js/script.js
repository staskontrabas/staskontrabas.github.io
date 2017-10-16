
$(document).ready(function(){
	var BD = {},
		programm = {
			param: {
				building: null,
				programm_id: null,
				pay_type: null,
				price: null,
				first_pay: null,
				date_end: null
			},
			init: function(bd){
				var obj;
				if(bd.programms.length){
					obj = bd.programms[0];
					this.param.building = obj.id;
					if(obj.programms.length){
						this.param.programm_id = obj.programms[0].id;
						for(var l in obj.programms[0].props){
							if(obj.programms[0].props[l].id == 'pay_type'){
								this.param.pay_type = obj.programms[0].props[0].values[0].value;
							}
						}
						this.param.price = this.getPrice(obj.programms[0].props);
						this.param.first_pay = this.getFirstPay(obj.programms[0].props);
						this.param.date_end = this.getDate(obj.programms[0].props);
						
						sendCalc();
					}
				}
			},
			get: function(){
				return this.param;
			},
			set: function(param){
				var id = $("#building").val(),
					programm_id = $("#programm_id").val(),
					pay_type = $("#pay_type").val();
				for(var i in BD.programms){
					if(BD.programms[i].id == id){
						if(!BD.programms[i].programms.length) return false;
						for(var k in BD.programms[i].programms){
							if(BD.programms[i].programms[k].id == programm_id){
								var obj = BD.programms[i].programms[k].props;
								
								this.param.building = id;
								this.param.programm_id = programm_id;
								this.param.pay_type = pay_type;
								
								this.param.price = this.getPrice(obj);
								this.param.first_pay = this.getFirstPay(obj);
								this.param.date_end = this.getDate(obj);
								
								break;
							}
						}
						break;
					}
				}
				return true;
			},
			getPrice: function(props){
				var price;
				for(var i in props){
					if(props[i].id == 'price'){
						price = props[i].defaultValue;
					}
				}
				return price;
			},
			getFirstPay: function(props){
				var fpay;
				for(var i in props){
					if(props[i].id == 'first_pay'){
						fpay = this.param.pay_type == 1 ? props[i].min : props[i].min;
					}
				}
				return parseInt(fpay * this.param.price);
			},
			getDate: function(props){
				var date;
				for(var i in props){
					if(props[i].id == 'date'){
						date_end = props[i].value;
					}
				}
				return date;
			},
			render: function(){
				$("#price").val(beatNum(this.param.price));
				$("#first_pay").val(beatNum(this.param.first_pay));
				$("#date").val(beatNum(this.param.date_end));
			}
		};
		
	(function(){
		$.ajax({
			url: 'https://api.trend-spb.ru/v2/installment/286/list/',
			type: "GET",
			success: function(res){
				BD = res.data;
				drawSys(BD);
				programm.init(BD);
				$(".loader").hide();
				$(".main").css({visibility:'visible'});
			}
		});
	})();
	
	$(".main").on('change','.form-control',function(){
		if(programm.set()){
			programm.render();
			sendCalc();
		}
		else{
			$(this).val(programm.param[$(this).attr('name')]);
		}
		//$(this).find('option[value="'+$(this).val()+'"]').text()
	});
	
	var makeNum = function(str){
		return parseInt(str.replace(/\s/g, ''));
	};
	var beatNum = function(num){
		return String(num).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1 ');
	};
	
	var drawSys = function(bd){
		var obj;
		for(var i in bd.programms){
			obj = bd.programms[i];
			$('#building').append($("<option/>", {value: obj.id, text: obj.name}));
			if(!parseInt(i)){
				for(var k in obj.programms){
					$('#programm_id').append($("<option/>", {value: obj.programms[k].id, text: obj.programms[k].name}));
					if(!parseInt(k)){
						for(var l in obj.programms[k].props){
							if(obj.programms[k].props[l].id == 'pay_type'){
								for(var m in obj.programms[k].props[l].values){
									$('#pay_type').append($("<option/>", {value: obj.programms[k].props[l].values[m].value, text: obj.programms[k].props[l].values[m].name}));
								}
							}
							if(obj.programms[k].props[l].id == 'price'){
										$(".input-box[name='price']").append('<input type="text" name="price" id="price" class="form-control roboto-bold" value="'+beatNum(obj.programms[k].props[l].defaultValue)+'" />');
							}
							if(obj.programms[k].props[l].id == 'first_pay'){
										//$(".input-box[name='first_pay']").append('<input type="text" name="first_pay" id="first_pay" class="form-control roboto-bold" value="'+beatNum(parseInt(obj.programms[k].props[l-1].defaultValue * obj.programms[k].props[l].min))+'" />');
										$(".input-box[name='first_pay']").append('<input type="text" name="first_pay" id="first_pay" class="form-control roboto-bold" value="'+beatNum(parseInt(obj.programms[k].props[l-1].defaultValue * obj.programms[k].props[l].min))+'" />');
							}
							if(obj.programms[k].props[l].id == 'date'){
										$(".input-box[name='calc']").append('<input type="hidden" name="date" id="date" class="form-control roboto-bold" value="'+obj.programms[k].props[l].value+'" />');
							}
						}
					}
				}
			}
		}
	};
	
	var drawRes = function(res){
		$(".right-side[name='title']").html(res.data.title);
		$(".right-side[name='desc']").html(res.data.values[0].title);
		$(".right-side[name='pay_type']").html(beatNum(res.data.values[0].value));
	};
	
	var sendCalc = function(){
		var send = programm.param;
			
		$.ajax({
			url: 'https://api.trend-spb.ru/v2/installment',
			type: "GET",
			data: send,
			success: function(res){
				drawRes(res);
			}
		});
	};
	
	$("#calc").on('click',function(){
		sendCalc();
	});
	
	
});