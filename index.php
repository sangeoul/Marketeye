<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">


<?php
include $_SERVER['DOCUMENT_ROOT']."/CorpESI/shrimp/phplib.php";
dbset();
session_start();

$tmp_userid="";
$tmp_username="";

if(isset($_SESSION['shrimp_userid'])) {
    $tmp_userid=$_SESSION['shrimp_userid'];
}
if(isset($_SESSION['shrimp_username'])) {
    $tmp_username=$_SESSION["shrimp_username"];
}
if(isset($_SESSION['PublicESI_characterid'])) {
    $tmp_userid=$_SESSION['PublicESI_characterid'];
}
if(isset($_SESSION['PublicESI_charactername'])) {
    $tmp_username=$_SESSION["PublicESI_charactername"];
}
$dbcon->query("insert into iplogs (userid,username,ip,registered,page) values (".$tmp_userid.",'".$tmp_username."','".$_SERVER['REMOTE_ADDR']."',NOW(),\"".$_SERVER["REQUEST_URI"]."\");");

?>

<?php

class Item{
    public $typeid;
    public $itemname;
    public $quantity;
    public $sell;
    public $buy;


    function __construct($__typeid,$__name,$__quantity,$__sell=0,$__buy=0){
        $this->typeid=$__typeid;
        $this->itemname=$__name;
        $this->quantity=intval($__quantity);
        
        if($__sell==0 && !isset($_GET["hash"])){
            $this->sell=getMarketPrice($__typeid,"sell");
        }
        else{
            $this->sell=$__sell;
        }
        
        if($__buy==0 && !isset($_GET["hash"]) ) {
            $this->buy=getMarketPrice($__typeid,"buy");
        }
        else{
            $this->buy=$__buy;
        }       

    }

}
$items=array();

?>

<?php

$HASH_LENGTH=8;

if(isset($_GET["hash"])){
    $qr="select * from Marketeye_history where code=\"".$_GET["hash"]."\"";
    $result=$dbcon->query($qr);

    if(isset($_GET["fixed"]) && $_GET["fixed"]==0){

        for($i=0;$i<$result->num_rows;$i++){
            $data=$result->fetch_array();
            add_item(getItemName($data["typeid"]),$data["quantity"],0,0);
        }
    }
    else{
        for($i=0;$i<$result->num_rows;$i++){
            $data=$result->fetch_array();
            add_item(getItemName($data["typeid"]),$data["quantity"],$data["sell"],$data["buy"]);
        }        
    }
}
else if(isset($_POST["itemlist"])){
    
    
    $tempcode=generateRandomString($HASH_LENGTH);
    $result=$dbcon->query("select * from Marketeye_history where code=\"".$tempcode."\"");
    while($result->num_rows>0){
        $tempcode=generateRandomString($HASH_LENGTH);
        $result=$dbcon->query("select * from Marketeye_history where code=\"".$tempcode."\"");
    }

    while($_POST["itemlist"][0]==" " || $_POST["itemlist"][0]=="\t" ||preg_match('/\t/',$_POST["itemlist"][0])|| $_POST["itemlist"][0]=="\r" || $_POST["itemlist"][0]=="\n"){
        $_POST["itemlist"]=substr($_POST["itemlist"],1);
    }
    while($_POST["itemlist"][strlen($_POST["itemlist"])-1]==" " || 
    $_POST["itemlist"][strlen($_POST["itemlist"])-1]=="\t" || 
    $_POST["itemlist"][strlen($_POST["itemlist"])-1]=="\r" ||
    $_POST["itemlist"][strlen($_POST["itemlist"])-1]=="\n")
    {
        $_POST["itemlist"]=substr($_POST["itemlist"],0,strlen($_POST["itemlist"])-1);
    }
    $_POST["itemlist"]=str_replace("\"","\\\"",$_POST["itemlist"]);
    $itemline=preg_split('/\r\n|\r|\n/',$_POST['itemlist']);
    
    for($i=0;$i<sizeof($itemline);$i++){
        
        Parse_itemline($itemline[$i]);
        
    }
    
    for($i=0;$i<sizeof($items);$i++){
        insert_history($tempcode,$items[$i]);
    }
    if(sizeof($items)>0){
        echo("<script>window.location.replace(\"./?hash=".$tempcode."\");</script>");
    }
    
   
}

