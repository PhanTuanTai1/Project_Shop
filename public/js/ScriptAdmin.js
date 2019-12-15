function getListCategory(){
    var link = "/admin/CategoryManagement"
    $.get(link,function(data,status){
        var content = document.getElementById('main_content');
        content.innerHTML = data
    })
}
function AddCategory(id){
    var value = document.getElementById(id).value;
    var link = "/admin/AddCategory"
    $.post(link,{'categoryName' : value},function(data){
        location.reload();
   })
}
function getListProduct(){
    var link = "/admin/ProductManagement/null";
    $.get(link,function(data,status){
        var content = document.getElementById('main_content');
        content.innerHTML = data;
    })
}
function select(){
    var link = "/admin/ListProductAdmin/" + document.getElementById("select-category").value;
    $.get(link,function(data,status){
        var content = document.getElementById('admin_product');
        content.innerHTML = data;
    })
}
function selectQuantity(){
    var link = "/admin/ListProductQuantityAdmin/" + document.getElementById("select-category").value;
    $.get(link,function(data,status){
        var content = document.getElementById('admin_product');
        content.innerHTML = data;
    })
}
function getForm(){
    var link = "/admin/AddProduct";
    $.get(link,function(data,status){
        var content = document.getElementById('main_content');
        content.innerHTML = data;
    })
}
var listPic = [];
function picture(){
    listPic = [];
    var file = document.getElementById("files");
    for(var i = 0;i<file.files.length;i++){
        listPic.push(file.files[i].name);
    }
    alert(listPic);
}
function submit(category,product_name,brand,price){
    var link = "/admin/AddProduct";
    var cate = document.getElementById(category).value;
    var productName = document.getElementById(product_name).value;
    var brand = document.getElementById(brand).value;
    var price = document.getElementById(price).value;  
    //alert(document.getElementById("files"));
    $.post(link,{
        "CategoryName" :cate,
        "ProductName" : productName,
        "Brand" : brand,
        "Price" : price,
        "Pictures" : listPic
    },function(data,status){
        location.reload();
    })
}
function getFormEdit(obj){
    var link = "/admin/EditProduct/";
    var pid = obj.getAttribute("data-id");
    link += pid;
    $.get(link,function(data,status){
        var content = document.getElementById('main_content');
        content.innerHTML = data;
    })
}
function DeleteProduct(id){
    var link = "/admin/DeleteProduct/";
    link += document.getElementById(id).getAttribute("data-id") + "?category=" + document.getElementById(id).getAttribute("data-cate");
    $.post(link,function(data,status){
        location.reload();
    });
}
function setPID(obj){
    document.getElementById("btnConfirm").setAttribute("data-id",obj.getAttribute("data-id"));
    document.getElementById("btnConfirm").setAttribute("data-cate",obj.getAttribute("data-cate"));
}

function Save(id) {
    //alert(id);

    var dpId = '#SelectLm' + id;

    var dpValue = $(dpId).val();

    $.post("/admin/setStatus",{
        "Varies": id,
        "Status": dpValue
    },function(data,status){
        $.get("/admin/OrderManagementDetail",function(data,status){
            var content = document.getElementById('orders');
            content.innerHTML = data;
        })
    });
}

$(document).on("click", ".open-AddBookDialog", function () {
    var myBookId = $(this).data('id');
    $(".modal-body #bookId").val( myBookId );

    
   // alert(myBookId);
    var orderID = myBookId.split(';')[0];
    var userID = myBookId.split(';')[1];

    $.ajax({
        url: "/admin/ConfirmDetail?uid=" + userID + "&oid=" + orderID ,
        method: 'GET'
    }).then(function (res) {
        $('#replaceMe').html(res);
    })
});

function UpdateQuantity(obj){
    //alert("Access");
    //document.getElementById("mediumModalUpdateQuantity").modal("hide");
    var link = "/admin/EditProductQuantity";
    var pid = obj.getAttribute("data-id");
    var quantity = document.getElementById("quantity").value;
    var cate = document.getElementById("select-category").value;
    //link += pid;   
    $.post(link,{
        "ProductID" : pid,
        "CategoryName" : cate,
        "Quantity" : quantity
    },function(data,status){   
        if(data == 200){                
            document.getElementById("display_quantity" + pid).innerText = quantity;            
            document.getElementById("btnCancel").click();
        }
        else {
            alert("Fail");
        }
    })
}

function Check(obj){
    if(obj.value.trim() == ""){
        obj.setCustomValidity("Please enter this field"); 

    }
    else {
        obj.setCustomValidity(""); 
        if(obj.getAttribute("id") == "price") isNumber(obj);
        return true; 
    }
}
function isNumber(obj){
    var patt1 = /^\d+(\.\d+)?$/;
    if(patt1.test(obj.value.trim()) == true){
        obj.setCustomValidity("");
        //alert(patt1.test(obj.value.trim()));
    }
    else {
        obj.setCustomValidity("Please enter number for this field");
        //alert(patt1.test(obj.value.trim()));
    }
}
function isFileImage(file) {
    const acceptedImageTypes = ['gif', 'jpeg', 'png','jpg'];
 
    for(var i = 0;i < acceptedImageTypes.length;i++){
        if(file.value.split(acceptedImageTypes[i]).length > 1){          
           return true; 
      }
    }
    return false;
}
function change(obj){
    var check = isFileImage(obj);
    if(check == true){
        obj.setCustomValidity("");  
    }
    else {
        obj.setCustomValidity("Please choose another file");
    }
}
function checkAll(obj){
    var value = obj.getAttribute("data-value");
    var productName = document.getElementById("product_name");
    var brand = document.getElementById("brand");
    var color = document.getElementById("color");
    var price = document.getElementById("price");
    var file = document.getElementById("files");
    Check(productName);
    Check(brand);
    Check(color);
    if(Check(price) == true){
        isNumber(price);
    }
    //alert(value);
    if(value == "add"){
        if(Check(file) == true) {
            //alert(file);
            change(file);
        }
    }
   
    document.getElementById("btnSubmitAdd").click();
}