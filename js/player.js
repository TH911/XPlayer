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
    var playlist_button=document.getElementById("playlist_button");
    var songimg = document.getElementById("songimg");
    var audio_player = document.getElementById("player");
    var playlist_ol = document.getElementById("playlist_ol");
    var playlist=document.getElementById("playlist");
    var header = document.getElementById("header");
    var lyricWrapper = document.getElementById("lyricWrapper");
    lyricWrapper.style.height = (screenHeight - 130) + 'px';
    var controls = document.getElementById("controls");
    var search_container = document.getElementById("search-container");
    var spectrum = document.getElementById("spectrum");

    // for mobile
    if(screenWidth<screenHeight||screenWidth<800){
        //hide "controls"
        // controls.style.display = "none";
        controls.style.position = "fixed";
        controls.style.top = "0px";
        controls.style.height = "200px";

        header.style.display = "none";
        playlist_button.style.display = "block";
        playlist_button.style.width = Math.floor(screenWidth*0.4) + 'px';
        // hide the cover of the song(and the info) if the width of the screen is too small
        songimg.style.display = "none";
        
        //close the playlist for default
        if(flag_playlist)playlist.style.display = "none";
        //the height of the playlist
        
        playlist.style.width = Math.floor(screenWidth*0.8)+'px';
        playlist.style.height = (screenHeight - 140) + 'px';
        playlist_ol.style.height = playlist.style.height;
        playlist.style.backgroundColor = "#1b2426";

        //for the player
        audio_player.style.width = Math.floor(screenWidth*0.9) +'px';
        audio_player.style.opacity = 1;
        audio_player.style.bottom = '0px';

        search_container.style.display = "none";
        search_container.style.width = playlist.style.width;
        search_container.style.right = "auto";
        search_container.style.left = 0;
        search_container.style.top = "60px";
        if(playlist.style.display != "block") document.getElementById("button_search-container").style.display = "block";
        document.getElementById("button_search-container").style.width = playlist_button.style.width;

        lyricWrapper.style.width = "90%";
    }else{
        controls.style.position = "relative";
        controls.style.height = "77px";

        header.style.display = "block";
        songimg.style.display = "block";
        playlist.style.display = "block";
        playlist_button.style.display = "none";

        playlist.style.height = (screenHeight - 80) + 'px';
        playlist.style.width = Math.floor(screenWidth*0.24) + 'px';
        playlist.style.backgroundColor = "#32323280";
        playlist_ol.style.height = playlist.style.height;
        audio_player.style.width = Math.floor(screenWidth*0.5) +'px';
        songimg.style.width = playlist.style.width;

        audio_player.style.bottom = '5px';
        audio_player.style.opacity = 0.6;

        var songinfo_name = document.getElementById("songinfo_name");
        songinfo_name.style.fontSize = Math.floor(Math.floor(screenWidth*0.24)/15) + 'px';
        var songinfo_artist = document.getElementById("songinfo_artist");
        songinfo_artist.style.fontSize = Math.floor(Math.floor(screenWidth*0.24)/20) + 'px';
        var songinfo_album = document.getElementById("songinfo_album");
        songinfo_album.style.fontSize = Math.floor(Math.floor(screenWidth*0.24)/20) + 'px';

        songimg.style.top = Math.floor((screenHeight - Math.floor(screenWidth*0.24) - Math.floor(Math.floor(screenWidth*0.24)/15) - Math.floor(Math.floor(screenWidth*0.24)/20) - Math.floor(Math.floor(screenWidth*0.24)/20))/2) + 'px';
        
        search_container.style.display = "block";
        search_container.style.width = playlist.style.width;
        search_container.style.left = "auto";
        search_container.style.right = "20px";
        search_container.style.top = "20px";

        document.getElementById("button_search-container").style.display = "none";

        lyricWrapper.style.width = "50%";
    }
    spectrum.style.width = lyricWrapper.style.width;
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
        document.getElementById("controls").style.display = "none";

        //scroll to which is playing
        var playlist_ol = document.getElementById("playlist_ol");
        var now = document.getElementById("playlist-" + PLAYER.currentIndex);
        var playlist_height = playlist.style.height.split('px')[0];
        playlist_ol.scrollTop = Math.max(0,now.offsetTop - Math.floor(parseInt(playlist_height)/2));
    }else{
        playlist.style.display = "none";
        button_search.style.display = "block";
        document.getElementById("controls").style.display = "block";
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // 设置音频文件名显示宽度
    var element = document.querySelector('.audio-right');
    var maxWidth = window.getComputedStyle(element, null).width;
    document.querySelector('.audio-right p').style.maxWidth = maxWidth;

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
    var audioPlayer = document.getElementById('audioPlayer' + index);

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
        audioPlayer.src = 'data:image/png;base64,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';
    }, false);
    audio.addEventListener('play', function() {
        audioPlayer.src = 'data:image/png;base64,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';
    }, false);
    
    // play/pause when click
    audioPlayer.addEventListener('click', function () {
        if (audio.paused)audio.play();
        else audio.pause();
    }, false);

    //enable keyboard control , spacebar to play and pause
    window.addEventListener('keydown', function(e) {
        if (e.key == ' ') {
            if (audio.paused)audio.play();
            else audio.pause();
        }
    }, false);

    // change the time when click the progress bar
    // PS：DON'T USE CLICK，or The drag progress point event below may trigger here, and at this point, the value of e.offsetX is very small, which can cause the progress bar to pop back to the beginning (unbearable!!)
    var progressBarBg = document.getElementById('progressBarBg' + index);
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
    var dot = document.getElementById('progressDot' + index);

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

    function down(event) {
        if (!audio.paused || audio.currentTime != 0) { // 只有音乐开始播放后才可以调节，已经播放过但暂停了的也可以
            flag = true;

            position.oriOffestLeft = dot.offsetLeft;
            position.oriX = event.touches ? event.touches[0].clientX : event.clientX; // 要同时适配mousedown和touchstart事件
            position.maxLeft = position.oriOffestLeft; // 向左最大可拖动距离
            position.maxRight = document.getElementById('progressBarBg' + index).offsetWidth - position.oriOffestLeft; // 向右最大可拖动距离

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
            var progressBarBg = document.getElementById('progressBarBg' + index);
            var pgsWidth = parseFloat(window.getComputedStyle(progressBarBg, null).width.replace('px', ''));
            var rate = (position.oriOffestLeft + length) / pgsWidth;
            audio.currentTime = PLAYER.duration * rate;
            updateProgress(audio, index);
        }
    }

    function end() {
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
    document.getElementById('progressBar' + index).style.width = value * 100 + '%';
    document.getElementById('progressDot' + index).style.left = value * 100 + '%';
    document.getElementById('audioCurTime' + index).innerText = transTime(audio.currentTime);
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
        time = formatTime(h + ":" + m + ":" + s);
    } else {
        time = formatTime(m + ":" + s);
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
        time += s[i].length == 1 ? ("0" + s[i]) : s[i];
        time += ":";
    }
    time += s[i].length == 1 ? ("0" + s[i]) : s[i];

    return time;
}

