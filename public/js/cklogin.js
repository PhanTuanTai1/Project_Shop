function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

document.addEventListener("DOMContentLoaded", function(event) { 
    var check = getCookie("userID");

    if(check !== undefined) {
        $('#loginbtn').remove();
    }
});

