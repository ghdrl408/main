
$(document).ready(function () {

    //슬라이드

    let i = 3; //이미지 장 수

    $('#sld_img_wrap').click(function () {
        if (i <= 1) {
            $('#sld_img_wrap img').fadeIn(500);
            i = 3;
        } else {
            i--;
            $('#sld_img_wrap img').eq(i).fadeOut(500);
        }
    });

    setInterval(function () {
        $('#sld_img_wrap').trigger('click');
    }, 3000);

    //팝업 이벤트
    $('#popup').click(function () {
        $('#modal').fadeIn(500);
        $('#bg').css({
            width: '1000px',
            height: '650px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            position: 'fixed',
            top: 0,
            left: 0,
        }).show();
    });

    $('#close').click(function () {
        $('#modal').fadeOut(500);
        $('#bg').hide();
    });
}); //end




});//end