const searchBox = document.getElementById('search-box');
const searchResults = document.getElementById('search-results');

async function loadData() {
    try {
        const response = await fetch('json/content.json');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('failed to loading the search box of songs:', error);
    }
}

async function searchSongs(query) {
    if (!query) {
        searchResults.innerHTML = '';
        return;
    }

    const songs = await loadData();
    const queryLowerCase = query.toLowerCase();
    const filteredSongs = songs.filter(song => 
        song.song_name.toLowerCase().includes(queryLowerCase) || song.artist.toLowerCase().includes(queryLowerCase) || song.lrc_name.toLowerCase().includes(queryLowerCase)
    );

    searchResults.innerHTML = filteredSongs.map(song => 
        `<li id='search-songs-${song.lrc_name}'>
            <strong>${song.song_name}</strong> - ${song.artist}
        </li>`
    ).join('');
}


searchBox.addEventListener('input', (event) => {
    const query = event.target.value;
    searchSongs(query);
});


searchResults.addEventListener('click', (event) => {
    const clickedItem = event.target;
    if (clickedItem.tagName.toLowerCase() === 'li') {
        document.getElementById("search-box").value = "";
        document.getElementById("search-results").innerHTML = "";
        responsiveDesign();
        PLAYER.playNum(PLAYER,parseInt(clickedItem.id.substring(13))-1);
    }
});

