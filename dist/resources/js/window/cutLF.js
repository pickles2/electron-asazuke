// 改行削除
$('.before-text').on('change keydown keyup', function(e) {
    console.log("changeed");
    text = $(this).val();
    console.log(text);
    $('.after-text').val(text.replace(/\r?\n/g, ""));
});