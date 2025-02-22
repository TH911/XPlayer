/*
 * XPlayer | a simple static music player
 * also as a showcase that shows how to sync lyric with the HTML5 audio tag
 * TH911  Jan 1th,2025
 * view on GitHub:https://github.com/TH911/th911.github.io
 * see the live site:http://th911.us.kg/XPlayer
 * songs used in this project are only for educational purpose
 */

// Responsive Design
function responsiveDesign(flag_playlist){
    var screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    var playlist=document.getElementById("playlist");
    var search_container = document.getElementById("search-container");

    // for mobile
    if(screenWidth<screenHeight||screenWidth<800){
        
        //close the playlist for default
        if(flag_playlist)playlist.style.display = "none";

        search_container.style.display = "none";

    }else{

    }
}
responsiveDesign(true);
window.addEventListener('resize', function(){
    responsiveDesign(true);
});

function playlist_hide(){
    var playlist=document.getElementById("playlist");
    var button_search = document.getElementById("button_search-container");
    if(playlist.style.display == "none"){
        playlist.style.display = "block";
        button_search.style.display = "none";
        document.getElementById("search-container").style.display = "none";

        //scroll to which is playing
        var playlist_ol = document.getElementById("playlist_ol");
        var now = document.getElementById(`playlist-${PLAYER.currentIndex}`);
        playlist_ol.scrollTo({
            top: Math.max(0,now.offsetTop - Math.floor(parseInt(playlist.clientHeight)/2)),
            behavior: 'smooth'
        });
    }else{
        playlist.style.display = "none";
        button_search.style.display = "block";
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // 设置音频文件名显示宽度
    var element = document.querySelector('.audio-right');
    var maxWidth = parseFloat(window.getComputedStyle(element, null).width.replace('px'));
    var tool = 0;
    if('documentPictureInPicture' in window){
        tool = 8 + 29.6+10;
    }
    document.querySelector('.audio-right p').style.maxWidth = `${maxWidth - tool}px`;

    // 可能会有多个音频，逐个初始化音频控制事件
    var audios = document.getElementsByTagName('audio');
    for (var i = 0; i < audios.length; i++) {
        initAudioEvent(i);
    }
    

}, false);

/**
 * 初始化音频控制事件
 * @param {number} index 索引，表示第几个音频（从0开始）
 */
function initAudioEvent(index) {
    var audio = document.getElementsByTagName('audio')[index];
    var audioPlayer = document.getElementById(`audioPlayer${index}`);

    // hack iOS which can't get duration.
    // update:define it in the json.
    audio.addEventListener('loadedmetadata', function() {
        // Get how long the song is
        const duration = PLAYER.duration;
        var len=document.getElementById("audio-length-total");
        len.textContent = transTime(Math.ceil(duration));
    });

    // Update the progress bar
    audio.addEventListener('timeupdate', function () {
        updateProgress(audio, index);
    }, false);

    //Update the img
    audio.addEventListener('pause', function() {
        audioPlayer.querySelector('svg').innerHTML = '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445"/>';
    }, false);
    audio.addEventListener('play', function() {
        audioPlayer.querySelector('svg').innerHTML = '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5"/>';
    }, false);
    
    // play/pause when click
    audioPlayer.addEventListener('click', function () {
        if (audio.paused)audio.play();
        else audio.pause();
    }, false);


    // change the time when click the progress bar
    // PS：DON'T USE CLICK，or The drag progress point event below may trigger here, and at this point, the value of e.offsetX is very small, which can cause the progress bar to pop back to the beginning (unbearable!!)
    var progressBarBg = document.getElementById(`progressBarBg${index}`);
    progressBarBg.addEventListener('mousedown', function (event) {

        if (!audio.paused || audio.currentTime != 0) {
            var pgsWidth = parseFloat(window.getComputedStyle(progressBarBg, null).width.replace('px', ''));
            var rate = event.offsetX / pgsWidth;
            audio.currentTime = PLAYER.duration * rate;
            updateProgress(audio, index);
        }
    }, false);

    // 拖动进度点调节进度
    dragProgressDotEvent(audio, index);
}

/**
 * 鼠标拖动进度点时可以调节进度
 * @param {*} audio
 * @param {number} index 索引，表示第几个音频（从0开始）
 */
function dragProgressDotEvent(audio, index) {
    var dot = document.getElementById(`progressDot${index}`);

    var position = {
        oriOffestLeft: 0, // 移动开始时进度条的点距离进度条的偏移值
        oriX: 0, // 移动开始时的x坐标
        maxLeft: 0, // 向左最大可拖动距离
        maxRight: 0 // 向右最大可拖动距离
    };
    var flag = false; // 标记是否拖动开始

    // 鼠标按下时
    dot.addEventListener('mousedown', down, false);
    dot.addEventListener('touchstart', down, false);

    // 开始拖动
    document.addEventListener('mousemove', move, false);
    document.addEventListener('touchmove', move, false);

    // 拖动结束
    document.addEventListener('mouseup', end, false);
    document.addEventListener('touchend', end, false);

    var select = null;
    function down(event) {
        if (!audio.paused || audio.currentTime != 0) { // 只有音乐开始播放后才可以调节，已经播放过但暂停了的也可以
            select = document.body.style.userSelect || document.body.style.webkitUserSelect;
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';

            flag = true;

            position.oriOffestLeft = dot.offsetLeft;
            position.oriX = event.touches ? event.touches[0].clientX : event.clientX; // 要同时适配mousedown和touchstart事件
            position.maxLeft = position.oriOffestLeft; // 向左最大可拖动距离
            position.maxRight = document.getElementById(`progressBarBg${index}`).offsetWidth - position.oriOffestLeft; // 向右最大可拖动距离

            // 禁止默认事件（避免鼠标拖拽进度点的时候选中文字）
            if (event && event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }

            // 禁止事件冒泡
            if (event && event.stopPropagation) {
                event.stopPropagation();
            } else {
                window.event.cancelBubble = true;
            }
        }
    }

    function move(event) {
        if (flag) {
            var clientX = event.touches ? event.touches[0].clientX : event.clientX; // 要同时适配mousemove和touchmove事件
            var length = clientX - position.oriX;
            if (length > position.maxRight) {
                length = position.maxRight;
            } else if (length < -position.maxLeft) {
                length = -position.maxLeft;
            }
            var progressBarBg = document.getElementById(`progressBarBg${index}`);
            var pgsWidth = parseFloat(window.getComputedStyle(progressBarBg, null).width.replace('px', ''));
            var rate = (position.oriOffestLeft + length) / pgsWidth;
            audio.currentTime = PLAYER.duration * rate;
            updateProgress(audio, index);
        }
    }

    function end() {
        document.body.style.userSelect = select;
        document.body.style.webkitUserSelect = select;
        flag = false;
    }
}

/**
 * 更新进度条与当前播放时间
 * @param {object} audio - audio对象
 * @param {number} index 索引，表示第几个音频（从0开始）
 */
function updateProgress(audio, index) {
    var value = audio.currentTime / PLAYER.duration;
    document.getElementById(`progressBar${index}`).style.width = `${value * 100}%`;
    document.getElementById(`progressDot${index}`).style.left = `${value * 100}%`;
    document.getElementById(`audioCurTime${index}`).innerText = transTime(audio.currentTime);
}

/**
 * 音频播放时间换算
 * @param {number} value - 音频当前播放时间，单位秒
 */
function transTime(value) {
    var time = "";
    var h = parseInt(value / 3600);
    value %= 3600;
    var m = parseInt(value / 60);
    var s = parseInt(value % 60);
    if (h > 0) {
        time = formatTime(`${h}:${m}:${s}`);
    } else {
        time = formatTime(`${m}:${s}`);
    }

    return time;
}

/**
 * sync the time
 * eg：2:4  -->  02:04
 * @param {string} value - string as h:m:s  
 */
function formatTime(value) {
    var time = "";
    var s = value.split(':');
    var i = 0;
    for (; i < s.length - 1; i++) {
        time += s[i].length == 1 ? `0${s[i]}` : s[i];
        time += ":";
    }
    time += s[i].length == 1 ? `0${s[i]}` : s[i];

    return time;
}

const searchBox = document.getElementById('search-box');
const searchResults = document.getElementById('search-results');
async function loadData() {
    try {
        const response = await loadJson();
        const data = await JSON.parse(response);
        return data.data;
    } catch (error) {
        console.error('failed to loading the search box of songs:', error);
        return null;
    }
}
var searchData = null;
function getSearchData(){
    if(searchData == null){
        searchData = loadData();
    }
    return searchData;
}
async function searchSongs(query) {
    if (!query) {
        searchResults.innerHTML = '';
        return;
    }

    if(searchData == null){
        searchData = await getSearchData();
    }
    const songs = searchData;
    const queryLowerCase = query.toLowerCase();
    const filteredSongs = songs.filter(song => 
        song.song_name.toLowerCase().includes(queryLowerCase) || song.artist.toLowerCase().includes(queryLowerCase) || song.lrc_name.toLowerCase().includes(queryLowerCase) || song.album.toLowerCase().includes(queryLowerCase)
    );

    searchResults.innerHTML = filteredSongs.map(song => 
        `<li id='search-songs-${song.lrc_name}'><img src="./music/${song.lrc_name}.webp"><span><b>${song.song_name}</b> - ${song.artist}</span><span class="searchResultAlbum">${song.album}</span></li>`
    ).join('');
}


searchBox.addEventListener('input', (event) => {
    searchSongs(event.target.value);
});


