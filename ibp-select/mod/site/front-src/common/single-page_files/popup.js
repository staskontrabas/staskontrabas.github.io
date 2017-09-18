$(document).ready(function(){
	$('body').append('<div id="popupBackground" style="display:none;" class="closePopup"></div>');
	$('body').append('<table id="popupWrapper" style="display:none;" class="closePopup" cellpadding=0 cellspacing=0><tr><td class="wrap closePopup"></td></tr></table>');
});

function createWindow()
{
	if( $('#windowBox').length == 0 ) 
	{
		$('#popupWrapper .wrap').append('<div id="windowBox" class="block-universal border-gray"></div>');
		$('#windowBox').append('<a id="closeWindow" class="closePopup" href="#" onclick="return false;"></a>');
		$('.closePopup').click(function(event){
			if( $(event.target).hasClass('closePopup') )
			{
				closeWindow();
				return false;
			}
		});
	}
	else showWindow();
}
function showWindow() { $('#popupBackground').fadeTo(400,0.75); $('#popupWrapper').fadeIn(); }
function closeWindow() { $('#popupBackground').add('#popupWrapper').fadeOut(); }

function destroyWindow()
{
	moveLoginBack();
	$('#windowBox').remove();
	$('#popupBackground').add('#popupWrapper').fadeOut(0);
}

function moveLoginBack()
{
	if( $('#popup_login_form').length > 0 )
	{
		$('#auth_l').appendTo('#auth_form_dummy form');
		$('#auth_p').appendTo('#auth_form_dummy form');
	}
}

function showImage(event)
{
	if( $('#popup_viewImage').length > 0 )
	{
		actualizePopupImage(event);
		showWindow();
		return false;
	}
	else destroyWindow();

	createWindow();

	$('#windowBox').append('<div id="previewImages" class="center"></div><div id="popup_viewImage" class="center"></div>');
	$('.card-image').each( function(i,o){
		if(i == 1) return;//dupe
		var tmp_src = $(o).attr('src').replace('_310','').replace('_60','').replace('.jpg','');
		$('#previewImages').append('<img class="item" src="'+(tmp_src)+'_60.jpg" id="image_'+i+'" />');
	} );
	
	$('#previewImages .item').click( actualizePopupImage );
	actualizePopupImage(event);
	showWindow();

	function actualizePopupImage(event)
	{
		var tmp_src = $(event.target).attr('src').replace('_310','').replace('_60','').replace('.jpg','');
		$('#popup_viewImage').html('<img src="'+(tmp_src)+'_750.jpg" />');
	}
}

function showLogin()
{
	if( $('#popup_login_form').length > 0 )
	{
		showWindow();
		return false;
	}
	else destroyWindow();

	createWindow();
	_rt().request({module:'site',template:'short_login.tpl'},function(get,data){
		_rt('#windowBox').append(data);

		$('#auth_l').appendTo('#for_login');
		$('#auth_p').appendTo('#for_password');

		$('#popup_login_form').submit(tryLogin);
		showWindow();
	});

	function tryLogin()
	{
		jsonp({interface:'order_user_profile',action:'tryLogin',l:$('#auth_l').val(),p:$('#auth_p').val()},login_handler);
		return false;
	}

	function login_handler(data)
	{
		switch(data)
		{
			case 0:
				$('#loginResult').html('Неверный логин или пароль.');
				break;
			case 1:
				$('#popup_login_form').unbind('submit',tryLogin);
				$('#popup_login_form').submit();
				return true;
				break;
			case 2:
				$('#loginResult').html('Пользователь не активирован. Администрация сайта: <a href="mailto:val@xcom.ru">val@xcom.ru</a>');
				break;
			case 3:
				$('#loginResult').html('В целях безопасности и повышения конфиденциальности Ваш пароль автоматически был изменен. Пожалуйста, воспользуйтесь процедурой восстановления пароля.');
				break;
			case 4:
				$('#loginResult').html('Учетная запись зарегистрирована в&nbsp;системе <a href="//www.xcomspb.ru/">xcomspb.ru</a>.<br />Пожалуйста, используйте сайт <a href="//www.xcomspb.ru/">xcomspb.ru</a> или <a href="//www.xcom-shop.ru/registration/">зарегистрируйтесь</a> с&nbsp;другим адресом электронной почты в&nbsp;системе xcom-shop.ru');
				break;
		}
		
	}
}

