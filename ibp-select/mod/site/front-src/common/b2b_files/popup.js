$(document).ready(function () {
    $('body').append('<div id="popupBackground" style="display:none;" class="closePopup"></div>');
    $('body').append('<table id="popupWrapper" style="display:none;" class="closePopup" cellpadding=0 cellspacing=0><tr><td class="wrap closePopup"></td></tr></table>');
});

function createWindow(allow_close) {
    if ($('#windowBox').length == 0) {
        $('#popupWrapper .wrap').append('<div id="windowBox" class="block-universal border-gray"></div>');
        if (!allow_close) {
            $('#windowBox').append('<a id="closeWindow" class="closePopup" href="#" onclick="return false;"></a>');
            $('.closePopup').click(function (event) {
                if ($(event.target).hasClass('closePopup')) {
                    $('#popupBackground').add('#popupWrapper').fadeOut();
                    return false;
                }
            });
        }
    }
    else showWindow();
}
function showWindow() {
    $('#popupBackground').fadeTo(400, 0.75);
    $('#popupWrapper').fadeIn();
}

function destroyWindow() {
    moveLoginBack();
    $('#windowBox').remove();
    $('#popupBackground').add('#popupWrapper').fadeOut(0);
}

function moveLoginBack() {
    if ($('#popup_login_form').length > 0) {
        $('#auth_l').appendTo('#auth_form_dummy form');
        $('#auth_p').appendTo('#auth_form_dummy form');
    }
}

function showImage(event) {
    if ($('#popup_viewImage').length > 0) {
        actualizePopupImage(event);
        showWindow();
        return false;
    }
    else destroyWindow();

    createWindow();

    $('#windowBox').append('<div id="previewImages" class="center"></div><div id="popup_viewImage" class="center"></div>');
    $('.card-image').each(function (i, o) {
        if (i == 1) return;//dupe
        var tmp_src = $(o).attr('src').replace('_310', '').replace('_60', '').replace('.jpg', '');
        $('#previewImages').append('<img class="item" src="' + (tmp_src) + '_60.jpg" id="image_' + i + '" />');
    });

    $('#previewImages .item').click(actualizePopupImage);
    actualizePopupImage(event);
    showWindow();

    function actualizePopupImage(event) {
        var tmp_src = $(event.target).attr('src').replace('_310', '').replace('_60', '').replace('.jpg', '');
        $('#popup_viewImage').html('<img src="' + (tmp_src) + '_500.jpg" />');
    }
}

function showLogin(allow_close) {
    if ($('#popup_login_form').length > 0) {
        showWindow();
        return false;
    }
    else destroyWindow();

    createWindow(allow_close);
    _rt().request({module: 'site', template: 'short_login.tpl'}, function (get, data) {
        $('#windowBox').append(data);

        $('#auth_l').appendTo('#for_login');
        $('#auth_p').appendTo('#for_password');
        $('#goto_remind').click(function () {
            showRemind(allow_close);
            return false;
        });

        $('#popup_login_form').submit(tryLogin);
        showWindow();
    });

    function tryLogin() {
        jsonp({
            interface: 'order_user_profile',
            action:    'tryLogin',
            l:         $('#auth_l').val(),
            p:         $('#auth_p').val()
        }, login_handler);
        return false;
    }

    function login_handler(data) {
        switch (data) {
            case 0:
                $('#loginResult').html('Неверный логин или пароль.');
                break;
            case 1:
                $('#popup_login_form').unbind('submit', tryLogin);
                $('#popup_login_form').submit();
                return true;
                break;
            case 2:
                $('#loginResult').html('Пользователь не активирован. Администрация сайта: <a href="mailto:val@xcom.ru">val@xcom.ru</a>');
                break;
            case 3:
                $('#loginResult').html('В целях безопасности и повышения конфиденциальности Ваш пароль автоматически был изменен. Пожалуйста, воспользуйтесь процедурой восстановления пароля.');
                break;
        }

    }
}