searchResults.addEventListener('click', (event) => {
    var clickedItem = event.target;
    while(clickedItem.tagName.toLowerCase() != 'li'){
        clickedItem = clickedItem.parentNode;
    }
    document.getElementById("search-box").value = "";
    document.getElementById("search-results").innerHTML = "";
    responsiveDesign();
    PLAYER.playNum(parseInt(clickedItem.id.substring(13))-1);
});

function search_hide(){
    var search_container = document.getElementById("search-container");
    if(search_container.style.display == "none"){
        search_container.style.display = "block";
    }else{
        search_container.style.display = "none";
    }
}


//the menu of fontfamily,fontsize,background-img,...
$(document).ready(function() {
    $('.menu-title').click(function() {
        $(this).siblings('.menu-content').toggleClass('show');
    });
});

//change the playermode
function playmode_change(mode){
    var mode2=localStorage.getItem("player_mode");
    if(mode2!=null)document.getElementById(`menu_${localStorage.getItem("player_mode")}`).style.color = "#999";
    localStorage.setItem("player_mode",mode);
    document.getElementById(`menu_${mode}`).style.color = "#fff";
}

function font_change(font){
    var font2 = localStorage.getItem("player_font");
    if(font2!=null)document.getElementById(`menu_font_${font2}`).style.color = "#999";
    localStorage.setItem("player_font",font);
    document.getElementById(`menu_font_${font}`).style.color = "#fff";
    var lyricWrapper = document.getElementById("lyricWrapper");
    lyricWrapper.style.fontFamily = font;
    
    if(pipWindow.open){
        pipWindow.document.body.style.fontFamily = font;
    }
    
    switch(font){
        case "fordefault":
            lyricWrapper.style.fontSize = "16px";
            break;
        case "youyuan":
            lyricWrapper.style.fontSize = "16px";
            break;
        default :
            lyricWrapper.style.fontSize = "18px";
            break;
    }
}
function lyricColorMode_change(mode){
    var mode2=localStorage.getItem("lyricColorMode");
    if(mode2!=null){
        document.getElementById(`menu_lyricColorMode_${localStorage.getItem("lyricColorMode")}`).style.color = "#999";
    }
    localStorage.setItem("lyricColorMode",mode);
    document.getElementById(`menu_lyricColorMode_${mode}`).style.color = "#fff";

    if(mode == "choose"){
        var lyricColor = localStorage.getItem("lyricColor");
        if(!lyricColor){
            localStorage.setItem("lyricColor","FAFA17,ff1493,adff2f,d731f8,00CC65");
            lyricColor = "FAFA17,ff1493,adff2f,d731f8,00CC65";
        }
        var list = localStorage.getItem("lyricColor").split(',');
        localStorage.setItem("lyricColor",list[0]);
        try{
            PLAYER.lyricStyleList = [list[0]];
            PLAYER.lyricStyle = Math.floor(Math.random() * PLAYER.lyricStyleList.length);
        }catch{

        }
        for(var i = 1 ; i < list.length ; i++){
            lyricColor_change(list[i]);
        }
    }
}

function showToast(message) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 1500);
}

function lyricColor_change(color){
    var that = document.getElementById(`menu_lyricColor_${color}`);
    if(!localStorage.getItem("lyricColor")){
        localStorage.setItem("lyricColor","FAFA17,ff1493,adff2f,d731f8,00CC65");
    }
    var list = localStorage.getItem("lyricColor").split(',');
    if(!localStorage.getItem("lyricColorMode")){
        localStorage.setItem("lyricColorMode","random");
    }
    var lyricColorMode = localStorage.getItem("lyricColorMode");
    if(lyricColorMode == "random"){
        if(list.length == 1 && color == list[0] && Array.from(that.className.split(' ')).includes('choosed')){
            showToast("操作失败:必须保留一种颜色");
            return;
        }
        if(Array.from(that.className.split(' ')).includes('choosed')){
            that.classList.remove('choosed');
            var i=0,j=0;
            for(;i < list.length ;i++){
                if(list[i] != color){
                    list[j++]=list[i];
                }
            }
            list.length = j;
        }else{
            that.classList.add('choosed');
            if(!list.includes(color)){
                list.push(color);
            }
        }
        try{
            var flag = 0;
            for(var i = 0;i < list.length ; i++){
                if(list[i] == PLAYER.lyricStyleList[PLAYER.lyricStyle]){
                    flag = i;
                    break;
                }
            }
            PLAYER.lyricStyleList = list;
            PLAYER.lyricStyle = flag;
        }catch{
    
        }
        var string = list[0];
        for(var i = 1 ; i < list.length ; i++){
            string += `,${list[i]}`;
        }
        localStorage.setItem("lyricColor",string);
    }else{
        if(localStorage.getItem("lyricColor") == color){
            return;
        }
        Array.from(document.getElementsByClassName("menu_lyricColor_button")).forEach(element => {
            element.classList.remove('choosed');
        });
        that.classList.add('choosed');
        localStorage.setItem("lyricColor",color);
        try{
            PLAYER.lyricStyleList = [color];
            PLAYER.lyricStyle = 0;
        }catch{
    
        }
    }
}

var pipWindowMode = function(){
    this.window = undefined;
    this.document = undefined;
    this.open = false;
    this.fillMode = "lrc";
}
pipWindowMode.prototype = {
    constructor: pipWindowMode, //fix the prototype chain
    create: async function(fillMode){
        if(!this.check())return;

        // change the color of the desktopLyricButton.
        PLAYER.desktopLyricButton.style.color = `#${PLAYER.lyricStyleList[PLAYER.lyricStyle]}`;

        this.fillMode = fillMode;
        this.window = await window.documentPictureInPicture.requestWindow({
            width: 350,
            height: 52
        });
        this.document = this.window.document;
        this.document.body.title = document.title;
        this.open = true;
        var that = this;

        if(this.fillMode == "xrc"){
            this.window.addEventListener('resize', function(){
                var node = document.getElementById(`line-${PLAYER.lastXrcLetterI}`);
                that.fillXrc(node);
            });
        }else{
            this.window.addEventListener('resize',function() {
                var tool = that.document.getElementById("tool");
                tool.fontSize = Math.min(Math.floor((that.window.innerWidth-40) / tool.textContent.length),that.window.innerHeight-20) + 'px';
            });
        }

        this.document.addEventListener("keydown" ,PLAYER.keyboardCtrl ,false);

        this.window.addEventListener('unload',function() {
            that.open = false;
            that.window = undefined;
            that.document = undefined;
            that.fillMode = undefined;
            // change the color of the desktopLyricButton.
            PLAYER.desktopLyricButton.style.color = '';
        });

        this.window.addEventListener('click', function(){
            if(PLAYER.audio.paused)PLAYER.audio.play();
            else PLAYER.audio.pause();
        });

        console.log("pipWindow has created.");

        this.document.head.innerHTML = document.head.innerHTML;
        var link = document.createElement('link');
        link.innerHTML = '<link rel="stylesheet" href="css/pipWindow.min.css">'
        this.document.head.appendChild(link);
        this.document.body.style.fontFamily = localStorage.getItem("player_font");

        if(this.fillMode == "lrc"){
            try{
                // To get the lyric when the audio is paused
                for (var i = 0, l = PLAYER.lyric.length; i <= l; i++) {
                    //preload the lyric by 0.50s || end
                    if (i == l || PLAYER.audio.currentTime <= PLAYER.lyric[i][0] - 0.50){
                        if(i > 0) i--;
        
                        if(i > 1 && PLAYER.lyric[i][0] == PLAYER.lyric[i-1][0]) i = i-1;
        
                        //for the lyric to pipWindow
                        var lyric_for_API,text_translate=null;
                        lyric_for_API = PLAYER.lyric[i][1];
                        
                        if(i+1 < l && PLAYER.lyric[i][0] == PLAYER.lyric[i+1][0])text_translate = PLAYER.lyric[i+1][1];
                        if(lyric_for_API.length == 0)lyric_for_API = " ";
        
                        // sync pipWindow
                        this.fill(lyric_for_API,text_translate);
        
                        break;
                    }
                }
            }catch(error){
                console.error(`ERROR:${error}`);
            }
        } else {
            try{
                this.fillXrc(document.getElementById(`line-${PLAYER.lastXrcLetterI}`));
            }catch{

            }
        }
    },
    textLength: function(text){
        //get the length(1 for Chinese,0.5 for English).
        var length = 0;
        for(var i = 0 ;i < text.length ; i++){
            var flag = false;
            var list = [' ',',','.','<','>',';',':','"',"'",'{','}','[',']','-','_','+','=','!','~','`','@','#','$','%','^','&','*','(',')','|','\\'];
            for(var j = 0; j<list.length ; j++){
                if(text[i] == list[j]){
                    flag=true;
                    break;
                }
            }
            if('a' <= text[i] && text[i] <= 'z' || 'A' <= text[i] && text[i] <= 'Z' || flag){
                length +=0.5;
            }else{
                length ++;
            }
        }return length;
    },
    fill: async function(text,text_translate){
        if(!this.open){
            return;
        }
        var tool = document.createElement('div');
        tool.id = "tool";
        tool.textContent = text;
        tool.style.fontFamily = localStorage.getItem("player_font");
        tool.style.textShadow = "1px 0 0 #000, -1px 0 0 #000, 0 1px 0 #000, 0 -1px 0 #000";
        tool.style.fontWeight = "bolder";
        tool.style.lineHeight = this.window.innerHeight + 'px';
        tool.style.margin = "auto";
        
        var text_length = this.textLength(text);
        
        // pipWindow
        tool.style.fontSize = Math.min(Math.floor((this.window.innerWidth-40) / text_length),this.window.innerHeight-20) + 'px';

        tool.style.color = `#${PLAYER.lyricStyleList[PLAYER.lyricStyle]}`;
        this.document.body.innerHTML = '';
        // 114514
        tool.style.textAlign = "center";
        tool.style.lineHeight = this.window.innerHeight + 'px';

        if(text_translate != null){
            var text_translate_length = this.textLength(text_translate);
            tool.style.fontSize = Math.min(Math.min(Math.floor((this.window.innerWidth-40) / text_length),(this.window.innerHeight-20)/2) , Math.min(Math.floor((this.window.innerWidth-40) / text_translate_length),this.window.innerHeight-20)) + 'px';
            var tool_text = document.createElement('div');
            var tool_text_translate = document.createElement('div');
            tool.style.lineHeight = Math.floor(this.window.innerHeight/2) + 'px';
            tool.textContent = "";
            tool_text.textContent = text;
            tool_text_translate.textContent = text_translate;
            tool_text_translate.style.color = "#fff";
            tool.appendChild(tool_text);
            tool.appendChild(tool_text_translate);
        }

        this.document.body.appendChild(tool);
    },
    fillXrc: function(node){
        if(!this.open){
            return;
        }
        this.document.body.classList.add(`current-line-xrc-${PLAYER.lyricStyleList[PLAYER.lyricStyle]}`);
        this.document.body.innerHTML = '';
        var newNode = node.cloneNode(2);
        if(PLAYER.lyricTranslate == null){
            var fontSize = this.window.innerHeight - 20;
            newNode.style.fontSize = fontSize + 'px';
            
            Array.from(newNode.children).forEach(element => {
                element.classList.add('lyricInline');
                element.style.background = "#fff -webkit-linear-gradient(left, #00CC65, #00CC65) no-repeat 0 0; !important";
            });

            newNode.style.lineHeight = this.window.innerHeight + 'px';
            this.document.body.appendChild(newNode);
            this.document.body.style.height = this.window.innerHeight + 'px';
        } else {
            var fontSize = Math.floor((this.window.innerHeight - 20)/2);
            newNode.style.fontSize = (fontSize*1.2) + 'px';
            
            Array.from(newNode.children).forEach(element => {
                element.classList.add('lyricInline');
            });

            newNode.style.lineHeight = Math.floor(this.window.innerHeight/2*1.2) + 'px';
            this.document.body.appendChild(newNode);
            this.document.body.style.height = this.window.innerHeight + 'px';
            var br = document.createElement('br');
            this.document.body.appendChild(br);
            var newNode2 = node.parentNode.nextElementSibling.getElementsByTagName('span')[0].cloneNode(2);
            if(newNode2 && newNode2.getAttribute("lyric-mode") == 'translate'){
                newNode2.style.fontSize = (fontSize*0.8) + 'px';
                newNode2.style.lineHeight = Math.floor(this.window.innerHeight/2*0.8) + 'px';
                this.document.body.appendChild(newNode2);
            } else{
                this.document.body.classList.add(`current-line-xrc-${PLAYER.lyricStyleList[PLAYER.lyricStyle]}`);
                this.document.body.innerHTML = '';
                var fontSize = this.window.innerHeight - 20;
                newNode.style.fontSize = fontSize + 'px';
                
                Array.from(newNode.children).forEach(element => {
                    element.classList.add('lyricInline');
                });

                newNode.style.lineHeight = this.window.innerHeight + 'px';
                this.document.body.appendChild(newNode);
                this.document.body.style.height = this.window.innerHeight + 'px';
            }
            
        }
        
        var middleNode = this.document.getElementById(`line-${PLAYER.lastXrcLetterI}-${PLAYER.lastXrcLetterJ}`);
        var distance = middleNode.offsetLeft + this.textLength(middleNode.textContent) * fontSize - this.window.innerWidth/2;
        this.window.scrollTo({
            left: distance,
        });
    },
    check: function(){
        if('documentPictureInPicture' in window){
            return true;
        }else{
            console.error("pipWindow isn't supported.");
            return false;
        }
    },
    close: function(){
        this.window.close();
        // this needn't change value as "open","document"...
        // this will have event 'unload'.
    }
}