function Parse_itemline($itemstr){

    while($itemstr[0]==" " || $itemstr[0]=="\t" ||preg_match('/\t/',$itemstr[0])|| $itemstr[0]=="\r" || $itemstr[0]=="\n"){
        $itemstr=substr($itemstr,1);
    }
    while($itemstr[strlen($itemstr)-1]==" " || 
    $itemstr[strlen($itemstr)-1]=="\t" || 
    $itemstr[strlen($itemstr)-1]=="\r" ||
    $itemstr[strlen($itemstr)-1]=="\n")
    {
        $itemstr=substr($itemstr,0,strlen($itemstr)-1);
    }    
    
    $itemstr=str_replace("*","",$itemstr);
$data=preg_split('/\t/',$itemstr);
    if(isset($data[1]) && ( is_numeric( numberstringcut($data[1]) ) || $data[1]=="" || $data[1]==" ")&& !is_numeric(numberstringcut($data[0]) ) ){
        //normal inventory itemlist type , 
        $data[1]=numberstringcut($data[1]);
        
        if($data[1]=='0' || $data[1]=="" || $data[1]==" "){
            
            $data[1]=1;
            
        } 
        
        add_item($data[0],intval($data[1]));
        
    }
    else if( is_numeric(numberstringcut(explode(" x ",$data[0])[0])) ) {
        //Blueprint materials
        $data=explode(" x ",$data[0]);
        add_item($data[1],intval($data[0]));

    }
    else if( is_numeric( numberstringcut(explode("x ",$data[0])[0]) ) ) {
        //Fitting Management
        $data=explode("x ",$data[0]);
        add_item($data[1],intval($data[0]));

    }
    else if( is_numeric( numberstringcut(explode(" ",$data[0])[0]) )){

        $nnn=explode(" ",$data[0])[0] ;
        $namedata=substr($data[0],(strlen($nnn)+1));

        $nnn=intval(numberstringcut($nnn));
        if(getItemID($namedata,0)!=0){
            //Cargo Scanner
            add_item($namedata,$nnn);
        }
        else if(getItemID($data[0],0)!=0){
            //Ship Scanner
                add_item($data[0],1);
            }
    }
    else if(getItemID($data[0],0)!=0){
        //Ship Scanner
        
            add_item($data[0],1);
        }
    

}

function numberstringcut($str1){
    $str1=str_replace(" ","",$str1);
    $str1=preg_replace('/\t/',"",$str1);
    $str1=preg_replace('/\r\n|\r|\n|,/',"",$str1);

    return $str1;
}
function add_item($name,$quantity,$sell=0,$buy=0){
    global $items;
    $typeid=intval(getItemID($name));
    
    if($typeid){
        $items[findItemIndex($typeid)]->quantity+=$quantity;

        if($sell!=0){
            $items[findItemIndex($typeid)]->sell=$sell;
        }
        if($buy!=0){
            $items[findItemIndex($typeid)]->buy=$buy;
        }
        
    }
}

function findItemIndex($keyword){
    global $items;
    if(is_int($keyword)){
        for($i=0;$i<sizeof($items);$i++){
            if($items[$i]->typeid==$keyword){
                return $i;
            }
        }
        
        $items[$i]=new Item($keyword,getItemName($keyword),0);
        return $i;
    }
    else{
        for($i=0;$i<sizeof($items);$i++){
            if($items[$i]->itemname==$keyword){
                return $i;
            }
        }
        $items[$i]=new Item(getItemID($keyword),$keyword,0);
        return $i;        
    }
}

function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[mt_rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

function insert_history($_code,$_item){
/*
    public $typeid;
    public $itemname;
    public $quantity;
    public $sell;
    public $buy;
    */
    global $dbcon;
    $qr="insert into Marketeye_history (code,typeid,quantity,sell,buy,link_date) values (
        \"".$_code."\",
        ".$_item->typeid.",
        ".$_item->quantity.",
        ".($_item->sell ==0?-1:$_item->sell).",
        ".($_item->buy ==0?-1:$_item->buy).",
        UTC_TIMESTAMP
    );";
    $dbcon->query($qr);



    
}
?>

<?=$analytics?>
<script data-ad-client="ca-pub-7625490600882004" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>

<script src='./Marketeye.js'></script>

<script>




function bodyload(){

    <?php
    if(isset($_POST["itemlist"]) || isset($_GET["hash"])){

    
        $_POST["itemlist"]=preg_replace('/\r\n|\r|\n/',"\\n",$_POST["itemlist"]);
        $_POST["itemlist"]=preg_replace('/\t/',"\\t",$_POST["itemlist"]);
        for($i=0;$i<sizeof($items);$i++){
            echo("itemlist[".$i."]=new Item(".$items[$i]->typeid.",\"".$items[$i]->itemname."\",".$items[$i]->quantity.",".$items[$i]->sell.",".$items[$i]->buy.");\n");
        }
        echo("document.getElementById('itemlist').value=\"".$_POST["itemlist"]."\"");
    }
    else{
        echo("document.getElementById('itemlist').value=\"Copy - Paste(Ctrl C V) Items list.\"");
    }
    ?> 
    var tablespace=document.getElementById("table_space");
    while(tablespace.hasChildNodes()){
        tablespace.removeChild(tablespace.childNodes[0]);
    }
    if( <?=(isset($_POST["itemlist"])||isset($_GET["hash"]))?1:0?> ){
        tablespace.appendChild(display_table());
    }
    loadingComplete();

}

</script>

<link rel="stylesheet" type="text/css" href="./Marketeye.css">
</head>


</html>

<body onload="javascript:bodyload();">
<form method='POST' action='./' class="Marketeye_inputarea" id="inputform">
<a href="./readme.html" target="_blank" style="font-size:22px;">Why MarketEye ?</a><br>
<textarea id='itemlist' name='itemlist' class="Marketeye_inputarea" onchange="javascript:document.getElementById('inputform').submit();"    >

</textarea><br>
<input type=submit value="Parse" class="Marketeye_inputsubmit">
</form>

<div id='table_space' class="Marketeye_tablespace">

</div>

</body>