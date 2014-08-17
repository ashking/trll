$(function(){
    $(document).click(function() {
    });

    //toggle forms
    $('.addbroad #CreateBoard').click(function(){
        $('.addboardform').toggle();
        return false;
    });

    $('.addlist #CreateList').click(function(){
        $('.addlistform').toggle();
        return false;
    });

    $('.addcard').click(function(){
        $('.addcardform').toggle();
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

    $(document).on("click", ".alert", function(e) {
        bootbox.alert("Hello world!", function() {
            console.log("Alert Callback");
        });
    });

});