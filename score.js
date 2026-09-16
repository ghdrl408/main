//스코어 표시 예제
$(document).ready(function () {
    $('.score').css({
        width: 100,
        height: 100,
        borderRadius: '50%',
        backgroundColor: grey,
        margin: 10,
        float: 'left',
    });

    let scoreInput = Number(prompt('(1~5) 점수를 숫자로 입력하세요'));

    for (let i = 1; i <= scoreInput; 1++) {
        $('.s' + i).css({
            backgroundColor: 'gold',
        });
    }
});