var pipWindow = new pipWindowMode();

document.addEventListener('keydown', function(e){
    if(e.key!='p')return;
    if(!pipWindow.open){
        pipWindow.create(PLAYER.lyricMode);
    }else{
        pipWindow.close();
    }
});
var PLAYER;
window.addEventListener('load', function(){
    //for the color of the menu
    var mode = localStorage.getItem("player_mode");
    if(mode == null){
        localStorage.setItem("player_mode","order");
        mode = "order";
    }playmode_change(mode);

    //for the font of lyrics
    var font = localStorage.getItem("player_font");
    if(font == null){
        localStorage.setItem("player_font","fordefault");
        font = "fordefault";
    }font_change(font);

    //for the lyricColorMode
    var lyricColorMode = localStorage.getItem("lyricColorMode");
    if(!lyricColorMode){
        localStorage.setItem("lyricColorMode","random");
        lyricColorMode = "random";
    }lyricColorMode_change(lyricColorMode);

    if(!localStorage.getItem("lyricColor")){
        localStorage.setItem("lyricColor","FAFA17,ff1493,adff2f,d731f8,00CC65");
    }
    var lyricColorList = localStorage.getItem("lyricColor");
    Array.from(lyricColorList.split(',')).forEach(color => {
        lyricColor_change(color);
    });

    if(lyricColorMode == 'choose'){
        document.getElementById(`menu_lyricColor_${lyricColorList}`).classList.add('choosed');
    }

    (function(){
        // button under prorgess.
        var volumeButton = document.getElementById("volumeButton");
        var volumeConfig = document.getElementById("volumeConfig");
        // hack:click the button will make down()'s check true,and this second,and it can't close.
        var displayNoneSet = false;
        volumeButton.addEventListener('click', function(){
            if(volumeConfig.style.display == 'block'){
                volumeConfig.style.display = 'none';
            }else if(!displayNoneSet){
                volumeConfig.style.display = 'block';
            }else{
                displayNoneSet = false;
            }
        });
        var progress = volumeConfig.getElementsByClassName("bar-bg")[0];
        progress.addEventListener('click', event => {

            var offsetTop = event.clientY - progress.getBoundingClientRect().top;
            var height = parseFloat(window.getComputedStyle(progress, null).height.replace('px'));
            var ratio = (height - offsetTop) / height;
            PLAYER.audio.volume = ratio;
            PLAYER.volume = ratio;
            volumeButton.title = `调节音量 ${Math.round(ratio*100)}%\n增大：Ctrl + Up\n减小：Ctrl + Down`;
            if(ratio == 0){
                document.querySelector("#volumeButton svg").innerHTML = '<path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06M6 5.04 4.312 6.39A.5.5 0 0 1 4 6.5H2v3h2a.5.5 0 0 1 .312.11L6 10.96zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/>';
            }else if(ratio == 1){
                document.querySelector("#volumeButton svg").innerHTML = '<path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/><path d="M10.025 8a4.5 4.5 0 0 1-1.318 3.182L8 10.475A3.5 3.5 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.5 4.5 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11"/>';
            }else{
                document.querySelector("#volumeButton svg").innerHTML = '<path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12zM6.312 6.39 8 5.04v5.92L6.312 9.61A.5.5 0 0 0 6 9.5H4v-3h2a.5.5 0 0 0 .312-.11M12.025 8a4.5 4.5 0 0 1-1.318 3.182L10 10.475A3.5 3.5 0 0 0 11.025 8 3.5 3.5 0 0 0 10 5.525l.707-.707A4.5 4.5 0 0 1 12.025 8"/>';
            }
            var bar = progress.getElementsByClassName('bar')[0];
            bar.style.height = `${ratio*100}%`;
            volumeConfig.getElementsByClassName("percent")[0].textContent = `${Math.round(ratio*100)}%`;
            bar.style.top = `${(1-ratio)*100}%`;
            var dot = volumeConfig.getElementsByClassName('dot')[0];
            dot.style.top = `calc(${(1-ratio)*100}% - 5px)`;
        });
        
        var mouseDown = false,select = null;
        function down(event){
            if(volumeConfig.style.display != 'block'){
                displayNoneSet = false;
                return;
            }
            if(!progress.contains(event.target)){
                document.body.style.userSelect = select;
                document.body.style.webkitUserSelect = select;
                mouseDown = false;
                displayNoneSet = true;
                volumeConfig.style.display = 'none';
                return;
            }
            select = document.body.style.userSelect || document.body.style.webkitUserSelect;
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            mouseDown = true;
        }
        function move(event){
            event.preventDefault();

            if(!mouseDown){
                return;
            }

            var offsetTop = (event.touches ? event.touches[0].clientY : event.clientY) - progress.getBoundingClientRect().top;
            var height = parseFloat(window.getComputedStyle(progress, null).height.replace('px'));
            var ratio = (height - offsetTop) / height;
            var bar = volumeConfig.getElementsByClassName('bar')[0];
            ratio = Math.max(ratio,0);
            ratio = Math.min(ratio,1);
            PLAYER.audio.volume = ratio;
            PLAYER.volume = ratio;
            volumeButton.title = `调节音量 ${Math.round(ratio*100)}%\n增大：Ctrl + Up\n减小：Ctrl + Down`;
            if(ratio == 0){
                document.querySelector("#volumeButton svg").innerHTML = '<path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06M6 5.04 4.312 6.39A.5.5 0 0 1 4 6.5H2v3h2a.5.5 0 0 1 .312.11L6 10.96zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/>';
            }else if(ratio == 1){
                document.querySelector("#volumeButton svg").innerHTML = '<path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/><path d="M10.025 8a4.5 4.5 0 0 1-1.318 3.182L8 10.475A3.5 3.5 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.5 4.5 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11"/>';
            }else{
                document.querySelector("#volumeButton svg").innerHTML = '<path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12zM6.312 6.39 8 5.04v5.92L6.312 9.61A.5.5 0 0 0 6 9.5H4v-3h2a.5.5 0 0 0 .312-.11M12.025 8a4.5 4.5 0 0 1-1.318 3.182L10 10.475A3.5 3.5 0 0 0 11.025 8 3.5 3.5 0 0 0 10 5.525l.707-.707A4.5 4.5 0 0 1 12.025 8"/>';
            }
            bar.style.height = `${ratio*100}%`;
            volumeConfig.getElementsByClassName("percent")[0].textContent = `${Math.round(ratio*100)}%`;
            bar.style.top = `${(1-ratio)*100}%`;
            var dot = volumeConfig.getElementsByClassName('dot')[0];
            dot.style.top = `calc(${(1-ratio)*100}% - 5px)`;
        }
        function up(){
            document.body.style.userSelect = select;
            document.body.style.webkitUserSelect = select;
            mouseDown = false;
        }
        document.addEventListener('mousedown', down);
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
        document.addEventListener('touchstart', down);
        document.addEventListener('touchmove', move);
        document.addEventListener('touchend', up);
    })();

    // button ctrl playbackRate.
    (function(){
        // button under prorgess.
        var playbackRateButton = document.getElementById("playbackRateButton");
        var playbackRateConfig = document.getElementById("playbackRateConfig");
        // hack:click the button will make down()'s check true,and this second,and it can't close.
        var displayNoneSet = false;
        playbackRateButton.addEventListener('click', function(){
            if(playbackRateConfig.style.display == 'block'){
                playbackRateConfig.style.display = 'none';
            }else if(!displayNoneSet){
                playbackRateConfig.style.display = 'block';
            }else{
                displayNoneSet = false;
            }
        });
        var progress = playbackRateConfig.getElementsByClassName("bar-bg")[0];
        progress.addEventListener('click', event => {

            var offsetTop = event.clientY - progress.getBoundingClientRect().top;
            offsetTop = Math.round(offsetTop / 8) * 8;
            var height = parseFloat(window.getComputedStyle(progress, null).height.replace('px'));
            var ratio = (height - offsetTop) / height;
            PLAYER.audio.playbackRate = ratio + 0.5;
            PLAYER.playbackRate = ratio + 0.5;
            var tmp = (Math.round((ratio+0.5)*100)/100).toString();
            while(tmp.length < 4){
                tmp += '0';
            }
            if(tmp == '1000'){
                playbackRateButton.textContent = "倍速";
            }else{
                playbackRateButton.textContent = `${tmp}x`;
            }
            var bar = progress.getElementsByClassName('bar')[0];
            bar.style.height = `${ratio*100}%`;
            bar.style.top = `${(1-ratio)*100}%`;
            var dot = playbackRateConfig.getElementsByClassName('dot')[0];
            dot.style.top = `calc(${(1-ratio)*100}% - 5px)`;
        });
        
        var mouseDown = false,select = null;
        function down(event){
            if(playbackRateConfig.style.display != 'block'){
                displayNoneSet = false;
                return;
            }
            if(!progress.contains(event.target)){
                document.body.style.userSelect = select;
                document.body.style.webkitUserSelect = select;
                mouseDown = false;
                displayNoneSet = true;
                playbackRateConfig.style.display = 'none';
                return;
            }
            select = document.body.style.userSelect || document.body.style.webkitUserSelect;
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            mouseDown = true;
        }
        function move(event){
            event.preventDefault();

            if(!mouseDown){
                return;
            }

            var offsetTop = (event.touches ? event.touches[0].clientY : event.clientY) - progress.getBoundingClientRect().top;
            offsetTop = Math.round(offsetTop / 8) * 8;
            var height = parseFloat(window.getComputedStyle(progress, null).height.replace('px'));
            var ratio = (height - offsetTop) / height;
            ratio = Math.max(ratio , 0);
            ratio = Math.min(ratio , 1);
            PLAYER.audio.playbackRate = ratio + 0.5;
            PLAYER.playbackRate = ratio + 0.5;
            var tmp = (Math.round((ratio+0.5)*100)/100).toString();
            while(tmp.length < 4){
                tmp += '0';
            }
            if(tmp == '1000'){
                playbackRateButton.textContent = "倍速";
            }else{
                playbackRateButton.textContent = `${tmp}x`;
            }
            var bar = progress.getElementsByClassName('bar')[0];
            bar.style.height = `${ratio*100}%`;
            bar.style.top = `${(1-ratio)*100}%`;
            var dot = playbackRateConfig.getElementsByClassName('dot')[0];
            dot.style.top = `calc(${(1-ratio)*100}% - 5px)`;
        }
        function up(){
            document.body.style.userSelect = select;
            document.body.style.webkitUserSelect = select;
            mouseDown = false;
        }
        document.addEventListener('mousedown', down);
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
        document.addEventListener('touchstart', down);
        document.addEventListener('touchmove', move);
        document.addEventListener('touchend', up);
    })();

    // display the button to control desktop lyric.
    if('documentPictureInPicture' in window){
        document.getElementById("desktopLyricButton").style.display = "block";
    }
    // event for config UI.
    var configButton = document.getElementById("configButton");
    var config = document.getElementById("config");
    configButton.addEventListener('click', function(){
        config.style.display = 'block';
        config.style.animation = "fadeIn 100ms linear";
        this.style.display = 'none';
    });

    var configBackButton = document.getElementById("configBackButton");
    configBackButton.addEventListener('click', function(){
        config.style.display = 'none';
        configButton.style.display = 'block';
    });

    var configDefaultButton = document.getElementById("configDefaultButton");
    configDefaultButton.addEventListener('click', function(){
        font_change('fordefault');
        playmode_change('order');
        lyricColorMode_change('random');
        localStorage.setItem("lyricColor","FAFA17,ff1493,adff2f,d731f8,00CC65");
        var list = localStorage.getItem("lyricColor").split(',');
        var flag = 0;
        for(var i = 0 ; i < list.length ; i++){
            if(PLAYER.lyricStyleList[PLAYER.lyricStyle] == list[i]){
                flag = i;
                break;
            }
        }
        PLAYER.lyricStyle = flag;
        PLAYER.lyricStyleList = list;
        Array.from(document.getElementsByClassName("menu_lyricColor_button")).forEach(element => {
            element.classList.add("choosed");
        });
    });

    PLAYER = new Selected();
    PLAYER.init();
}); 