function search_hide(){
    var search_container = document.getElementById("search-container");
    if(search_container.style.display == "none"){
        search_container.style.display = "block";
        document.getElementById("controls").style.display = "none";
    }else{
        search_container.style.display = "none";
        document.getElementById("controls").style.display = "block";
    }
}

document.addEventListener('keydown', function(event) {
    //prevent default spacebar behavior (for spacebar to control play/pause)
    if(event.key === ' ')event.preventDefault();
})

//the menu of fontfamily,fontsize,background-img,...
$(document).ready(function() {
    $('.menu-title').click(function() {
        $(this).siblings('.menu-content').toggleClass('show');
    });
});

function menu_color_change(that,mode){
    if(mode == 2)that.style.color = "#999";
    else that.style.color = "#fff";
    if(localStorage.getItem("player_mode") == that.id.substring(5))that.style.color = "#fff";
    if(localStorage.getItem("player_font") == that.id.substring(10))that.style.color = "#fff";
}

//to change the opacity when mouse across the player
function player_opacity(mode){
    var player=document.getElementById("player");
    if(mode==1)player.style.opacity=0.6;
    else player.style.opacity=1;
}

//change the playermode
function playmode_change(mode){
    var mode2=localStorage.getItem("player_mode");
    if(mode2!=null)document.getElementById("menu_" + localStorage.getItem("player_mode")).style.color = "#999";
    localStorage.setItem("player_mode",mode);
    document.getElementById("menu_" + mode).style.color = "#fff";
}

function font_change(font){
    var font2 = localStorage.getItem("player_font");
    if(font2!=null)document.getElementById("menu_font_" + font2).style.color = "#999";
    localStorage.setItem("player_font",font);
    document.getElementById("menu_font_" + font).style.color = "#fff";
    var lyricWrapper = document.getElementById("lyricWrapper");
    lyricWrapper.style.fontFamily = font;
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
function hide_font(){
    var font_menu = document.getElementById("menu-font");
    if(font_menu.style.display == "none")font_menu.style.display = "block";
    else font_menu.style.display = "none";
}
function hide_playmode(){
    var playmode_menu = document.getElementById("menu-playmode");
    if(playmode_menu.style.display == "none")playmode_menu.style.display = "block";
    else playmode_menu.style.display = "none";
}

// https://stackoverflow.com/questions/44418606/how-do-i-set-a-thumbnail-when-playing-audio-in-ios-safari
function mediaSessionAPI(that,name,lyric){
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: name,
            artist: lyric,
            artwork: [
            { src: document.getElementById('cover_img').src }
            ]
        });
        navigator.mediaSession.setActionHandler("seekbackward", function () {
            var audio = document.getElementById("audio");
            audio.currentTime-=Math.min(10,audio.currentTime);
        });
        navigator.mediaSession.setActionHandler("seekforward", function () {
            var audio = document.getElementById("audio");
            audio.currentTime+=Math.min(10,PLAYER.duration-audio.currentTime);
        });
        navigator.mediaSession.setActionHandler("previoustrack", function () {
            that.playPrev(that);
        });
        navigator.mediaSession.setActionHandler("nexttrack", function () {
            that.playNext(that);
        });
        navigator.mediaSession.setActionHandler("play", function () {
            var audio = document.getElementById("audio");
            audio.play();
        });
        navigator.mediaSession.setActionHandler("pause", function () {
            var audio = document.getElementById("audio");
            audio.pause();
        });
        return true;
    }else return false;
}

