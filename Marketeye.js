var itemlist = new Array();
var INDEX_BUY = 0;
var INDEX_SELL = 1;
var loadedrow = 0;
var orderby = "buysum";
var orderdir = true;
var Item = /** @class */ (function () {
    function Item(typeid, itemname, quantity, sell, buy) {
        if (typeof (typeid) == 'number') {
            this.typeid = typeid;
            this.itemname = itemname;
            this.price = new Array();
            this.price[INDEX_BUY] = buy;
            this.price[INDEX_SELL] = sell;
            this.volume = 0;
            this.quantity = quantity;
            this.tr_datarow = document.createElement("tr");
            this.formtr();
            this.getPrice();
        }
        else {
            this.typeid = typeid.typeid;
            this.itemname = typeid.itemname;
            this.quantity = typeid.quantity;
            this.price = typeid.price;
            this.volume = typeid.volume;
            this.tr_datarow = typeid.tr_datarow;
        }
    }
    Item.prototype.formtr = function () {
        while (this.tr_datarow.hasChildNodes()) {
            this.tr_datarow.removeChild(this.tr_datarow.childNodes[0]);
        }
        var img_icon = document.createElement("img");
        img_icon.src = "https://images.evetech.net/types/" + this.typeid + "/icon";
        var td_icon = this.tr_datarow.insertCell(-1);
        var td_itemname = this.tr_datarow.insertCell(-1);
        var td_quantity = this.tr_datarow.insertCell(-1);
        var td_price = this.tr_datarow.insertCell(-1);
        var td_pricesum = this.tr_datarow.insertCell(-1);
        img_icon.className = "Marketeye_icon";
        td_icon.className = "Marketeye_icon";
        td_itemname.className = "Marketeye_itemname";
        td_quantity.className = "Marketeye_quantity";
        td_price.className = "Marketeye_price";
        td_pricesum.className = "Marketeye_pricesum";
        td_icon.appendChild(img_icon);
        td_quantity.innerHTML = number_format(this.quantity, 0);
        td_itemname.innerHTML = this.itemname;
        td_price.innerHTML = number_format(this.price[INDEX_SELL], 2) + "<br/>" + number_format(this.price[INDEX_BUY], 2);
        td_pricesum.innerHTML = number_format(this.price[INDEX_SELL] * this.quantity, 2) + " ISK<br/>" + number_format(this.price[INDEX_BUY] * this.quantity, 2) + " ISK";
        Calc_total();
    };
    Item.prototype.getPrice = function () {
        var _this = this;
        var ESIdata = new XMLHttpRequest();
        ESIdata.onreadystatechange = function () {
            if (ESIdata.readyState == XMLHttpRequest.DONE) {
                var returnvalue = JSON.parse(ESIdata.responseText);
                if (_this.price[INDEX_BUY] == 0) {
                    _this.price[INDEX_BUY] = returnvalue.buy;
                }
                else if (_this.price[INDEX_BUY] == -1) {
                    _this.price[INDEX_BUY] = 0;
                }
                if (_this.price[INDEX_SELL] == 0) {
                    _this.price[INDEX_SELL] = returnvalue.sell;
                }
                else if (_this.price[INDEX_SELL] == -1) {
                    _this.price[INDEX_SELL] = 0;
                }
                _this.tr_datarow.cells[3].innerHTML = number_format(_this.price[INDEX_SELL], 2) + "<br/>" + number_format(_this.price[INDEX_BUY], 2);
                _this.tr_datarow.cells[4].innerHTML = number_format(_this.price[INDEX_SELL] * _this.quantity, 2) + " ISK<br/>" + number_format(_this.price[INDEX_BUY] * _this.quantity, 2) + " ISK";
                loadedrow++;
                Calc_total();
                if (loadedrow == itemlist.length) {
                    loadingComplete();
                }
            }
        };
        ESIdata.open("GET", "https://lindows.kr/IndustryCalculator/get_market_data.php?typeid=" + this.typeid, true);
        ESIdata.setRequestHeader("Content-Type", "application/json");
        ESIdata.send();
    };
    return Item;
}());
function display_total() {
    var div_topresult = document.createElement("div");
    div_topresult.id = "top_calc_result";
    div_topresult.className = "Marketeye_topresult";
    return div_topresult;
}
function display_table(index, desc) {
    var table_listt = document.createElement("table");
    table_listt.className = "Marketeye_list";
    switch (index) {
        case "buysum":
            for (var i = 0; i < itemlist.length; i++) {
                for (var j = i + 1; j < itemlist.length; j++) {
                    if ((itemlist[i].price[INDEX_BUY] * itemlist[i].quantity < itemlist[j].price[INDEX_BUY] * itemlist[j].quantity && desc) //내림차순
                        || (itemlist[i].price[INDEX_BUY] * itemlist[i].quantity > itemlist[j].price[INDEX_BUY] * itemlist[j].quantity && !desc) //올림차순
                    ) {
                        var cloneItem = new Item(itemlist[i]);
                        itemlist[i] = new Item(itemlist[j]);
                        itemlist[j] = new Item(cloneItem);
                    }
                }
            }
            break;
        case "sellsum":
            for (var i = 0; i < itemlist.length; i++) {
                for (var j = i + 1; j < itemlist.length; j++) {
                    if ((itemlist[i].price[INDEX_SELL] * itemlist[i].quantity < itemlist[j].price[INDEX_SELL] * itemlist[j].quantity && desc) //내림차순
                        || (itemlist[i].price[INDEX_SELL] * itemlist[i].quantity > itemlist[j].price[INDEX_SELL] * itemlist[j].quantity && !desc) //올림차순
                    ) {
                        var cloneItem = new Item(itemlist[i]);
                        itemlist[i] = new Item(itemlist[j]);
                        itemlist[j] = new Item(cloneItem);
                    }
                }
            }
            break;
        case "buy":
            for (var i = 0; i < itemlist.length; i++) {
                for (var j = i + 1; j < itemlist.length; j++) {
                    if ((itemlist[i].price[INDEX_BUY] < itemlist[j].price[INDEX_BUY] && desc) //내림차순
                        || (itemlist[i].price[INDEX_BUY] > itemlist[j].price[INDEX_BUY] && !desc) //올림차순
                    ) {
                        var cloneItem = new Item(itemlist[i]);
                        itemlist[i] = new Item(itemlist[j]);
                        itemlist[j] = new Item(cloneItem);
                    }
                }
            }
            break;
        case "sell":
            for (var i = 0; i < itemlist.length; i++) {
                for (var j = i + 1; j < itemlist.length; j++) {
                    if ((itemlist[i].price[INDEX_SELL] < itemlist[j].price[INDEX_SELL] && desc) //내림차순
                        || (itemlist[i].price[INDEX_SELL] > itemlist[j].price[INDEX_SELL] && !desc) //올림차순
                    ) {
                        var cloneItem = new Item(itemlist[i]);
                        itemlist[i] = new Item(itemlist[j]);
                        itemlist[j] = new Item(cloneItem);
                    }
                }
            }
            break;
        case "quantity":
            for (var i = 0; i < itemlist.length; i++) {
                for (var j = i + 1; j < itemlist.length; j++) {
                    if ((itemlist[i].quantity < itemlist[j].quantity && desc) //내림차순
                        || (itemlist[i].quantity > itemlist[j].quantity && !desc) //올림차순
                    ) {
                        var cloneItem = new Item(itemlist[i]);
                        itemlist[i] = new Item(itemlist[j]);
                        itemlist[j] = new Item(cloneItem);
                    }
                }
            }
            break;
        case "itemname":
            for (var i = 0; i < itemlist.length; i++) {
                for (var j = i + 1; j < itemlist.length; j++) {
                    if ((itemlist[i].itemname < itemlist[j].itemname && desc) //내림차순
                        || (itemlist[i].itemname > itemlist[j].itemname && !desc) //올림차순
                    ) {
                        var cloneItem = new Item(itemlist[i]);
                        itemlist[i] = new Item(itemlist[j]);
                        itemlist[j] = new Item(cloneItem);
                    }
                }
            }
            break;
    }
    var tr_column = table_listt.insertRow(-1);
    var tr_column_ = table_listt.insertRow(-1);
    tr_column.className = "Marketeye_column";
    tr_column_.className = "Marketeye_column";
    var td_item = tr_column.insertCell(-1);
    var td_quantity = tr_column.insertCell(-1);
    var td_price_sell = tr_column.insertCell(-1);
    var td_price_buy = tr_column_.insertCell(-1);
    var td_pricesum_sell = tr_column.insertCell(-1);
    var td_pricesum_buy = tr_column_.insertCell(-1);
    td_item.colSpan = 2;
    td_item.rowSpan = 2;
    td_item.className = "Marketeye_column_item";
    td_item.onclick = function () { loadingComplete("itemname"); };
    td_quantity.rowSpan = 2;
    td_quantity.className = "Marketeye_column_quantity";
    td_quantity.onclick = function () { loadingComplete("quantity"); };
    td_price_sell.className = "Marketeye_column_price";
    td_price_buy.className = "Marketeye_column_price";
    td_pricesum_sell.className = "Marketeye_column_pricesum";
    td_pricesum_buy.className = "Marketeye_column_pricesum";
    td_price_sell.onclick = function () { loadingComplete("sell"); };
    td_price_buy.onclick = function () { loadingComplete("buy"); };
    td_pricesum_sell.onclick = function () { loadingComplete("sellsum"); };
    td_pricesum_buy.onclick = function () { loadingComplete("buysum"); };
    td_item.innerHTML = "Item";
    td_quantity.innerHTML = "Qunty";
    td_price_sell.innerHTML = "Sell(unit)";
    td_price_buy.innerHTML = "Buy(unit)";
    td_pricesum_sell.innerHTML = "Sell(Sum)";
    td_pricesum_buy.innerHTML = "Buy(Sum)";
    switch (orderby) {
        case "itemname":
            if (orderdir) {
                td_item.innerHTML += "▼";
            }
            else {
                td_item.innerHTML += "▲";
            }
            break;
        case "quantity":
            if (orderdir) {
                td_quantity.innerHTML += "▼";
            }
            else {
                td_quantity.innerHTML += "▲";
            }
            break;
        case "sell":
            if (orderdir) {
                td_price_sell.innerHTML += "▼";
            }
            else {
                td_price_sell.innerHTML += "▲";
            }
            break;
        case "buy":
            if (orderdir) {
                td_price_buy.innerHTML += "▼";
            }
            else {
                td_price_buy.innerHTML += "▲";
            }
            break;
        case "sellsum":
            if (orderdir) {
                td_pricesum_sell.innerHTML += "▼";
            }
            else {
                td_pricesum_sell.innerHTML += "▲";
            }
            break;
        case "buysum":
            if (orderdir) {
                td_pricesum_buy.innerHTML += "▼";
            }
            else {
                td_pricesum_buy.innerHTML += "▲";
            }
            break;
    }
    for (var i = 0; i < itemlist.length; i++) {
        table_listt.appendChild(itemlist[i].tr_datarow);
    }
    var resulttr = table_listt.insertRow(-1);
    resulttr.insertCell(-1);
    resulttr.insertCell(-1);
    resulttr.insertCell(-1);
    var resulttd = resulttr.insertCell(-1);
    resulttd.id = "bottom_calc_result";
    resulttd.colSpan = 2;
    resulttd.className = "Marketeye_bottomresult";
    return table_listt;
}
function Calc_total() {
    var div_topresult = document.getElementById("top_calc_result");
    var td_bottomresult = document.getElementById("bottom_calc_result");
    var buytotal = 0, selltotal = 0;
    for (var i = 0; i < itemlist.length; i++) {
        buytotal += itemlist[i].price[INDEX_BUY] * itemlist[i].quantity;
        selltotal += itemlist[i].price[INDEX_SELL] * itemlist[i].quantity;
    }
    if (div_topresult !== null) {
        div_topresult.innerHTML = "Sell : " + number_format(selltotal, 2) + " ISK<br/>Buy : " + number_format(buytotal, 2) + " ISK";
    }
    if (td_bottomresult !== null) {
        td_bottomresult.innerHTML = "Sell : " + number_format(selltotal, 2) + " ISK<br/>Buy : " + number_format(buytotal, 2) + " ISK";
    }
}
function loadingComplete(index, desc) {
    if (index === undefined) {
        index = "buysum";
        if (desc === undefined) {
            desc = true;
        }
    }
    else {
        if (desc === undefined) {
            if (index == orderby) {
                desc = !orderdir;
                orderdir = desc;
            }
            else {
                orderby = index;
                desc = true;
                orderdir = true;
            }
        }
        else {
            orderdir = desc;
        }
    }
    var tablespace = document.getElementById("table_space");
    while (tablespace.hasChildNodes()) {
        tablespace.removeChild(tablespace.childNodes[0]);
    }
    tablespace.appendChild(display_total());
    tablespace.appendChild(display_table(index, desc));
    Calc_total();
}
function _2digit(n) {
    var s = n + "";
    while (s.length < 2) {
        s = "0" + s;
    }
    return s;
}
function number_format(number, decimals, dec_point, thousands_sep) {
    // Strip all characters but numerical ones.
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number, prec = !isFinite(+decimals) ? 0 : Math.abs(decimals), sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep, dec = (typeof dec_point === 'undefined') ? '.' : dec_point, s, toFixedFix = function (n, prec) {
        var k = Math.pow(10, prec);
        return '' + Math.round(n * k) / k;
    };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}