function showRemind(allow_close) {
    if ($('#popup_remind_form').length > 0) {
        showWindow();
        return false;
    }
    else destroyWindow();

    createWindow(allow_close);
    _rt().request({module: 'site', template: 'short_remind.tpl'}, function (get, data) {
        $('#windowBox').append(data);

        $('#goto_login').click(function () {
            showLogin(allow_close);
            return false;
        });

        $('#popup_remind_form').submit(function () {
            jsonp({
                interface: 'order_user_profile',
                action:    'remindPassword',
                login:     $('#remindLogin').val()
            }, remind_handler);
            return false;
        });
        showWindow();
    });

    function remind_handler(data) {
        destroyWindow();

        createWindow(true);
        if (data == '0') {
            $('#windowBox').html('Пользователь не найден.');
            $('#windowBox').append('<br /><a href="#" onclick="showRemind(true);return false;">Попробовать еще раз</a>');
        }
        else {
            $('#windowBox').html('Данные отправлены на ваш e-mail.');
            $('#windowBox').append('<br /><a href="#" onclick="showLogin(true);return false;">Войти</a>');
        }
        showWindow();

    }
}

function showAddCompany() {
    if ($('#add_company_form').length > 0) {
        showWindow();
        return false;
    }
    else destroyWindow();

    createWindow();
    _rt().request({module: 'order', template: 'popup_profile_company_add.tpl'}, function (get, data) {
        $('#windowBox').append(data);

        showWindow();
    });
}

function showTechSupportRequest() {
    if ($('#tech_support_request_form').length > 0) {
        showWindow();
        return false;
    } else {
        destroyWindow();
    }

    if ($('#windowBox').length == 0) {
        $('#popupWrapper .wrap').append('<div id="windowBox" class="block-universal tech-support-request-form-window"></div>');
        $('#windowBox').append('<a id="closeWindow" class="closePopup" href="#" onclick="return false;"></a>');

        $('.closePopup').click(function (event) {
            if ($(event.target).hasClass('closePopup')) {
                $('#popupBackground').add('#popupWrapper').fadeOut();
                return false;
            }
        });
    } else {
        showWindow();
    }

    _rt().request({
        'module':    'site',
        'interface': 'site_tech_support_request',
        'action':    'add',
        'template':  'popup_tech_support_request_add.tpl'
    }, function (get, data) {
        $('#windowBox').append(data);

        $('#tech_support_request_form').on('submit', trySendTechSupportRequest);

        showWindow();
    });

    function trySendTechSupportRequest(event) {
        event.preventDefault();

        $form = $(this);

        $.ajax({
            type:     'POST',
            url:      '/ajax_request/?interface=site_tech_support_request&action=store_padding',
            data:     $form.serialize(),
            dataType: 'json',
            success:  function (response) {
                removeErrors();

                if (response.success) {
                    $form.find('.lead, .field, .submit').hide();
                    $form.find('.form__success').show();
                } else {
                    addErrors(response.errors ? response.errors : {form: ['Произошла ошибка!']});
                }
            },
            error:    function () {
                removeErrors();

                addErrors({form: ['Произошла ошибка!']});
            }
        });

        return false;
    }

    var removeErrors = function () {
        var $form = $('#tech_support_request_form');

        $form.find('.field__errors, .form__errors').html('');

        $.each($form.find('.field'), function () {
            $(this).removeClass('error');
        });
    };

    var addErrors = function (errors) {
        var $form = $('#tech_support_request_form');

        if (errors.fields) {
            $.each(errors.fields, function (field_name, errors) {
                var $field       = $form.find('.field_' + field_name),
                    $fieldErrors = $field.find('.field__errors');

                $field.addClass('error');

                $.each(errors, function (index, error) {
                    $fieldErrors.append('<div class="error">' + error + '</div>');
                });
            });
        }

        if (errors.form) {
            var $formErrors = $form.find('.form__errors');

            $.each(errors.form, function (index, error) {
                $formErrors.append('<div class="error">' + error + '</div>');
            });
        }
    };
}