var mouseState = 'up',mouseStateTime = 0,mouseTouchStart = false;
var mouseInLyricContainer = false;
document.addEventListener('touchstart', function(){
    mouseStateTime = new Date().getTime();
    mouseState = 'down';
    mouseTouchStart = true;
});
document.addEventListener('mousedown', function(){
    mouseStateTime = new Date().getTime();
    mouseState = 'down';
});
document.addEventListener('mouseup', function(){
    mouseStateTime = new Date().getTime();
    mouseState = 'up';
});
document.addEventListener('touchend', function(){
    mouseStateTime = new Date().getTime();
    mouseState = 'up';
    mouseTouchStart = false;
});
document.getElementById('lyricWrapper').addEventListener('scroll',function(){
    mouseStateTime = new Date().getTime();
    mouseState = 'scroll';
});

async function FetchJson() {
    console.log("fetch content.json.");
    var response = await fetch('json/content.json');
    var json = await response.json();
    var text = JSON.stringify(json);
    localStorage.setItem("content.json",text);
}

async function loadJson(){
    var counterForContent = sessionStorage.getItem("counterForContent");
    if(localStorage.getItem("content.json")){
        if(counterForContent == null){
            sessionStorage.setItem("counterForContent",1);
            FetchJson();
        }
    }else if(counterForContent == null){
        await FetchJson();
    }
    return localStorage.getItem("content.json");
}

function mainRGB(img) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    var colors = {};
    var numPixels = 0;

    // RGB sum
    for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var key = `${r},${g},${b}`;
        if (!colors[key]) {
            colors[key] = {count: 0, color: key};
        }
        colors[key].count++;
        numPixels++;
    }

    // find which color appear counts max
    var maxColorKey = '';
    var maxCount = 0;
    for (var key in colors) {
        if (colors[key].count > maxCount) {
            maxCount = colors[key].count;
            maxColorKey = colors[key].color;
        }
    }
    return `rgb(${maxColorKey})`;
}

