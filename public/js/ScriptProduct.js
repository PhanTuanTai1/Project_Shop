var category;
var pid_save;
var Limit = 6;
var pid = null;
var first;
function CreateTagScript(html){
    var scriptElement = document.createElement( "script" );
        scriptElement.setAttribute("id","handle");
        scriptElement.src = html;
        document.getElementById("script").appendChild(scriptElement);
}
function onClickCategory(obj){
    getProduct(obj);
    setActive(obj);
}
function setContent(html,status_change){
    if(parseInt(status_change) != 2) document.getElementById("brand").innerHTML = html[0];
    document.getElementById("listProduct").innerHTML = html[1];    
    if(document.getElementById("pagination").querySelectorAll(".page-item").length == 0) document.getElementById("pagination").innerHTML = html[2];     
    if(document.getElementById("handle") != null) document.getElementById("script").removeChild(document.getElementById("handle"));
    CreateTagScript(html[3]);
}
function getProduct(obj,status_change){
    if(category != obj.getAttribute('data-link-type').split("/")[2]) document.getElementById("pagination").innerHTML = "";
    var pid = obj.getAttribute('data-id');
    if(pid != null) pid_save = pid.split("P")[1];
    var link = obj.getAttribute('data-link-type') + "?pid=" + pid + "&Limit=" + Limit;
    category = obj.getAttribute('data-link-type').split("/")[2];  
    $.get(link,function(data,status){
        var html = data.split("<p>split</p>");
        setContent(html,status_change);   
    })
}

var check_brand = "false";
var check_color = "false";
var check_price = "false";
var link_save = "";
function Filter(obj){
    var checkbox_brand = document.getElementsByClassName("form-check-input");
    var select_color = document.getElementsByClassName("color");
    var price = document.getElementById("price").textContent.split("-");
    var brand = "";
    var color = "";
    var minPrice = "";
    var maxPrice = "";
    if(typeof(category) == "undefined") category = document.getElementById("category-menu").getElementsByClassName("active")[0].firstElementChild.innerHTML;
    for(var i = 0;i < checkbox_brand.length;i++){
        if(checkbox_brand[i].checked == true) brand += checkbox_brand[i].value;
    }
    if(brand != "") check_brand = "true";
    else  check_brand = "false";
    for(var i = 0;i < select_color.length;i++){
        if(select_color[i].style.cssText != "") color +=  select_color[i].getAttribute("data-value");
    }
    if(color != "") check_color = "true";
    else  check_color = "false";
    if(parseInt(price[0].split("$")[1]) > 10 || parseInt(price[1].split("$")[1]) < 1000) {
       minPrice = price[0].split("$")[1];
       maxPrice = price[1].split("$")[1];
    }
    if(minPrice != "" || maxPrice != "") check_price = "true";
    else check_price = "false";
    var link;
    if(obj.getAttribute('data-id') == null)
        link = "/Filter?category=" + category + "&brand=" + brand + "&color=" + color + "&minPrice=" + minPrice + "&maxPrice=" + maxPrice + "&Limit=" + Limit;
    else link = "/Filter?category=" + category + "&brand=" + brand + "&color=" + color + "&minPrice=" + minPrice + "&maxPrice=" + maxPrice + "&Limit=" + Limit + "&pid=" + obj.getAttribute('data-id'); 
    //alert(link);
    $.get(link,function(data,status){
        var html = data.split("<p>split</p>");
        document.getElementById("listProduct").innerHTML = html[0];
        if(link_save != link) {
            document.getElementById("pagination").innerHTML = html[1];
            link_save = link;
        }
        if(document.getElementById("handle") != null) document.getElementById("script").removeChild(document.getElementById("handle"));
        var scriptElement = document.createElement( "script" );
        scriptElement.setAttribute("id","handle");
        scriptElement.src = html[2];
        document.getElementById("script").appendChild(scriptElement);
    })
}
function selectColor(obj){
    if(obj.style.cssText != "") obj.style.cssText = "";
    else obj.style = "border-style: solid;border-color:orange;"
}
function Change(obj){
    Limit = obj.value;
    Filter(obj);
}
function GetProductPage(obj){
    setActivePage(obj);
    if(check_brand == "true" || check_color == "true" || check_price == "true") Filter(obj);
    else {
        getProduct(obj,2);
    }
}
function setActive(obj){
    var category_active = document.getElementById("category-menu").getElementsByClassName("active")[0];
    category_active.classList.remove("active");
    obj.parentElement.classList.add("active");
}
function setActivePage(obj){
    var page_active = document.getElementById("list-page").getElementsByClassName("active")[0];
    page_active.classList.remove("active");
    obj.parentElement.classList.add("active");
}
function Search(event){
    if(event.which == 13){
        event.preventDefault();
        var link = "/search/" + document.getElementById("search_custom").value;
        window.location.replace(link);
    }
}