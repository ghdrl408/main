    $(document).ready(function () {

        //슬라이드 이벤트
        let i = 3; //이미지 수

        $('#img_wrap').click(function () {
            if (i <= 1) {
                $('#img_wrap img').fadeIn(500);
                i = 3;
            } else {
                i--;
                $('#img_wrap img').eq(i).fadeOut(500);
            }
        });


        setInterval(function () {
            $('#img_wrap').trigger('click');
        }, 2000);


        
        //팝업이벤트
        $('#pop_up').click(function () {
            $('#modal').fadeIn(500);
            
        });

        $('#close').click(function () {
            $('#modal').fadeOut(500);
        });











})//end