function showRemind()
{
	if( $('#popup_remind_form').length > 0 )
	{
		showWindow();
		return false;
	}
	else destroyWindow();

	createWindow();
	_rt().request({module:'site',template:'short_remind.tpl'},function(get,data){
		$('#windowBox').append(data);
		
		$('#popup_remind_form').submit( function(){
			jsonp({interface:'order_user_profile',action:'remindPassword',email:$('#remindEmail').val()},remind_handler);
			return false;
		} );
		showWindow();
	});

	function remind_handler(data)
	{
		destroyWindow();
		createWindow();
		if( data == '0' )
		{
			$('#windowBox').html('Пользователь с таким e-mail`ом не найден.');
			$('#windowBox').append('<br /><a href="#" onclick="showRemind();return false;">Попробовать еще раз</a>');
		}
		else
		{
			$('#windowBox').html('Данные отправлены на ваш e-mail.');
			$('#windowBox').append('<br /><a href="#" onclick="showLogin();return false;">Войти</a>');
		}
		showWindow();
	}
}

function showRecall(fk_good)
{
	if( $('#popup_recall_form').length > 0 )
	{
		showWindow();
		return false;
	}
	else destroyWindow();

	createWindow();
	_rt().request({module:'site',template:'short_recall.tpl'},function(get,data){
		$('#windowBox').append(data);
		
		$('#recall_fk_good').val(fk_good);
		$('#popup_recall_form').submit(tryRecall);
		showWindow();
	});

	function tryRecall()
	{
		if( $.trim( $('#recall_name').val() ) == '' || $.trim( $('#recall_phone').val() ) == '' )
		{
			$('#recall_result').html('Заполните пожалуйста все поля формы.');
			return false;
		}
		return true;
	}
}


function showSendPoints(allow)
{
	if( $('#popup_sendpoints_form').length > 0 )
	{
		showWindow();
		return false;
	}
	else destroyWindow();

	createWindow();
	if( allow )
	{
		_rt().request({module:'order',template:'short_sendpoints.tpl'},function(get,data){
			$('#windowBox').append(data);
			$('#popup_sendpoints_form').submit( trySendPoints );
			showWindow();
		});
	}
	else
	{
		$('#windowBox').append( $('<br /><br /><p>Переводить баллы могут только юридические лица, совершившие хотя&nbsp;бы одну покупку.</p>') );
		showWindow();
	}

	function trySendPoints()
	{
		_rt().request(
			{
				interface:'order_user_points',
				action:'handleSendPoints',
				h:_rt('#sendpoints_hash').value(),
				e:_rt('#sendpoints_email').value(),
				a:_rt('#sendpoints_amount').value(),
				p:_rt('#sendpoints_pwd').value()
			},handleResponce);
		return false;
	}

	function handleResponce(get,data)
	{
		eval('data='+data);
		if(data==0)
		{
			_rt('#sendpoints_result').html('<p class="error">Проверьте правильность введенных данных.</p>');
		}
		else
		{
			_rt('#sendpoints_result').html('<p>Бонусные баллы успешно переведены.</p>');
			var form = _rt('#popup_sendpoints_form').first();
			form.onsubmit=null;	form.submit();
		}
	}
}