var pipWindow,pipWindowIsOpened = false;
async function pipWindowCreate(Width,Height) {
    console.log("pipWindow has created.");
    pipWindow = await window.documentPictureInPicture.requestWindow({
        width: Width,
        height: Height
    });
    pipWindowIsOpened = true;
    
    pipWindow.document.addEventListener("keydown",function(e) {
        if(e.key == 'p'){
            pipWindow.close();
            keydownForPipWindow=0;
        }
        if(e.key == ' '){
            if(PLAYER.audio.paused)PLAYER.audio.play();
            else PLAYER.audio.pause();
        }
        if(e.code == 'ArrowUp')PLAYER.playPrev(PLAYER);
        else if(e.code == 'ArrowDown')PLAYER.playNext(PLAYER);
        else if(e.code == 'ArrowLeft'){
            PLAYER.audio.currentTime-=Math.min(PLAYER.audio.currentTime,10);
        }else if(e.code == 'ArrowRight'){
            PLAYER.audio.currentTime+=10;
        }
    });
    pipWindow.addEventListener('beforeunload',function() {
        keydownForPipWindow = 0;
        pipWindowIsOpened = false;
    });

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
                if(pipWindowIsOpened){
                    pipWindowFill(lyric_for_API,text_translate);
                }

                break;
            }
        }
    }catch(error){
        console.log("ERROR:" + error);
    }
}
function pipWindowFillTextLength(text){
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
}
async function pipWindowFill(text,text_translate) {
    var tool = document.createElement('div');
    tool.id = "tool";
    tool.textContent = text;
    tool.style.fontFamily = localStorage.getItem("player_font");
    tool.style.textShadow = "1px 0 0 #000, -1px 0 0 #000, 0 1px 0 #000, 0 -1px 0 #000";
    tool.style.fontWeight = "bolder";
    
    var text_length = pipWindowFillTextLength(text);
    
    tool.style.fontSize = Math.min(Math.floor((pipWindow.innerWidth-40) / text_length),pipWindow.innerHeight-20) + 'px';

    tool.style.color = ['#FAFA17','#ff1493','#adff2f','#d731f8'][PLAYER.lyricStyle];
    pipWindow.document.body.innerHTML = '';
    pipWindow.addEventListener('resize',function() {
        var tool = pipWindow.document.getElementById("tool");
        tool.fontSize = Math.min(Math.floor((pipWindow.innerWidth-40) / tool.textContent.length),pipWindow.innerHeight-20) + 'px';
    });
    tool.style.textAlign = "center";
    tool.style.lineHeight = pipWindow.innerHeight-20 + 'px';

    if(text_translate != null){
        var text_translate_length = pipWindowFillTextLength(text_translate);
        tool.style.fontSize = Math.min(Math.min(Math.floor((pipWindow.innerWidth-40) / text_length),(pipWindow.innerHeight-20)/2) , Math.min(Math.floor((pipWindow.innerWidth-40) / text_translate_length),pipWindow.innerHeight-20)) + 'px';
        tool.textContent = text + '' + text_translate;
        var tool_text = document.createElement('div');
        var tool_text_translate = document.createElement('div');
        tool.style.lineHeight = Math.floor((pipWindow.innerHeight-20)/2) + 'px';
        tool.textContent = "";
        tool_text.textContent = text;
        tool_text_translate.textContent = text_translate;
        tool_text_translate.style.color = "#fff";
        tool.appendChild(tool_text);
        tool.appendChild(tool_text_translate);
    }

    pipWindow.document.body.appendChild(tool);
}

var keydownForPipWindow=0;
document.addEventListener('keydown', function(e){
    if(e.key!='p')return;
    if('documentPictureInPicture' in window){
        ++keydownForPipWindow;
        // alert("keydownForPipWindow=" + keydownForPipWindow);
        if(keydownForPipWindow==2){
            keydownForPipWindow=0;
            pipWindow.close();
        }else{
            pipWindowCreate(300,20);
        }
    }else{
        console.log("pipWindow isn't supported.");
    }
});