function load_marketeye_widget(_width, _height) {
    if (typeof _width == "number") {
        _width = _width.toString() + "px";
    }
    if (typeof _height == "number") {
        _height = _height.toString() + "px";
    }
    var marketeye_span_body = document.createElement("span");
    marketeye_span_body.style.display = "inline-block";
    marketeye_span_body.style.width = _width;
    marketeye_span_body.style.height = _height;
    marketeye_span_body.style.textAlign = "right";
    marketeye_span_body.style.border = "1px solid blue";
    var marketeye_span_title = document.createElement("span");
    marketeye_span_title.style.fontSize = "13px";
    marketeye_span_title.style.textAlign = "left";
    marketeye_span_title.innerHTML = "MarketEye Widget";
    var marketeye_form_body = document.createElement("form");
    marketeye_form_body.method = "POST";
    marketeye_form_body.action = "https://lindows.kr/PublicESI/Marketeye/";
    marketeye_form_body.target = "_blank";
    marketeye_form_body.style.width = "calc( 99% - 2px )";
    ;
    marketeye_form_body.style.height = "calc( 99% - 2px )";
    marketeye_form_body.style.margin = "1px";
    var marketeye_textarea = document.createElement("textarea");
    marketeye_textarea.value = "Copy - Paste(Ctrl C V) Items list.";
    marketeye_textarea.style.width = "99% ";
    marketeye_textarea.style.height = "calc( 99% - 40px )";
    marketeye_textarea.name = "itemlist";
    marketeye_textarea.style.resize = "none";
    marketeye_textarea.style.backgroundColor = "white";
    var marketeye_submitbutton = document.createElement("input");
    marketeye_submitbutton.type = "submit";
    marketeye_submitbutton.value = "Parse";
    marketeye_submitbutton.style.width = "70px";
    marketeye_submitbutton.style.height = "20px";
    marketeye_submitbutton.style.fontSize = "13px";
    marketeye_submitbutton.style.color = "rgb(3,0,175)";
    marketeye_submitbutton.style.backgroundColor = "rgb(56,149,255)";
    marketeye_submitbutton.style.border = "2px solid rgb(3,0,175)";
    marketeye_submitbutton.style.borderRadius = "10px";
    marketeye_submitbutton.onmouseover = function () {
        marketeye_submitbutton.style.backgroundColor = "rgb(137, 192, 255)";
    };
    marketeye_submitbutton.onmouseout = function () {
        marketeye_submitbutton.style.backgroundColor = "rgb(56,149,255)";
    };
    marketeye_form_body.appendChild(marketeye_span_title);
    marketeye_form_body.appendChild(marketeye_textarea);
    marketeye_form_body.appendChild(marketeye_submitbutton);
    marketeye_span_body.appendChild(marketeye_form_body);
    return marketeye_span_body;
}
