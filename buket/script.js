$(document).ready(function(){
    var $store = {
        selector: {},
        calculator: {},
        forma: {},
        total_price: 0
    }
    
    //отправка формы
    $('#calculator__submit-btn').on('click', function(){
        
        var data = Object.assign({forma: $store.forma.value, total_price: $store.total_price}, $store.calculator)
        
        $.ajax({
            type: "POST",
            url: "some.php",
            data: data
        }).done(function(res){
            console.log(res)
        });
        
    })
    
    var action = {
        setItem: function(props){
            var id = props.params.category + '-' + props.params.id + (props.params.color_list.length ? '-' + props.color : '')
        
            var data = {
                id: id,
                title: props.params.title,
                color: props.color,
                color_selected: $store.selector[props.params.category][props.params.item_id].color_selected,
                count: 1,
                price: props.params.price,
                params: Object.assign({}, props.params)
            }
            
            $store.calculator[props.params.category].push(data)
            this.setTotalPrice()
        },
        removeItem: function(props){
            var id = props.params.category + '-' + props.params.id + (props.params.color_list.length ? '-' + props.color : '')
            
            for(var i = 0, len = $store.calculator[props.params.category].length; i < len; i++){
                if($store.calculator[props.params.category][i].id == id){
                    $store.calculator[props.params.category].splice(i, 1)
                    break;
                }
            }
            this.setTotalPrice()
        },
        changeItem: function(props){
            var category = $store.calculator[props.params.params.category]
            
            for(var i = 0, len = category.length; i < len; i++){
                if(category[i].id == props.params.id){
                    category[i].id = category + '-' + props.params.params.id + '-' + props.color
                    category[i].color = props.color
                    category[i].count = props.params.count
                    break;
                }
            }
        },
        setTotalPrice: function(){
            var categoryKeys = Object.keys($store.calculator),
                total_price = 0
            
            for(var i = 0, len = categoryKeys.length; i < len; i++){
                for(var j = 0, lenCat = $store.calculator[categoryKeys[i]].length; j < lenCat; j++){
                    total_price += parseInt($store.calculator[categoryKeys[i]][j].price) * $store.calculator[categoryKeys[i]][j].count
                }
            }
            
            $store.total_price = total_price
        },
        onCount: function(props, count){
            var category = $store.calculator[props.params.category]
            for(var i = 0, len = category.length; i < len; i++){
                if(category[i].id == props.id){
                    category[i] = Object.assign(category[i], {count: count})
                    break
                }
            }
            
            this.setTotalPrice()
            
            drawCalculator.render()
        },
        onChangeColor: function(props){
            var item = $store.selector[props.params.params.category][props.params.params.item_id]
            for(var i = 0, len = item.color_selected.length; i < len; i++){
                if(item.color_selected[i] == props.params.color){
                    item.color_selected[i] = props.color
                    break
                }
            }
            this.changeItem(props)
            
            drawCalculator.render()
        },
        onItem: function(props){
            var item = $store.selector[props.params.category][props.params.item_id]
            var color = {color: props.params.color_list.length ? props.params.color_list[0] : false}
            
            if(!props.params.color_list.length){
                item.active = !item.active
                item.active ? this.setItem(Object.assign(props, color)) : this.removeItem(Object.assign(props, color))
            }
            else if(props.params.color_list.length == 1){
                item.active = !item.active
                item.active ? (item.color_selected.push(props.params.color_list[0]), this.setItem(Object.assign(props, color))) : (item.color_selected.splice(0, 1), this.removeItem(Object.assign(props, color)))
            }
            else{
                if(!item.active){
                    item.active = true
                    item.color_selected.push(props.params.color_list[0])
                    this.setItem(Object.assign(props, color))
                }
            }
            
            drawCalculator.render()
        },
        onColor: function(props){
            var item = $store.selector[props.params.category][props.params.item_id]
            var exist = -1
            
            for(var i = 0, len = item.color_selected.length; i < len; i++){
                if(item.color_selected[i] == props.color){
                    exist = i
                }
            }
            
            if(exist == -1){
                item.color_selected.push(props.color)
                this.setItem(props)
            }
            else{
                item.color_selected.splice(exist, 1)
                this.removeItem(props)
            }
            
            if(!item.color_selected.length){
                item.active = false
            }
            else{
                item.active = true
            }
            
            drawCalculator.render()
        },
        onDelete: function(props){
            var category = props.params.category,
                id = props.id,
                item_id = props.params.item_id,
                color = props.color
                
            for(var i = 0, len = $store.selector[category][item_id].color_selected.length; i < len; i++){
                if($store.selector[category][item_id].color_selected[i] == color){
                    $store.selector[category][item_id].color_selected.splice(i, 1)
                    if(!$store.selector[category][item_id].color_selected.length){
                        $store.selector[category][item_id].active = false
                    }
                    break
                }
            }
            
            for(var i = 0, len = $store.calculator[category].length; i < len; i++){
                if($store.calculator[category][i].id == id){
                    $store.calculator[category].splice(i, 1)
                    break
                }
            }
            this.setTotalPrice()
            drawCalculator.render()
        }
    }
    
    var drawCalculator = {
        stack: $('.calculator__stack'),
        total_price: $('.calculator__total span[name="total_price"'),
        forma: $('.calculator__forma'),
        template: {
            categoryItem: function(o){
                var html = '<div class="calculator__stack-item" >'+
                        '<div class="calculator__stack-item--cell calculator__stack-item--title"><span>'+ o.title +'</span></div>'+
                        '<div class="calculator__stack-item--cell calculator__stack-item--color">'+
                            (o.color && o.params.color_list.length > 1 ? 
                            '<div class="calculator__stack-item--color-select" style="background-color: '+ o.color +';">'+
                            '</div>'+
                            '<div class="calculator__stack-item--color-list"></div>'
                            : '') +
                        '</div>'+
                        '<div class="calculator__stack-item--cell calculator__stack-item--count"></div>'+
                        '<div class="calculator__stack-item--cell calculator__stack-item--delete">'+
                            '<div class="calculator__stack-item--delete-btn"></div>'+
                        '</div>'+
                    '</div>'
                return html
            },
            colorItem: function(o){
                var html = '<div class="selectors__block-item--color" style="background-color: '+ o.color +';"></div>'
                return html
            },
            colorItemSelected: function(o){
                var html = '<div class="selectors__block-item--selected-color" style="background-color: '+ o.color +';"></div>'
                return html
            }
        },
        init: function(){
            $('.selectors__block-item').each(function(index){
                var params = $(this).data('params')
                var item_id = params.category + '-' + params.id
                
                params = Object.assign(params, {item_id: item_id})
                
                if($store.selector.hasOwnProperty([params.category])){
                    $store.selector[params.category][item_id] = {active: false}
                }
                else{
                    $store.selector[params.category] = {}
                    $store.calculator[params.category] = []
                    $store.selector[params.category][item_id] = {active: false}
                }
                
                $(this).attr('id', item_id)
                $store.selector[params.category][item_id]['color_selected'] = params.color_list.length ? [] : false
                
                $(this).append('<div class="selectors__block-item--selected-wrap"></div>')
                
                $(this).on('click', function(){
                    action.onItem({params: Object.assign({}, params)})
                })
                
                for(var i = 0, len = params.color_list.length; i < len; i++){
                    var colorItem = $(drawCalculator.template.colorItem({color: params.color_list[i]})).appendTo($('.selectors__block-item--color-list', $(this)))
                    
                    colorItem.attr('id', params.category + '-' + params.id + '-' + i)
                    colorItem.attr('data-color', params.color_list[i])
                    
                    colorItem.on('click', function(e){
                        e.preventDefault()
                        e.stopPropagation()
                        
                        action.onColor({
                            color_id: $(this).attr('id'),
                            color: $(this).data('color'),
                            params: Object.assign({}, params)
                        })
                    })
                }
            })
            
            $('input[name="former_btn"]').on('click', function(){
                $store.forma['value'] = $('input[name="former_btn"]:checked').val()
                $store.forma['title'] = $('input[name="former_btn"]:checked').data('params').title
                drawCalculator.render()
            })
            
            $store.forma['value'] = $('input[name="former_btn"]:checked').val()
            $store.forma['title'] = $('input[name="former_btn"]:checked').data('params').title
            this.forma.html($store.forma.title)
        },
        renderSelector: function(){
            var keysCategory = Object.keys($store.selector)
            for(var i = 0, lenCat = keysCategory.length; i < lenCat; i++){
                var keysItem = Object.keys($store.selector[keysCategory[i]])
                
                for(var j = 0, lenItem = keysItem.length; j < lenItem; j++){
                    $('.selectors__block-item--selected-wrap', $('#' + keysItem[j])).html('')
                    if($store.selector[keysCategory[i]][keysItem[j]].active){
                        $('#' + keysItem[j]).addClass('active')
                        
                        var arColor = $store.selector[keysCategory[i]][keysItem[j]].color_selected
                        if(arColor.length){
                            $('.selectors__block-item--color', $('#' + keysItem[j])).removeClass('active')
                            
                            for(var c = 0, lenColor = arColor.length; c < lenColor; c++){
                                $(drawCalculator.template.colorItemSelected({color: arColor[c]})).appendTo($('.selectors__block-item--selected-wrap', $('#' + keysItem[j])))
                                
                                $('.selectors__block-item--color[data-color="'+arColor[c]+'"]', $('#' + keysItem[j])).addClass('active')
                            }
                        }
                    }
                    else{
                        $('#' + keysItem[j]).removeClass('active')
                        $('.selectors__block-item--color', $('#' + keysItem[j])).removeClass('active')
                    }
                }
            }
        },
        renderCalculator: function(){
            this.stack.html('');
            var categoryKeys = Object.keys($store.calculator)
            
            for(var i = 0, len = categoryKeys.length; i < len; i++){
                for(var j = 0, lenCat = $store.calculator[categoryKeys[i]].length; j < lenCat; j++){
                    var elem = $(this.template.categoryItem($store.calculator[categoryKeys[i]][j])).appendTo(this.stack)
                    var params = Object.assign({}, $store.calculator[categoryKeys[i]][j])
                    
                    $('.calculator__stack-item--delete-btn', elem).on('click', function(o){
                        action.onDelete(o)
                    }.bind(null, params))
                    
                    var list = $('.calculator__stack-item--color-list', elem)
                    var colorList = []
                    
                    for(var l = 0, lenL = params.params.color_list.length; l < lenL; l++){
                        var exist = false
                        for(var s = 0, lenS = params.color_selected.length; s < lenS; s++){
                            if(params.params.color_list[l] == params.color_selected[s])
                                exist = true
                        }
                        if(!exist)
                            colorList.push(params.params.color_list[l])
                    }
                    
                    for(var l = 0, lenL = colorList.length; l < lenL; l++){
                        var colorItem = $('<div class="calculator__stack-item--color-item"></div>').appendTo(list)
                        colorItem.css({'background-color': colorList[l]})
                        colorItem.data('params', params)
                        colorItem.data('color', colorList[l])
                        
                        colorItem.on('click', function(){
                            action.onChangeColor({params: $(this).data('params'), color: $(this).data('color')})
                        })
                    }
                    $('.calculator__stack-item--color-select', elem).on('click', function(e){
                        var list = $('.calculator__stack-item--color-list', $(this).parent())
                            
                        if(!list.hasClass('active')){
                            $('.calculator__stack-item--color-list.active').removeClass('active')
                            list.addClass('active')
                            e.stopPropagation()
                            $(document).one('click', function(){
                                list.removeClass('active')
                            })
                        }
                    })
                    
                    var count = $('.calculator__stack-item--count', elem)                    
                    countMinus = $('<button class="calculator__sign" name="minus">&ndash;</button> ').appendTo(count)
                    countValue = $('<span class="calculator__count-value">'+ params.count +'</span>').appendTo(count)
                    countPlus = $('<button class="calculator__sign" name="plus">+</button> ').appendTo(count)
                 
                    countMinus.on('click', function(o, e){
                        if(o.count < 2)
                            return
                        action.onCount(o, --o.count)
                    }.bind(null, Object.assign({}, params)))
                    
                    countPlus.on('click', function(o, e){
                        e.preventDefault()
                        action.onCount(o, ++o.count)
                    }.bind(null, Object.assign({}, params)))
                }
            }
            this.forma.html($store.forma.title)
        },
        renderTotal: function(){
            this.total_price.html($store.total_price)
        },
        render: function(){
            drawCalculator.renderSelector()
            drawCalculator.renderCalculator()
            drawCalculator.renderTotal()
        }
    }
    
    var init = function(){
        drawCalculator.init()
        drawCalculator.render()
    }
    
    init()
    
})




