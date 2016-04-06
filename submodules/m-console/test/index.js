< !DOCTYPE html >
    < html >
    < head >
    < meta http - equiv = "Content-Type"
content = "text/html; charset=utf-8" / >
    < title > < /title> < meta charset = "utf-8" / >

    < script type = "text/javascript" >
    function init() {
        window.onmousemove = handleMouseMove;
    }

function handleMouseMove(event) {
    event = event || window.event; // IE対応
    target = document.getElementById("output_client");
    target.innerHTML = "Client X:" + event.clientX + ", Client Y:" + event.clientY;

    target = document.getElementById("output_screen");
    target.innerHTML = "Screen X:" + event.screenX + ", Screen Y:" + event.screenY;
} < /script>

< /head> < body onload = "init();" >
    < div id = "output_client" > < /div> < div id = "output_screen" > < /div> < /body> < /html>