function showEditProfile()
{
	if( $('#popup_editprofile_form').length > 0 )
	{
		showWindow();
		return false;
	}
	else destroyWindow();

	createWindow();
	_rt().request({module:'order',template:'short_edit_personal_data.tpl'},function(get,data){
		$('#windowBox').append(data);
		$('#popup_edit_personal_data input').click( trySendEditProfile );
		showWindow();
	});

	function trySendEditProfile()
	{
		_rt().request(
			{
				interface:'order_user_profile_request',
				action:'handleSend',
				d:$('#popup_edit_personal_data textarea').val(),
			},handleResponce);
		return false;
	}

	function handleResponce(get,data)
	{
		eval('data='+data);
		if(data==0)
		{
			$('<p class="error">Что-то пошло не так. Повторите попытку.</p>').appendTo('#popup_edit_personal_data_result').delay(1000).fadeOut(400,function(){$(this).remove();});
		}
		else
		{
			$('<p>Мы рассмотрим Вашу заявку в ближайшее время.</p>').appendTo('#popup_edit_personal_data_result').delay(1000).fadeOut(400,function(){closeWindow(); destroyWindow();});
		}
	}

}

function showCancelOrder(fk_order) {
    $.fn.serializeObject = function () {
        var data = [];

        $(this).serializeArray().map(function (item) {
            if (data[item.name]) {
                if (typeof(data[item.name]) === 'string') {
                    data[item.name] = [data[item.name]];
                }

                data[item.name].push(item.value);
            } else {
                data[item.name] = item.value;
            }
        });

        return data;
    };

    if ($('#popup_cancel_order').length > 0) {
        showWindow();

        return false;
    } else {
        destroyWindow();
    }

    createWindow();

    _rt().request({module: 'site', template: 'short_cancel_order.tpl'}, function (get, data) {
        $('#windowBox').append(data);

        var $orderCancelForm = $('#popup_cancel_order_form');

        var customReasonValue = '0';

        $orderCancelForm.find('.form_reason').on('change', function () {
            if ($(this).val() != customReasonValue) {
                $orderCancelForm.find('.form_message').val('');
            }
        });

        $orderCancelForm.find('.form_message').on('keyup', function () {
            var $select = $orderCancelForm.find('.form_reason');

            if ($.trim($(this).val()).length > 0) {
                $select.val(customReasonValue);
            }
        });

        $orderCancelForm.submit(function (event) {
            event.preventDefault();

            var $this = $(this);

            var successFormClass = 'success';

            if ($this.hasClass(successFormClass)) {
                return false;
            }

            var $result = $this.find('.result');

            $result.html('&nbsp;');

            var formData = $this.serializeObject();

            formData.message = $.trim(formData.message);

            if (formData.reason == customReasonValue && formData.message.length == 0) {
                $result.html('<p class="error">Необходимо выбрать причину или указать свою в текстовом поле.</p>');

                return false;
            }

            var requestData = {
                'interface': 'order',
                action:      'cancelOrder',
                key:         fk_order,
                reason:      formData.reason,
                message:     formData.message
            };

            $.get('/ajax_request/', requestData, function (response) {
                $result.html('');

                if (response == 1) {
                    $this.addClass(successFormClass);

                    $('#order' + fk_order + 'CancelButton').fadeOut(function () {
                        $(this).remove();
                    });

                    $('<p>Спасибо за&nbsp;информацию.<br />Вы&nbsp;помогаете нам стать лучше!</p>')
                        .appendTo($result)
                        .delay(1000)
                        .fadeOut(400, function () {
                            closeWindow();
                            destroyWindow();
                        });
                } else {
                    $('<p class="error">Что-то пошло не&nbsp;так. Повторите попытку.</p>')
                        .appendTo($result);
                }
            });
        });

        showWindow();
    });
}

function popup_OnewayRoadImage() {
	if( $('#onewayroad_image').length > 0 )
	{
		showWindow();
		return false;
	}
	else destroyWindow();

	createWindow();
	_rt().request({module:'order',template:'short_onewayroad.tpl'},function(get,data){
		$('#windowBox').append(data);
		showWindow();
	});
}