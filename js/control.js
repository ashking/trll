$(function(){
    $(document).click(function() {
    });

    //toggle forms
    $('.addbroad #CreateBoard').click(function(){
        $('.addboardform').toggle();
        $(".form-control").focus();
        return false;
    });

    $('.addlist #CreateList').click(function(){
        $('.addlistform').toggle();
        $(".form-control").focus();
        return false;
    });

    $('.addcard').click(function(){
        $('.addcardform').toggle();
        $(".form-control").focus();
        return false;
    });

    $('.addbroad #ClearData').click(function(){
        bootbox.confirm("Are you sure?", function(result) {
            if(result){
                window.localStorage.clear();
                location.reload();
            }
        }); 
    });

});