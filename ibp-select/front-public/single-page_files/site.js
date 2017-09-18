function good_search_helper()
{

	var _this=this;
	var current_request='';
	var cache={};

	var pos = $('#in_search').position();
	var $res_list = $('<div id="quik_search_results"></div>');
	$('#search-div').prepend($res_list);
	$res_list.offset({ top: pos.top + $('#in_search').outerHeight() , left: pos.left});
	_rt('#in_search').bind('keyup',function(){
		current_request=_rt('#in_search').first().value;
		current_request=current_request.replace(/^\s*/, "").replace(/\s*$/, "");
		if(cache[current_request]!=null)
		search_render({interface:'catalog_site',action:'crossiteSuggest',s:current_request},cache[current_request]);
	});



	var dont_close=0;
	_rt(document.body).bind('click',function(){
		if(dont_close==1)
		_rt('#quik_search_results').set({style:{display:'none'}});
		dont_close=1;
	});

	_rt('#quik_search_results').bind('click',function(event){ dont_close=0;	});



	var _t=setInterval(checker,500);

	function checker()
	{
		if(cache[current_request]!=null)return;
		_rt('#quik_search_results').set({style:{display:'none'}});
		cache[current_request]='wait';
		if(current_request.length>1)
			_rt().request({interface:'catalog_site',action:'crossiteSuggest',s:current_request},search_handler);
	}

	function search_handler(get,data)
	{
		eval('data='+data);
		cache[get.s]=data;
		trace(data);
		search_render(get,data);
	}


	function search_render(get,data)
	{
		if(data=='wait')return;
		var rez='';
		var image='';
		var fl=0;
		for(var i in data)
		{
			if (i=="") continue;
			fl++;
			if(data[i]['i']!='') image='<img src="/var/files/'+data[i]['i']+'_60.jpg">';	else image='<b></b>';
			var query = new RegExp("(" + current_request + ")", "gi");
			var text = data[i].replace(query, '<b>$1</b>');
			rez+='<div><a href="/search/?o=m&s='+data[i]+'">'+text+'</a></div>';
		}
		if(fl==0){_rt('#quik_search_results').set({style:{display:'none'}});return;}
//		if(fl>=4)rez+='<div class="last"><a href="/search/?o=m&s='+get.s+'">Посмотреть все результаты</a></div>';
		_rt('#quik_search_results').set({style:{display:'block'}}).html(rez);
	}
}//end of good_search_helper


//------------------------------------------------------------------------------
//------------------------------------------------------------------------------