var PLAYER;
window.onload = function() {
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

    PLAYER = new Selected();
    PLAYER.init();
};
var Selected = function() {
    this.audio = document.getElementById('audio');
    this.lyricContainer = document.getElementById('lyricContainer');
    this.playlist = document.getElementById('playlist');
    this.currentIndex = 0;
    this.lyric = null;
    this.lyricStyle = 0; //random num to specify the different class name for lyric
    this.last = -1;
    this.audio_name = [];
    this.audio_artist = [];
    this.audio_album = [];
    this.duration = 0;
    this.audio_duration = [];
};

Selected.prototype = {
    constructor: Selected, //fix the prototype chain
    init: function() {
        
        //get all songs and add to the playlist
        this.initialList(this);

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
            if (e.target.nodeName.toLowerCase() !== 'a') {
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
            that.ending(that);
        }
        this.audio.onerror = function(e) {
            console.log("audio load error:" + e);
            var audioErrorCount = sessionStorage.getItem("audioErrorCount");
            if(audioErrorCount == null)audioErrorCount=0;
            if(++audioErrorCount<=2)that.play(that.currentIndex+1);
            else that.lyricContainer.textContent = '歌曲加载失败,请检查网络或清空缓存并重试';
        };

        //enable keyboard control , spacebar to change the song
        window.addEventListener('keydown', function(e) {
            if(e.code == 'ArrowUp')that.playPrev(that);
            else if(e.code == 'ArrowDown')that.playNext(that);
            else if(e.code == 'ArrowLeft'){
                var Song = this.document.getElementById("audio");
                Song.currentTime-=Math.min(Song.currentTime,10);
            }else if(e.code == 'ArrowRight'){
                var Song = this.document.getElementById("audio");
                Song.currentTime+=10;
            }
        }, false);

        //initialize the background setting
        document.getElementById('bg_dark').addEventListener('click', function() {
            document.getElementsByTagName('html')[0].className = 'colorBg';
        });
        document.getElementById('bg_pic').addEventListener('click', function() {
            document.getElementsByTagName('html')[0].className = 'imageBg';
        });
        //initially start from a random song
        for (var i = allSongs.length - 1; i >= 0; i--) {
            allSongs[i].className = '';
        };
        currentSong.className = 'current-song';
        
        //sync the lyric
        this.audio.addEventListener("timeupdate", function(e) {
            try{
                if(!that.lyric)return;
                for (var i = 0, l = that.lyric.length; i <= l; i++) {
                    //preload the lyric by 0.50s || end
                    if (i == l || this.currentTime <= that.lyric[i][0] - 0.50){
                        if(i > 0) i--;

                        // console.log("find at " + i);

                        if(i > 1 && that.lyric[i][0] == that.lyric[i-1][0]){
                            i = i-1;
                        }

                        var line = document.getElementById('line-' + i);
                        //randomize the color of the current line of the lyric
                        line.className = 'current-line-' + that.lyricStyle;

                        if(i!=that.last){
                            that.last=i;
                            document.getElementById("lyricWrapper").scrollTop = line.offsetTop;
                        }

                        //for the lyric to MediaSession
                        var lyric_for_API,text_translate=null;
                        lyric_for_API = that.lyric[i][1];
                        if(i+1 < l && that.lyric[i][0] == that.lyric[i+1][0])text_translate = that.lyric[i+1][1];
                        if(lyric_for_API.length == 0)lyric_for_API = " ";

                        //sync MediaSession API
                        mediaSessionAPI(that,sessionStorage.getItem("audio_name"),lyric_for_API);

                        // sync pipWindow
                        if(pipWindowIsOpened){
                            pipWindowFill(lyric_for_API,text_translate);
                        }

                        //del the color of which lyric after this.
                        for(var j = i + 1 ; j<l ; j++){
                            var line = document.getElementById('line-' + j);
                            line.className='';
                        }
                        
                        break;
                    }else{
                        try{
                            var line = document.getElementById('line-' + i);
                            line.className = '';
                        }catch{
                            console.log("error on #" + i);
                        }
                    }
                }
            }catch(error){
                console.log("ERROR:" + error);
            }
        });

        this.play(randomSong);
    },
    initialList: function(ctx) {
        var that = this;

        var xhttp = new XMLHttpRequest();
        xhttp.open('GET', 'json/content.json', false);
        xhttp.onreadystatechange = function() {
            if (xhttp.status == 200 && xhttp.readyState == 4) {
                var fragment = document.createDocumentFragment(),
                    data = JSON.parse(xhttp.responseText).data,
                    ol = ctx.playlist.getElementsByTagName('ol')[0],
                    fragment = document.createDocumentFragment();

                data.forEach(function(v, i, a) {
                    var li = document.createElement('li'),
                        a = document.createElement('a');
                    a.href = 'javascript:void(0)';
                    a.dataset.name = v.lrc_name;
                    a.textContent = v.song_name + ' - ' + v.artist;
                    that.audio_name[v.lrc_name] = v.song_name;
                    that.audio_artist[v.lrc_name] = v.artist;
                    that.audio_album[v.lrc_name] = v.album;
                    that.audio_duration[v.lrc_name] = v.duration;
                    li.appendChild(a);
                    li.id = "playlist-" + i;
                    fragment.appendChild(li);
                });
                ol.appendChild(fragment);
            }
        };
        xhttp.send();
    },
    play: function(songName,tool = -1) {
        console.log("PLAYER.play(" + songName + (tool != -1 ? ',' + tool : '')  + ');');
        var that = this;

        this.lyricContainer.textContent = 'loading song...';
        this.audio.src = './music/' + songName + '.mp3';
        this.audio.currentTime = 0;

        //first play,second load lyric
        //set this.audio.curremtTime will make canplay,so add this once when play.
        this.audio.addEventListener('canplay', function() {
            that.audio.play();
            that.getLyric(that.audio.src.replace('.mp3', '.lrc'));
        },{
            once: true
        });

        this.audio.play();

        if(tool !=-1){
            this.play(tool);
            return;
        }

        //scroll to which is playing
        var playlist_ol = document.getElementById("playlist_ol");
        var now = document.getElementById("playlist-" + PLAYER.currentIndex);
        var playlist_height = playlist.style.height.split('px')[0];
        playlist_ol.scrollTop = Math.max(0,now.offsetTop - Math.floor(parseInt(playlist_height)/2));

        songinfo_audio.textContent = this.playlist.getElementsByTagName("li")[songName-1].textContent;
        document.title = songinfo_audio.textContent + " | XPlayer";

        document.getElementById("cover_img").src = "./music/" + songName + '.webp';

        document.getElementById('songinfo_name').textContent = this.audio_name[songName];
        document.getElementById('songinfo_artist').textContent = "歌手: " + this.audio_artist[songName];
        document.getElementById('songinfo_album').textContent = "专辑: " + this.audio_album[songName];
        this.duration = this.audio_duration[songName];

        sessionStorage.setItem("audio_name",this.audio_name[songName]);
        mediaSessionAPI(this,sessionStorage.getItem("audio_name"),' ');

        var screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        this.lyricContainer.style.top = Math.floor((screenHeight-100)*0.4);
        //empty the lyric
        this.lyric = null;
        this.lyricStyle = Math.floor(Math.random() * 4);
    },
    getLyric: function(url) {
        var that = this,
            request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'text';
        //fix for the messy code problem for Chinese.  reference: http://xx.time8.org/php/20101218/ajax-xmlhttprequest.html
        //request['overrideMimeType'] && request.overrideMimeType("text/html;charset=gb2312");
        request.onload = function() {
            that.lyric = that.parseLyric(request.response);
            //display lyric to the page
            that.appendLyric(that.lyric);
        };
        request.onerror = request.onabort = function(e) {
            that.lyricContainer.textContent = '歌词加载失败,请检查网络或清空缓存并重试';
        }
        this.lyricContainer.textContent = 'loading lyric...';
        request.send();
    },
    parseLyric: function(text) {
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
                result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]) + parseInt(offset) / 1000, value]);
            });
        });
        //sort the result by time
        result.sort(function(a, b) {
            return a[0] - b[0];
        });
        return result;
    },
    appendLyric: function(lyric) {
        var lyricContainer = this.lyricContainer,
            fragment = document.createDocumentFragment();
        //clear the lyric container first
        this.lyricContainer.innerHTML = '';
        var that = this;
        lyric.forEach(function(v, i, a) {
            var line_p = document.createElement('p');
            var line = document.createElement('span');
            line.id = 'line-' + i;
            line.textContent = v[1];
            line.style.backgroundClip = "text";
            if(lyric.length > 1){
                line.addEventListener("click", function(){
                    that.audio.currentTime = v[0];
                    document.getElementById("lyricWrapper").scrollTop = line.offsetTop;
                });
            }
            line_p.appendChild(line);
            fragment.appendChild(line_p);
        });
        lyricContainer.appendChild(fragment);
    },
    ending: function(that) {

        this.audio.currentTime = 0;

        if(pipWindowIsOpened){
            pipWindowFill(" ",null);
        }

        //order,reverse,random,loop.
        var player_mode = "order";
        if(localStorage.getItem("player_mode")!=null)player_mode=localStorage.getItem("player_mode");
        else localStorage.setItem("player_mode",player_mode);
        switch(player_mode){
            case "order":
                that.playNext(that);
                break;
            case "reverse":
                that.playPrev(that);
                break;
            case "random":
                that.playRandom(that);
                break;
            case "loop":
                that.playAgain(that);
                break;
        }
    },
    all_played: function(that){
        var allSongs = that.playlist.children[0].children;
        for(var i = 0 ; i<allSongs.length ; i++ ){
            if(allSongs[i].className != 'current-song-played' && allSongs[i].className != 'current-song'){
                return false;
            }
        }
        return true;
    },
    playNum: function(that,index){
        var allSongs = this.playlist.children[0].children;
        var tmp = that.currentIndex;
        that.currentIndex = index;
        that.setClass(tmp,that.currentIndex);
        var Item = allSongs[that.currentIndex].children[0];
        var songName = Item.getAttribute('data-name');
        window.location.hash = songName;
        that.play(songName);
    },
    playRandom: function(that){
        var allSongs = this.playlist.children[0].children,
            randomItem;
        var tmp = that.currentIndex;
        var flag = that.all_played(that);
        if(flag){
            for(var i = 0 ; i < allSongs.length ; i++)allSongs[i].className = '';
        }
        do{
            that.currentIndex = Math.floor(Math.random() * this.playlist.children[0].children.length);
        } while(allSongs[that.currentIndex].className == 'current-song-played' || allSongs[that.currentIndex].className == 'current-song');
        randomItem = allSongs[that.currentIndex].children[0];
        that.setClass((flag ? -1 : tmp),that.currentIndex);
        var songName = randomItem.getAttribute('data-name');
        window.location.hash = songName;
        that.play(songName);
    },
    playAgain: function(that) {
        that.play(window.location.hash.substring(1));
    },
    playNext: function(that) {
        var allSongs = this.playlist.children[0].children,
            nextItem;
        var tmp = that.currentIndex;
        //reaches the last song of the playlist?
        if (that.currentIndex === allSongs.length - 1) {
            //play from start
            that.currentIndex = 0;
        } else {
            //play next index
            that.currentIndex += 1;
        };
        nextItem = allSongs[that.currentIndex].children[0];
        that.setClass(tmp,that.currentIndex);
        var songName = nextItem.getAttribute('data-name');
        window.location.hash = songName;
        that.play(songName);
    },
    playPrev: function(that) {
        var allSongs = this.playlist.children[0].children,
            prevItem;
        var tmp = that.currentIndex;
            //reaches the first song of the playlist?
        if (that.currentIndex === 0) {
            //play from end
            that.currentIndex = allSongs.length - 1;
        } else {
            //play prev index
            that.currentIndex -= 1;
        };
        prevItem = allSongs[that.currentIndex].children[0];
        that.setClass(tmp,that.currentIndex);
        var songName = prevItem.getAttribute('data-name');
        window.location.hash = songName;
        that.play(songName);
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
            // alert("offset error: "+err.message);
            offset = 0;
        }return offset;
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