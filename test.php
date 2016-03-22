<?php
$i=0;
while(true){
    echo $i++."\n";
}

?>



"Image Name","PID","Session Name","Session#","Mem Usage","Status","User Name","CPU Time","Window Title"
"php.exe","7536","Console","2","22,024 K","Unknown","DESKTOP-A6O6AET\m-shibata","0:00:00","N/A"
"php.exe","6928","Console","2","20,724 K","Unknown","DESKTOP-A6O6AET\m-shibata","0:00:00","N/A"
tasklist /v /fo csv | find "php"