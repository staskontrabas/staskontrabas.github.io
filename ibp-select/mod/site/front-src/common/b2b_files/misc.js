//============ JSONP =============
var jsonp_url = '';
var jsonp_obj = {};

function jsonp(props,callback)
{
	jsonp_obj = new jsonp_requester(props,callback);
}
function set_jsonp_url(url)
{
	jsonp_url = url;
}
function jsonp_requester(props,callback)
{
	var _this = this;
	var t = new Date();
	var rand = 1 + Math.floor((Math.random()*32767));
	this.id = rand + '' +t.valueOf();

	this.init_request(props,callback);
}
jsonp_requester.prototype.init_request = function(props,callback)
{
	jsonp_requester.prototype['j'+this.id] = callback;
	var request = jsonp_url+'?';
	for(var i in props) request += i + '=' + encodeURIComponent(props[i]) + '&';
	request += 'jsonp=jsonp_obj.j' + this.id;

	var ajax = _rt().create('script',{src:request,id:'j'+this.id,type:'text/javascript'});
	_rt( _rt('script').first().parentNode ).append(ajax);
	_rt('#j'+this.id).bind('load',this.removescript);
}
jsonp_requester.prototype.removescript = function(event)
{
	event=_rt().getEvent(event);
	var obj=_rt().getTarget(event);
	delete jsonp_requester.prototype[obj.id];
	obj.parentNode.removeChild(obj);
}// end of jsonp

// =========================================================
// =========================================================

// cross-browser props
function getClientWidth()
{
  return document.compatMode=='CSS1Compat' && !window.opera?document.documentElement.clientWidth:document.body.clientWidth;
}

function getClientHeight()
{
  return document.compatMode=='CSS1Compat' ? document.documentElement.clientHeight:document.body.clientHeight;
}

function getBodyScrollTop()
{
     return self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);
}

// =========================================================
// =========================================================

// support functions
function trim(str, chars) { // js trim function
	return ltrim(rtrim(str, chars), chars);
}
function ltrim(str, chars) {
	chars = chars || "\\s";
	return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}
function rtrim(str, chars) {
	chars = chars || "\\s";
	return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}// end of js trim

function objectLength(obj) // count object OWN props
{
	var cnt = 0;
	for(var i in obj)
		if (obj.hasOwnProperty(i)) cnt++;
	return cnt;
}

function isParent(child, parent)
{
    if (!child || !parent)
        return false;
    while(true)
    {
        if (child == parent)
            return true;

        if (child.parentNode)
            child = child.parentNode;
        else
            return false;
	}
}

// get crossbrowser position of element on page
function getOffset(elem)
{
    if (elem.getBoundingClientRect)
        return getOffsetRect(elem);
    else
        return getOffsetSum(elem);
}
function getOffsetSum(elem)
{
    var top=0, left=0, bottom=0;
    while(elem)
    {
        top = top + parseInt(elem.offsetTop);
        left = left + parseInt(elem.offsetLeft);
        bottom = top + parseInt(elem.offsetHeight);
        elem = elem.offsetParent;
    }

    return {top: top, left: left, bottom: bottom}
}
function getOffsetRect(elem)
{
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docElem = document.documentElement;

    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;
    var bottom = box.bottom + scrollTop - clientTop;

    return { top: Math.round(top), left: Math.round(left), bottom: Math.round(bottom) };
}// end of getOffsetRect

// =========================================================
// =========================================================


/* === SESSION === */
function logout()
{
	_rt(document.body).append('<form id="out" action="'+_site_url+'return/" method="post"><input name="login" value="0"><input name="password" value="0"><input name="logout" value="1"></form>');
	_rt('#out').first().submit();
	return false;
}

// =========================================================
// =========================================================


// printF functions
function number_format(number, decimals, dec_point, thousands_sep)
{
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ' ' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }    return s.join(dec);
}

// =========================================================
// =========================================================

function getNamedForm(count,firstForm,secondForm,thirdForm)
{
	var ost = count % 100;
	if (ost > 9 && ost < 20)
	{
		return thirdForm;
	}
	else
	{
		ost = ost % 10;
		if (ost == 1)
			return firstForm;
		else if (ost > 1 && ost < 5)
			return secondForm;
		else
			return thirdForm;
	}
}

function adder(id,step,max,min)
{
	if(max == null)max=0;
	if(min == null)min=0;
	var old=parseInt(document.getElementById(id).value);
	var t=parseInt(document.getElementById(id).value)+step;
	if(t<min)t=min;
	if(t>max && max!=0)t=max;
	document.getElementById(id).value=t;
	_rt('#'+id).trigger('keyup');
}

// switch tabs in selector
function select_tab(obj)
{
	var prefix = obj.parentNode.parentNode.id;
	_rt('nobr', obj.parentNode.parentNode ).set({className:'toggle gray'});
	obj.parentNode.className = 'toggle gray act';
	_rt('.'+prefix+'_tab').set({className:prefix+'_tab'+' hide'});
	_rt('#'+prefix+'_'+obj.id).set({className:prefix+'_tab'});
}

function scroll_to_customer()
{
	interval = setInterval(function(){
		clearInterval(interval);
		offset = getOffset(_rt('.error').first());
		_rt().fx(function(x){window.scrollTo(offset.left,offset.top*x);},0.5,'startstop',4);
	},
	1*1000);
}

function scroll_to(id)
{
	var initial_top = getBodyScrollTop();
	interval = setInterval(function(){
		clearInterval(interval);
		offset = getOffset(_rt('#'+id).first());
		var to_scroll = initial_top - offset.top;
		_rt().fx(function(x){window.scrollTo(offset.left,initial_top-to_scroll*x);},0.5,'startstop',4);
	},
	1*1000);
}


/* To emulate separate css selectors in IE6, check previous element */
function isAfterElement(obj,seekName)
{
	node = obj;
	ret = false;
	while(node = node.previousSibling)
	{
		if(node.nodeType == 1)
		{
			if(node.nodeName == seekName) ret = true;
			break;
		}
	}
	return ret;
}


/* Redirect from SWF */
function swf_geturl_backend(url)
{
	var allow = false;
	var parts = url.replace('http://','').split('/');
	var domain = parts[0] || '';
	domain = domain.replace('www.','');

	if( domain === 'xcom-shop.ru' ) allow = true;
	if( domain === 'xcom-dom.ru' ) allow = true;
	if( domain === 'xcom-hobby.ru' ) allow = true;
	if( domain === 'xcomspb.ru' ) allow = true;

	//if(allow) window.location.href = url; //same window
	if(allow) window.open(url); //new window
}