var Selected = function() {
    this.audio = document.getElementById('audio');
    this.lyricContainer = document.getElementById('lyricContainer');
    this.playlist = document.getElementById('playlist');
    this.lyricWrapper = document.getElementById('lyricWrapper');
    this.cover_img = document.getElementById("cover_img");
    this.disapointer = document.getElementById("disapointer");
    this.cover_disc = document.getElementById("cover_disc");
    this.cover_disc_img = document.getElementById("cover_disc_img");
    this.desktopLyricButton = document.getElementById("desktopLyricButton");
    this.currentIndex = 0;
    this.lyric = null;
    this.lyricStyle = 0; //random num to specify the different class name for lyric
    if(!localStorage.getItem("lyricColor")){
        localStorage.setItem("lyricColor","FAFA17,ff1493,adff2f,d731f8,00CC65");
    }
    this.lyricStyleList = localStorage.getItem("lyricColor").split(',');
    if(!localStorage.getItem("lyricColorMode")){
        localStorage.setItem("lyricColorMode","random");
    }
    if(localStorage.getItem("lyricColorMode") == "choose"){
        this.lyricStyleList = [localStorage.getItem("lyricColor").split(',')[0]];
    }
    this.lyricMode = "lrc";
    this.clickedToSetCurrentTime = false;
    this.last = -1;
    this.lastXrcLetterI = null;
    this.lastXrcLetterJ = null;
    //this.lyricTranslate is only for .xrc .
    this.lyricTranslate = null;
    this.lastHasTwoLanguage = false;
    this.audio_name = [];
    this.audio_artist = [];
    this.audio_album = [];
    this.duration = 0;
    this.audio_duration = [];
    this.volume = 1;
    this.playbackRate = 1;
};

