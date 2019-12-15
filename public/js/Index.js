function Search2(event){
    if(event.which == 13){
        event.preventDefault();
        var link = "/search/" + document.getElementById("search_custom").value;
        window.location.replace(link);
    }
}