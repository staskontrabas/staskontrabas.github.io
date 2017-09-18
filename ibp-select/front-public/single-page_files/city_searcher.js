function city_searcher(id, place, change_city_callback) {
    var _this = this;
    
    this.current = '',
    this.cache = [];

    var $city_searcher = $(id);

    this.show = function() {
        if ($city_searcher.length != 0) {
            $city_searcher.show();
        } else {
            _this.create();
        }
    }

    this.hide = function() {
        $city_searcher.hide();

        $('.options', $city_searcher).remove();
        $('input', $city_searcher).val('');
    }

    this.create = function() {
        $city_searcher = $('<div><div id="city_searcher_box"><div><input type="text" value="" /><span class="close pointer red tx14">&times;</span><div><div></div>').attr('id', id.substr(1));

        $('span', $city_searcher).click(_this.hide);
        $('input', $city_searcher).keyup(function(){
            _this.current = $(this).val().trim();

            if (_this.cache[_this.current]) {
                _this.render(_this.cache[_this.current]);
            }

            jsonp(
                {
                    interface: 'delivery',
                    action: 'getCities',
                    filter: _this.current
                },
                _this.render
            );
        });

        $(place).before($city_searcher);
    }

    this.render = function(data) {
        try {
            $('#bill_table').mouseover();
        } catch(e){}

        _this.cache[_this.current] = data;
        var $options = $('<div class="options"></div>');

        $('.options', $city_searcher).remove();

        $.each(data['order'], function(i, v){
            var name = data['names'][v];
            var $opt = $('<a href="#">'+name+'</a>').click(function(){
                change_city_callback(v);

                _this.hide();
                return false;
            });

            $options.append($opt);
        });

        $('#city_searcher_box', $city_searcher).append($options);
    }
}