Selected.prototype = {
    constructor: Selected, //fix the prototype chain
    init: async function() {
        
        //get all songs and add to the playlist
        await this.initialList();

        var that = this,
            allSongs = this.playlist.children[0].children,
            currentSong, randomSong;

        //get the hash from the url if there's any.
        var songName = window.location.hash.substring(1);
        //then get the index of the song from all songs
        var indexOfHashSong = (function() {
            /*By TH911:XPlayer use the number to flag each songs,instead of using words,so XPlayer needn't use this.*/
            /*var index = 0;
            Array.prototype.forEach.call(allSongs, function(v, i, a) {
                if (v.children[0].getAttribute('data-name') == songName) {
                    index = i;
                    return false;
                }
            });
            return index;*/
            if(1<=songName&&songName<=allSongs.length)return songName;
            return 0;
        })();

        this.currentIndex = indexOfHashSong || Math.floor(Math.random() * allSongs.length)+1;
        //Because the index of the first song is zero,minus 1.
        this.currentIndex=this.currentIndex-1;

        currentSong = allSongs[this.currentIndex];
        randomSong = currentSong.children[0].getAttribute('data-name');
        
        //set the song name to the hash of the url
        window.location.hash = window.location.hash || randomSong;

        //handle playlist
        this.playlist.addEventListener('click', function(e) {
            if (e.target.nodeName.toLowerCase() != 'a') {
                return;
            };
            var allSongs = that.playlist.children[0].children,
                selectedIndex = Array.prototype.indexOf.call(allSongs, e.target.parentNode);
            var tmp = that.currentIndex;
            that.currentIndex = selectedIndex;
            that.setClass(tmp,selectedIndex);
            var songName = e.target.getAttribute('data-name');
            window.location.hash = songName;
            that.play(songName);
        }, false);
        this.audio.onended = function() {
            that.ending();
        }
        this.audio.onerror = function(e) {
            console.error(`audio load error:${e}`);
            var audioErrorCount = sessionStorage.getItem("audioErrorCount");
            if(audioErrorCount == null)audioErrorCount=0;
            if(++audioErrorCount<=2)that.play(that.currentIndex+1);
            else that.lyricContainer.textContent = '歌曲加载失败,请检查网络或清空缓存并重试';
        };
        // change currentTime when click the lyrics.
        this.lyricContainer.addEventListener('click', (event) => {
            if(this.lyric.length <= 1)return;
            var item = event.target;
            if(item.tagName.toLowerCase() != 'span'){
                return;
            }
            if(item.parentNode.tagName.toLowerCase() == 'span'){
                item = item.parentNode;
            }
            // especially,lrc.
            if(that.lyricMode == 'lrc'){
                that.audio.currentTime = that.lyric[item.id.substring(5)][0] / 1000;
                that.audio.play();
                if(mouseState == 'scroll' && new Date().getTime() - mouseStateTime > 1500) {
                    if(!mouseTouchStart) {
                        mouseState = 'up';
                    }
                }
                if(mouseState == 'up'){
                    that.lyricWrapper.scrollTo(0,line.offsetTop);
                }
                return;
            }
            
            console.log("lyric-mode:",item.getAttribute('lyric-mode'));
            //clean the animation first.
            try{
                if(that.lyric){
                    for (var i = 0 ; i < that.lyric.length; i++) {
                        var lyricInline = that.lyric[i];
                        document.getElementById(`line-${i}`).className = '';
                        //find the line                            
                        for(var j = 0 ; j < lyricInline.length ; j++){
                            var letter = document.getElementById(`line-${i}-${j}`);
                            letter.style.animationName = '';
                            letter.style.animationDuration = '';
                            letter.style.animationTimingFunction = ''; 
                            letter.className = '';
                        }
                    }
                }
            }catch(error){
                console.error(`ERROR:${error}`);
            }

            if(item.getAttribute('lyric-mode') == "translate"){
                that.audio.currentTime = item.getAttribute('start-time') / 1000;
                that.audio.play();
                if(mouseState == 'scroll' && new Date().getTime() - mouseStateTime > 1500) {
                    if(!mouseTouchStart) {
                        mouseState = 'up';
                    }
                }
                if(mouseState == 'up'){
                    that.lyricWrapper.scrollTo(0,item.parentNode.previousSibling.offsetTop);
                }
                console.log("change currentTime when click.(translateLyric)");
            }else{
                that.audio.currentTime = item.getAttribute("start-time") / 1000;
                that.audio.play();
                if(mouseState == 'scroll' && new Date().getTime() - mouseStateTime > 1500) {
                    if(!mouseTouchStart) {
                        mouseState = 'up';
                    }
                }
                if(mouseState == 'up'){
                    that.lyricWrapper.scrollTo(0,item.offsetTop);
                }
                console.log("change currentTime when click.(normalLyric)");
            }
        });

        //enable keyboard control , spacebar to change the song
        window.addEventListener('keydown', this.keyboardCtrl, false);

        var bgMode = localStorage.getItem("bgMode");
        if(bgMode == null) {
            bgMode = "imageBg";
            localStorage.setItem("bgMode","imageBg");
        }
        document.getElementsByTagName('html')[0].className = bgMode;

        //initialize the background setting
        document.getElementById('bg_dark').addEventListener('click', function() {
            document.getElementsByTagName('html')[0].className = 'colorBg';
            localStorage.setItem("bgMode","colorBg");
        });
        document.getElementById('bg_pic').addEventListener('click', function() {
            document.getElementsByTagName('html')[0].className = 'imageBg';
            localStorage.setItem("bgMode","imageBg");
        });
        document.getElementById('bg_half').addEventListener('click', function() {
            document.getElementsByTagName('html')[0].className = 'halfBg';
            localStorage.setItem("bgMode","halfBg");
        });

        //initially start from a random song
        for (var i = allSongs.length - 1; i >= 0; i--) {
            allSongs[i].className = '';
        };
        currentSong.className = 'current-song';

        this.audio.addEventListener("timeupdate", function() {
            // hack iOS which can't end.
            if(this.currentTime > that.duration){
                that.ending();
            }
            //sync the lyric
            that.syncLyric();
        });

        // pause the animation of lyric if audio has paused and it's xrc.
        this.audio.addEventListener("pause", function(){
            if(that.lyricMode == 'xrc'){
                try{
                    if(that.lastXrcLetterI != null) {
                        var letter = document.getElementById(`line-${that.lastXrcLetterI}-${that.lastXrcLetterJ}`);
                        letter.style.animationPlayState = "paused";
                        if(pipWindow.open){
                            var letter = pipWindow.document.getElementById(`line-${that.lastXrcLetterI}-${that.lastXrcLetterJ}`);
                            letter.style.animationPlayState = "paused";
                        }
                    }
                }catch(error){
                    console.error(`ERROR:${error}`);
                }
            }
            that.cover_img.classList.add("paused");
            that.cover_disc.classList.add("paused");
            that.cover_disc_img.classList.add("paused");
            that.disapointer.classList.remove("rotate");
        });
        // play the animation
        this.audio.addEventListener("play", function(){
            if(that.lyricMode == 'xrc'){
                try{
                    if(that.lastXrcLetterI) {
                        var letter = document.getElementById(`line-${that.lastXrcLetterI}-${that.lastXrcLetterJ}`);
                        letter.style.animationPlayState = "running";
                        if(pipWindow.open){
                            var letter = pipWindow.document.getElementById(`line-${that.lastXrcLetterI}-${that.lastXrcLetterJ}`);
                            letter.style.animationPlayState = "running";
                        }
                    }
                }catch(error){
                    console.error(`ERROR:${error}`);
                }
            }
            that.cover_img.classList.remove("paused");
            that.cover_disc.classList.remove("paused");
            that.cover_disc_img.classList.remove("paused");
            that.disapointer.classList.add("rotate");
        });

        // pause when click the cover
        this.cover_img.addEventListener("click", function(){
            if(that.audio.paused){
                that.audio.play();
            }else{
                that.audio.pause();
            }
        });

        // button to control desktop lyric.
        if('documentPictureInPicture' in window){
            this.desktopLyricButton.addEventListener("click", function(){
                if(pipWindow.open){
                    pipWindow.close();
                }else{
                    pipWindow.create(that.lyricMode);
                }
            });
        }

        console.log("inited.It's time to play the song now.");

        this.play(randomSong);
    },
    keyboardCtrl: function(event) {
        var that = PLAYER;
        if(event.ctrlKey){
            function addVolume(add){
                var volumeConfig = document.getElementById("volumeConfig");
                var progress = volumeConfig.getElementsByClassName("bar-bg")[0];
                var ratio = Math.max(Math.min(that.audio.volume + add , 1) , 0);
                that.audio.volume = ratio;
                that.volume = ratio;
                volumeButton.title = `调节音量 ${Math.round(ratio*100)}%\n增大：Ctrl + Up\n减小：Ctrl + Down`;
                if(ratio == 0){
                    document.querySelector("#volumeButton svg").innerHTML = '<path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06M6 5.04 4.312 6.39A.5.5 0 0 1 4 6.5H2v3h2a.5.5 0 0 1 .312.11L6 10.96zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/>';
                }else if(ratio == 1){
                    document.querySelector("#volumeButton svg").innerHTML = '<path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/><path d="M10.025 8a4.5 4.5 0 0 1-1.318 3.182L8 10.475A3.5 3.5 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.5 4.5 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11"/>';
                }else{
                    document.querySelector("#volumeButton svg").innerHTML = '<path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12zM6.312 6.39 8 5.04v5.92L6.312 9.61A.5.5 0 0 0 6 9.5H4v-3h2a.5.5 0 0 0 .312-.11M12.025 8a4.5 4.5 0 0 1-1.318 3.182L10 10.475A3.5 3.5 0 0 0 11.025 8 3.5 3.5 0 0 0 10 5.525l.707-.707A4.5 4.5 0 0 1 12.025 8"/>';
                }
                var bar = progress.getElementsByClassName('bar')[0];
                bar.style.height = ratio*100 + '%';
                volumeConfig.getElementsByClassName("percent")[0].textContent = `${Math.round(ratio*100)}%`;
                bar.style.top = `${(1-ratio)*100}%`;
                var dot = volumeConfig.getElementsByClassName('dot')[0];
                dot.style.top = `calc(${(1-ratio)*100}% - 5px)`;
            }
            if(event.code == 'ArrowUp'){
                addVolume(0.1);
            }else if(event.code == 'ArrowDown'){
                addVolume(-0.1);
            }
        }else if(event.altKey){
            function addPlaybackRate(add){
                var playbackRateButton = document.getElementById("playbackRateButton");
                var playbackRateConfig = document.getElementById("playbackRateConfig");
                var progress = playbackRateConfig.getElementsByClassName("bar-bg")[0];
                var dot = playbackRateConfig.getElementsByClassName('dot')[0];
                var bar = progress.getElementsByClassName('bar')[0];
                var ratio = that.audio.playbackRate - 0.5 + add;
                ratio = Math.min(ratio , 1);
                ratio = Math.max(ratio , 0);
                PLAYER.audio.playbackRate = ratio + 0.5;
                PLAYER.playbackRate = ratio + 0.5;
                var tmp = (Math.round((ratio+0.5)*100)/100).toString();
                while(tmp.length < 4){
                    tmp += '0';
                }
                if(tmp == '1000'){
                    playbackRateButton.textContent = "倍速";
                }else{
                    playbackRateButton.textContent = `${tmp}x`;
                }
                bar.style.height = `${ratio*100}%`;
                bar.style.top = `${(1-ratio)*100}%`;
                dot.style.top = `calc(${(1-ratio)*100}% - 5px)`;
            }
            if(event.code == 'ArrowUp'){
                addPlaybackRate(0.05);
            }else if(event.code == 'ArrowDown'){
                addPlaybackRate(-0.05);
            }
        }else{
            if(event.code == 'ArrowUp'){
                that.playPrev();
            }else if(event.code == 'ArrowDown'){
                that.playNext();
            }else if(event.code == 'ArrowLeft'){
                that.audio.currentTime -= Math.min(that.audio.currentTime,10);
            }else if(event.code == 'ArrowRight'){
                that.audio.currentTime += 10;
            }else if(event.key == ' '){
                if(that.audio.paused)that.audio.play();
                else that.audio.pause();
            }
            // close volumeConfig
            document.getElementById("volumeConfig").style.display = 'none';
            // close playbackRateConfig
            document.getElementById("playbackRateConfig").style.display = 'none';
        }
    },
    initialList: async function() {
        var that = this;

        var response = await loadJson();

        var fragment = document.createDocumentFragment(),
        data = JSON.parse(response).data,
        ol = this.playlist.getElementsByTagName('ol')[0],
        fragment = document.createDocumentFragment();

        data.forEach(function(v, i, a) {
            var li = document.createElement('li'),
                a = document.createElement('a');
            a.href = 'javascript:void(0)';
            a.dataset.name = v.lrc_name;
            a.textContent = `${v.song_name} - ${v.artist}`;
            that.audio_name[i] = v.song_name;
            that.audio_artist[i] = v.artist;
            that.audio_album[i] = v.album;
            that.audio_duration[i] = v.duration;
            li.appendChild(a);
            li.id = `playlist-${i}`;
            fragment.appendChild(li);
        });
        ol.appendChild(fragment);
    },
    mediaSessionAPI: function(lyric){
        var that = this;
        // https://stackoverflow.com/questions/44418606/how-do-i-set-a-thumbnail-when-playing-audio-in-ios-safari
        if ('mediaSession' in navigator) {
            var title = `${this.audio_name[this.currentIndex]} - ${this.audio_artist[this.currentIndex]}`;
            navigator.mediaSession.metadata = new MediaMetadata({
                title: title,
                artist: lyric,
                artwork: [
                { src: that.cover_img.src }
                ]
            });
            navigator.mediaSession.setActionHandler("seekbackward", function () {
                that.audio.currentTime-=Math.min(10,audio.currentTime);
            });
            navigator.mediaSession.setActionHandler("seekforward", function () {
                that.audio.currentTime+=Math.min(10,PLAYER.duration-audio.currentTime);
            });
            navigator.mediaSession.setActionHandler("previoustrack", function () {
                that.playPrev();
            });
            navigator.mediaSession.setActionHandler("nexttrack", function () {
                that.playNext();
            });
            navigator.mediaSession.setActionHandler("play", function () {
                that.audio.play();
            });
            navigator.mediaSession.setActionHandler("pause", function () {
                that.audio.pause();
            });
            return true;
        }else return false;
    },
    play: function(songName) {
        var that = this;

        document.documentElement.style.setProperty("--halfBg-background-img",`url(../music/${songName}.webp)`);
        var prev = this.currentIndex - 1;
        if(prev < 0){
            prev = this.audio_name.length - 1;
        }
        document.getElementById("playPrevButton").title = `上一首 Up\n${this.audio_name[prev]} - ${this.audio_artist[prev]}`;
        var next = this.currentIndex + 1;
        if(next >= this.audio_name.length){
            next = 0;
        }
        document.getElementById("playNextButton").title = `上一首 Up\n${this.audio_name[next]} - ${this.audio_artist[next]}`;

        this.lyricTranslate = null;

        // clean the flag of animation.
        this.lastXrcLetterI = this.lastXrcLetterJ = null;


        this.lyricContainer.textContent = 'loading song...';
        this.audio.src = `music/${songName}.mp3`;

        this.cover_img.src = `music/${songName}.webp`;
        this.cover_disc_img.src = `music/${songName}.webp`;

        this.disapointer.classList.remove("playing");
        this.disapointer.classList.remove("rotate");
        this.cover_img.addEventListener('load',function(){
            this.style.borderColor = mainRGB(this);
            this.classList.add("rotate");
            that.cover_disc.classList.add("rotate");
            that.cover_disc_img.classList.add("rotate");
            that.disapointer.classList.add("playing");
            that.disapointer.classList.add("rotate");
        },{
            once: true
        });
        
        console.log("change the src.");
        this.audio.currentTime = 0;

        //first play,second load lyric
        //set this.audio.curremtTime will make canplay,so add this once when play.
        this.audio.addEventListener('canplay', function() {
            that.audio.volume = that.volume;
            that.audio.playbackRate = that.playbackRate;
            that.audio.play();
            that.getLyric(`music/${songName}`);
        },{
            once: true
        });

        this.audio.play();

        //scroll to which is playing
        var playlist_ol = document.getElementById("playlist_ol");
        var now = document.getElementById(`playlist-${PLAYER.currentIndex}`);
        playlist_ol.scrollTo({
            top: Math.max(0, Math.max(0,now.offsetTop - Math.floor(parseInt(this.playlist.clientHeight)/2))),
            behavior: 'smooth'
        });

        document.getElementById("songinfo_audio").textContent = document.getElementById(`playlist-${this.currentIndex}`).textContent;
        document.title = document.getElementById("songinfo_audio").textContent + " | XPlayer";

        if(pipWindow.open){
            pipWindow.document.body.title = document.title;
        }

        document.getElementById('songinfo_name').textContent = this.audio_name[this.currentIndex];
        document.getElementById('songinfo_artist').textContent = `歌手: ${this.audio_artist[this.currentIndex]}`;
        document.getElementById('songinfo_album').textContent = `专辑: ${this.audio_album[this.currentIndex]}`;
        this.duration = this.audio_duration[this.currentIndex];

        this.mediaSessionAPI(' ');

        var screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        this.lyricContainer.style.top = Math.floor((screenHeight-100)*0.4);
        //empty the lyric
        this.lyric = null;
        this.lyricStyle = 4;
        this.lyricStyle = Math.floor(Math.random() * this.lyricStyleList.length);
        if(this.desktopLyricButton.style.color){
            this.desktopLyricButton.style.color = `#${this.lyricStyleList[this.lyricStyle]}`;
        }
        //1145141919810
    },
    getLyricFetch: async function(url) {
        var answer;
        try{
            const response = await fetch(url);
            if(response.ok == false){
                answer = null;
            } else {
                answer = await response.text();
            }
        }catch{

        }return answer;
    },
    getLyric: async function(url) {
        this.lyricContainer.textContent = 'loading lyric...';
        // try to get xrc
        var lyric = await this.getLyricFetch(url + '.xrc');
        if(lyric != null){
            this.lyricMode = "xrc";
            this.lyricTranslate = await this.getLyricFetch(url + '_ts.xrc');
        }else{
            this.lyricMode = "lrc";
            lyric = await this.getLyricFetch(url + '.lrc');
        }
        this.lyric = this.parseLyric(lyric);
        this.appendLyric(this.lyric);
    },
    parseLyricLrc: function(text) {
        //get each line from the text
        var lines = text.split('\n'),
            //this regex mathes the time [00.12.78]
            pattern = /\[\d{2}:\d{2}.\d{2}\]/g,
            result = [];

        // Get offset from lyrics
        var offset = this.getOffset(text);

        //exclude the description parts or empty parts of the lyric
        while (!pattern.test(lines[0])) {
            lines = lines.slice(1);
        };
        //remove the last empty item
        if(lines[lines.length - 1].length == 0)lines.pop();
        //display all content on the page
        lines.forEach(function(v, i, a) {
            var time = v.match(pattern),
                value = v.replace(pattern, '');
            time.forEach(function(v1, i1, a1) {
                //convert the [min:sec] to secs format then store into result
                var t = v1.slice(1, -1).split(':');
                result.push([(parseInt(t[0], 10) * 60 + parseFloat(t[1]) + parseInt(offset)) * 1000, value]);
            });
        });
        //sort the result by time
        result.sort(function(a, b) {
            return a[0] - b[0];
        });
        return result;
    },
    parseLyricXrc: function(text) {
        // text = text.match(/<Lyric_1 LyricType="1" LyricContent="([^"]+)"/);
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(text,"text/xml");
        console.log(xmlDoc);
        try {
            text = xmlDoc.getElementsByTagName("Lyric_1")[0].getAttribute("LyricContent");
        } catch(err) {
            console.error(err);
            alert(".xrc 歌词解析出错.\nfailed to load lyric.");
        }
        var tmpText = [];
        for(var i = 0 ; i < text.length ; i++){
            if(text[i] == '[' && i > 0){
                tmpText += '\n';
            }
            tmpText += text[i];
        }
        text=tmpText;
        if (!text) {
            return null;
        }
        
        // const lyricContent = text[1];
        const lyricContent = text;
        
        const lines = lyricContent.split('\n').filter(line => line.trim() !== '');
    
        const lyric = [];
        
        lines.forEach(line => {
            const lineMatch = line.match(/\[\s*-?\d+\s*,\s*-?\d+\s*\]/);
            if (lineMatch) {
                const lyricsText = lineMatch.input.substring(lineMatch[0].length);
                const inline = [];

                const str = [...lyricsText.matchAll(/\(\s*-?\d+\s*,\s*-?\d+\s*\)/g)];

                for(var i = 0;i < str.length ;i++){
                    const word = lyricsText.substring((i > 0 ? str[i-1].index + str[i-1][0].length : 0),str[i].index);
                    const time = str[i][0].match(/-?\d+/g);
                    // ms
                    const start = parseInt(time[0]);
                    const end = (parseInt(time[0]) + parseInt(time[1]) - 1);
            
                    inline.push([word, start, end]);
                }
            
                lyric.push(inline);
            }
        });
        return lyric;
    },
    parseLyric: function(text) {
        if(this.lyricMode == "lrc"){
            return this.parseLyricLrc(text);
        }else{
            return this.parseLyricXrc(text);
        }
    },
    appendLyricLrc: function(lyric) {
        var lyricContainer = this.lyricContainer,
            fragment = document.createDocumentFragment();
        //clear the lyric container first
        this.lyricContainer.innerHTML = '';
        var that = this;
        lyric.forEach(function(v, i, a) {
            var line_p = document.createElement('p');
            var line = document.createElement('span');
            line.id = `line-${i}`;
            line.textContent = v[1];
            line.classList.add("lyric-line");
            line.style.backgroundClip = "text";
            line.style.webkitBackgroundClip = "text";
            
            line_p.appendChild(line);
            fragment.appendChild(line_p);
        });
        lyricContainer.appendChild(fragment);
    },
    appendLyricXrc: function(lyric) {

        var translateIsEnabled = false;

        var lyricTranslate = null;
        
        if(this.lyricTranslate != null) {
            translateIsEnabled = true;
            console.log("Translating lyrics is available.");
            lyricTranslate = this.parseLyricLrc(this.lyricTranslate);

            for(var i = 0 , j = 0; i < lyricTranslate.length ; i++){
                if(lyricTranslate[i][1] == '//\r' || lyricTranslate[i][1] == '\r' || lyricTranslate[i][1] == '//' || lyricTranslate[i][1] == ''){
                    continue;
                }else{
                    lyricTranslate[j++]=lyricTranslate[i];
                }
            }
            lyricTranslate.length = j;

            console.log(lyricTranslate);
            console.log(lyric);
        }

        var that = this;
        var lyricContainer = this.lyricContainer,
            fragment = document.createDocumentFragment();
        
        var pointer = 0;
        //clear the lyric container first
        this.lyricContainer.innerHTML = '';
        for(var i = 0;i < lyric.length;i++){
            var line_p = document.createElement('p');
            var line = document.createElement('span');
            line.id = `line-${i}`;
            line.classList.add("lyric-line");
            line.setAttribute('start-time',lyric[i][0][1]);
            line.setAttribute('lyric-mode','normal');
            //lyric for mediaSession API.
            line.setAttribute('word','');
            // line.setAttribute('end-time',lyric[i][lyric[i].length-1][2]);
            for(var j = 0;j < lyric[i].length;j++){
                var letter = document.createElement('span');
                letter.style.backgroundClip = "text";
                letter.style.webkitBackgroundClip = "text";
                letter.id = `${line.id}-${j}`;
                letter.textContent = lyric[i][j][0];
                // letter.setAttribute('start-time',lyric[i][j][1]);
                // letter.setAttribute('end-time',lyric[i][j][2]);
                line.setAttribute('word',line.getAttribute('word') + letter.textContent);
                line.appendChild(letter);
            }
            line_p.appendChild(line);
            fragment.appendChild(line_p);

            // Add translated lyrics
            if(translateIsEnabled && pointer < lyricTranslate.length) {

                var minus = Math.abs(lyric[i][0][1] - lyricTranslate[pointer][0]);

                if(minus <= 1000) {
                    var line_p = document.createElement('p');
                    var line = document.createElement('span');
                    line.textContent = lyricTranslate[pointer++][1];

                    line.classList.add('translateLyric');
                    line.classList.add("lyric-line");
                    line.setAttribute('start-time',lyric[i][0][1]);
                    line.setAttribute('lyric-mode','translate');

                    line_p.appendChild(line);
                    fragment.appendChild(line_p);
                }
            }
        }
        lyricContainer.appendChild(fragment);
    },
    appendLyric: function(lyric) {
        if(this.lyricMode == "lrc"){
            this.appendLyricLrc(lyric);
        }else{
            this.appendLyricXrc(lyric);
        }
    },
    syncLyricLrc: function(){
        this.lyricContainer.className = '';
        try{
            if(!this.lyric)return;
            var currentTime = this.audio.currentTime * 1000 + 500;
            for (var i = 0, l = this.lyric.length; i <= l; i++) {
                //preload the lyric by 0.50s || end
                if (i == l || currentTime <= this.lyric[i][0] ){
                    if(i > 0) i--;

                    // console.log("find at ${i}");

                    if(i > 1 && this.lyric[i][0] == this.lyric[i-1][0]){
                        i--;
                    }

                    var line = document.getElementById(`line-${i}`);
                    //randomize the color of the current line of the lyric
                    line.className = `current-line-${this.lyricStyleList[this.lyricStyle]}`;

                    if(i != this.last){
                        this.last=i;
                        if(mouseState == 'scroll' && new Date().getTime() - mouseStateTime > 1500) {
                            if(!mouseTouchStart) {
                                mouseState = 'up';
                            }
                        }
                        if(mouseState == 'up'){
                            this.lyricWrapper.scrollTo(0,line.offsetTop);
                        }
                    }

                    //for the lyric to MediaSession
                    var lyric_for_API,text_translate=null;
                    lyric_for_API = this.lyric[i][1];
                    if(i+1 < l && this.lyric[i][0] == this.lyric[i+1][0])text_translate = this.lyric[i+1][1];
                    if(lyric_for_API.length == 0)lyric_for_API = " ";

                    //sync MediaSession API
                    this.mediaSessionAPI(lyric_for_API);

                    // sync pipWindow
                    pipWindow.fill(lyric_for_API,text_translate);

                    //del the color of which lyric after this.
                    for(var j = i + 1 ; j<l ; j++){
                        var line = document.getElementById(`line-${j}`);
                        line.className='';
                        line.classList.add("lyric-line");
                    }
                    
                    break;
                }else{
                    try{
                        var line = document.getElementById(`line-${i}`);
                        line.className = '';
                        line.classList.add("lyric-line");
                    }catch{
                        console.error(`error on #${i}`);
                    }
                }
            }
        }catch(error){
            console.error(`ERROR:${error}`);
        }
    },
    syncLyricXrc: function(){
        this.lyricContainer.classList.add(`current-line-xrc-${this.lyricStyleList[this.lyricStyle]}`);
        try{
            if(!this.lyric)return;
            // preload by 0.25s.
            var currentTime = this.audio.currentTime * 1000 + 250;
            for (var i = 0 ; i < this.lyric.length; i++) {
                var lyricInline = this.lyric[i];
                //find the line
                if(currentTime <= lyricInline[lyricInline.length - 1][2] + 0.25){

                    var line = document.getElementById(`line-${i}`);

                    line.classList.add('current-line');

                    // scroll
                    if(i != this.last){
                        if(mouseState == 'scroll' && new Date().getTime() - mouseStateTime > 1500) {
                            if(!mouseTouchStart) {
                                mouseState = 'up';
                            }
                        }
                        if(mouseState == 'up'){
                            this.lyricWrapper.scrollTo(0,line.offsetTop);
                        }
                        this.last = i;
                    }
                    if(currentTime >= lyricInline[0][1]){
                        this.mediaSessionAPI(line.getAttribute("word"));
                    }
                    
                    for(var j = 0 ; j < lyricInline.length ; j++){

                        var letter = document.getElementById(`line-${i}-${j}`);

                        if(currentTime > lyricInline[j][2]) {
                            letter.classList.add(`current-line-xrc-played-${this.lyricStyleList[this.lyricStyle]}`);
                            letter.classList.remove(`current-line-xrc-playing-${this.lyricStyleList[this.lyricStyle]}`);
                        } else {
                            if(currentTime < lyricInline[j][1]){
                                break;
                            }

                            letter.classList.add(`current-line-xrc-playing-${this.lyricStyleList[this.lyricStyle]}`);

                            if(this.lastXrcLetterI != i || this.lastXrcLetterJ != j){
                                letter.style.animationName = "lyric_sync_letter";
                                letter.style.animationTimingFunction = "linear";
                                letter.style.animationDuration = `${(lyricInline[j][2] - lyricInline[j][1]) * (1 / this.audio.playbackRate)}ms`;
                                this.lastXrcLetterI = i;
                                this.lastXrcLetterJ = j;

                                pipWindow.fillXrc(document.getElementById(`line-${this.lastXrcLetterI}`));
                            }

                            break;
                        }
                    }

                    

                    for(i++ ; i < this.lyric.length ; i++) {
                        try {
                            var line = document.getElementById(`line-${i}`);
                            line.className = '';
                            line.classList.add("lyric-line");
                            document.getElementById(`line-${i}`).classList.add('current-line-xrc');
                            line.style = '';
                            Array.from(line.getElementsByTagName('span')).forEach(span => {
                                span.className = '';
                                span.style = 'background-clip: text';
                            });
                        } catch {
                            console.error(`error on #${j}`);
                        }
                    }
                    break;
                } else {
                    try {
                        var line = document.getElementById(`line-${i}`);
                        line.className = '';
                        line.classList.add("lyric-line");
                        line.style = '';
                        document.getElementById(`line-${i}`).classList.add('current-line-xrc');
                        Array.from(line.getElementsByTagName('span')).forEach(span => {
                            span.className = '';
                            span.style = 'background-clip: text';
                        });
                    } catch {
                        console.error(`error on #${i}`);
                    }
                }
            }
        }catch(error){
            console.error(`ERROR:${error}`);
        }
    },
    syncLyric: function(){
        if(this.lyricMode == "lrc"){
            this.syncLyricLrc();
        }else{
            if(this.clickedToSetCurrentTime) return;
            this.syncLyricXrc();
        }
    },
    ending: function() {

        if(this.lyricTranslate){
            this.lastHasTwoLanguage = true;
        } else {
            this.lastHasTwoLanguage = false;
        }

        this.audio.currentTime = 0;

        pipWindow.fill(" ",null);

        //order,reverse,random,loop.
        var player_mode = "order";
        if(localStorage.getItem("player_mode")!=null)player_mode=localStorage.getItem("player_mode");
        else localStorage.setItem("player_mode",player_mode);
        switch(player_mode){
            case "order":
                this.playNext();
                break;
            case "reverse":
                this.playPrev();
                break;
            case "random":
                this.playRandom();
                break;
            case "loop":
                this.playAgain();
                break;
        }
    },
    all_played: function(){
        var allSongs = this.playlist.children[0].children;
        for(var i = 0 ; i<allSongs.length ; i++ ){
            if(allSongs[i].className != 'current-song-played' && allSongs[i].className != 'current-song'){
                return false;
            }
        }
        return true;
    },
    playNum: function(index){
        var allSongs = this.playlist.children[0].children;
        var tmp = this.currentIndex;
        this.currentIndex = index;
        this.setClass(tmp,this.currentIndex);
        var Item = allSongs[this.currentIndex].children[0];
        var songName = Item.getAttribute('data-name');
        window.location.hash = songName;
        this.play(songName);
    },
    playRandom: function(){
        var allSongs = this.playlist.children[0].children,
            randomItem;
        var tmp = this.currentIndex;
        var flag = this.all_played();
        if(flag){
            for(var i = 0 ; i < allSongs.length ; i++)allSongs[i].className = '';
        }
        do{
            this.currentIndex = Math.floor(Math.random() * this.playlist.children[0].children.length);
        } while(allSongs[this.currentIndex].className == 'current-song-played' || allSongs[this.currentIndex].className == 'current-song');
        randomItem = allSongs[this.currentIndex].children[0];
        this.setClass((flag ? -1 : tmp),this.currentIndex);
        var songName = randomItem.getAttribute('data-name');
        window.location.hash = songName;
        this.play(songName);
    },
    playAgain: function() {
        this.audio.currentTime = 0;
        this.audio.play();
    },
    playNext: function() {
        var allSongs = this.playlist.children[0].children,
            nextItem;
        var tmp = this.currentIndex;
        //reaches the last song of the playlist?
        if (this.currentIndex === allSongs.length - 1) {
            //play from start
            this.currentIndex = 0;
        } else {
            //play next index
            this.currentIndex ++;
        };
        nextItem = allSongs[this.currentIndex].children[0];
        this.setClass(tmp,this.currentIndex);
        var songName = nextItem.getAttribute('data-name');
        window.location.hash = songName;
        this.play(songName);
    },
    playPrev: function() {
        var allSongs = this.playlist.children[0].children,
            prevItem;
        var tmp = this.currentIndex;
            //reaches the first song of the playlist?
        if (this.currentIndex === 0) {
            //play from end
            this.currentIndex = allSongs.length - 1;
        } else {
            //play prev index
            this.currentIndex -= 1;
        };
        prevItem = allSongs[this.currentIndex].children[0];
        this.setClass(tmp,this.currentIndex);
        var songName = prevItem.getAttribute('data-name');
        window.location.hash = songName;
        this.play(songName);
    },
    setClass: function(old_index,new_index) {
        var allSongs = this.playlist.children[0].children;
        if(old_index!=-1)allSongs[old_index].className = 'current-song-played';
        allSongs[new_index].className = 'current-song';
    },
    getOffset: function(text) {
        //Returns offset in miliseconds.
        var offset = 0;
        try {
            // Pattern matches [offset:1000]
            var offsetPattern = /\[offset:\-?\+?\d+\]/g,
                // Get only the first match.
                offset_line = text.match(offsetPattern)[0],
                // Get the second part of the offset.
                offset_str = offset_line.split(':')[1];
            // Convert it to Int.
            offset = parseInt(offset_str);
        } catch (err) {
            // alert("offset error: ${err.message}");
            offset = 0;
        }return offset;
    },
    download: function(id){
        if(!id){
            id = this.currentIndex;
        }
        var allSongs = this.playlist.children[0].children;
        var songName = allSongs[id].children[0].getAttribute('data-name');
        var link = document.createElement('a');
        link.href = `music/${songName}.mp3`;
        link.download = `${allSongs[id].children[0].textContent}.mp3`;
        link.target = '_blank';
        link.click();
    }
};

