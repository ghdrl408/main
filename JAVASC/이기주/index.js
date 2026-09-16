$(document).ready(function () {

    let i = 3;

    $('#img_wrap').click(function () {
        if (i <= 1) {
            $('#img_wrap img').fadeIn(500)
            i = 3;
        } else {
            i--;
            $('#img_wrap img').eq(i).fadeOut(500)
        }
    });

    setInterval(function () {
        $('#img_wrap').trigger('click')
    }, 3000);



    

    //모달

    $('#pop_up').click(function () {
        $('#modal').fadeIn(200);
        $('#bg').fadeIn(200);
    });

    $('#x_btn').click(function () {
        $('#modal').fadeOut(500);
        $('#bg').fadeOut(500);
    })




});