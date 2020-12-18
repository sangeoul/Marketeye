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