//spectrum
var cvs = document.getElementById("spectrum-cvs");
var ctx = cvs.getContext("2d");
var audio = document.getElementById("audio");
let analyser = null;
let dataArray = new Uint8Array(512);

function initAudio() {
    let audctx = new AudioContext();
    let source = audctx.createMediaElementSource(audio);
    analyser = audctx.createAnalyser();
    analyser.fftSize = 512;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    draw();

    source.connect(analyser);
    analyser.connect(audctx.destination);
}

function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    analyser.getByteFrequencyData(dataArray);

    const len = cvs.width / 3;
    const barWidth = 3;

    const gradient = ctx.createLinearGradient(0, 0, cvs.width, 0);
    gradient.addColorStop(0, "#00ffff");
    gradient.addColorStop(1, "#ff1493");

    for (let i = 0; i < len; i++) {
        const data = dataArray[i];
        const barHeight = data / 255 * cvs.height;
        const x = i * barWidth;
        const y = cvs.height - barHeight;

        drawRoundedRect(x, y, barWidth, barHeight, 3);

        ctx.fillStyle = gradient;
        ctx.fill(); 
    }
}

function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000';
    ctx.stroke();
}

initAudio();

document.getElementById("audio").addEventListener('pause', function(){
    ctx.clearRect(0, 0, cvs.width, cvs.height);
});
