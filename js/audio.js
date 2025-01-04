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
        console.log("the duration is:" + duration);
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
        audioPlayer.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAGIElEQVR4Xu1bTVYiSRD+orrU2Q1wgdH3GrajJ5A+wegJxKWwEE/QeoLGBbgUT9DcoPEE4hZ8T/oCUL0bbLpiXtafWQVFZf3oVIvstKoyM778IiMyfggv/Ct8eSxgY76vfcAuM3YBFADeJtC2PDWDxwCNARhEGJi/MMBP/dY42zFecon0EoMX2sNdjeiImatEJIRO/GPmARH1TeYbo1EZJB4o5MPMALB2evPnEQE1FaGZ8R0EseMAY5sIf0UJJ8BgoIunjZusmJEaACG49sf8lE00iQS9/T8G3xNrfZPQB7FhnJT7qwQtXI2qYCpojCqTWSXQ3wtjMgzS0DL/1S/TApEKgELn4YCYr4OCC6EZ1MVM76ZdoMWsrXmNwLUgGMwwmOjYqH/sRbEn7HkiAApXj9vE82sCqoH9vjGJulG7nHSxgh1kM+0f/wGKPpN+bJzs2CoV4xcbgGW7zsAtk15LsoAYa/VedTagS8C++8+kbIgFQKkz+gKg6U0K/GBQLQ0FkwDgfmNtBlgA8ac3DuF8clK+UB1XGYBSe3gNopok/C3P9IO0Oq660LD3xBlBW/OezAYwdyeNyrHK2EoABIUH42LSKJ+rTPBa75Tao3MQPnvzKYIQCUBQeJP52GhUuq8lWJx5Cu1hTSO6jgPCSgBK7YcWiE/dAfMsvHcuLICwmq2hAIgDRgN//Z2EDwPBBB2GHdRLAbDMjDm/8xycHOp8lGrIZ4JlIjV9b5mZXgpAsTP65jo5wsZP6+WAwxM1fT6eFzujvmsdGOhP6+VPwZUtACBTn4Wdn+nb/7epSwqnYyLHrp+wTBV8AFgfbM4fXeqv0h2VRXleI7inapfdccUBzOAjBp+lsTq+DRWq8KTvyBvqA8CnNxlQX6ZgXAtS6ozYO4BJ30njZsvrCPowHgALu59yUrH4VRNHMcgPAD6luWCJQ13j+aOY0zoQJRY8A9AZNTVA+PritZtJveK5vVGLDXueFwCszWiPeu4t0gTOjHq5Jf7vAVBsD+/cSI5J6RB3AckTAOIqrTG+2SzgwbRR2fMAcGJ4d9ZD8P20XkkVx8sjALZKDgduUMVk3hMxRosBsssr0yMp9fMKQEFWc6bLSeNj0wLAR/+ZXszK7udJBYScVvxyaz6V1YB8/8yQ/nmyAjKTfWow04vku/Q4tEhL/byqwKK60yHJzk9azy8IXN5UwFID+ZbLuCCffXROxrfMANkcCn+H5F2a1MuREaI44OSRAZYaOG62uOlSsTN8dBOVaweAyDs+o5GdA5TnQ9Bxi8duLlICIPvAR15VQF7XOwCSCoyn9cpOnEMu6t38MuD53BNm0NOH9TsE8f3dDK69I7T2rvDaX4aW3ZGjTnfV53m0AsHYhx0QkUNF6xIQcWIf7yEx645sFzbaQVEpYqpK9bD38qYCPvrLQdEFNXjrYXEp9Lc+iREp4y2n6fypsa35cyb1rabGAhnvVcnRpfn0OOdCdsnRdJkqud4hNDnqxs1JZsGK0hIVIETREhGJHNwgbkmdC56oUZjWyws1yCrzOwe8VzglCrT5Sd8NTY8Ho6bBTKrqpFm8Z9cI/6pi9qGfNFGjUu8QViITWVqShZAvPYZKqU94kRTPReLQLkH93YukVpT6rEeZ3Aq/JqJQ0l9+GrfM5aUpvmz8xWrRhIWS7uClzrAL0JH7d55BWBBeodJFKRMUBAExS9Jfgwmlq9FnMKQCbrUyHyUA7HSSnwmi8JBn+mFSE5UVKE4t4Fd/94qa8GINygBYIASKp5N2aWQmfOfhiJhbvp6lmBYrFgCuoxTs0rDYkLBnJwkYy3qWrKpWwkHccrrYAFgg2E1Tvp4d211AjwmXcRehCoLVNMU4JeBA/sbqWUrYvZIIAHfypT07TlAlqwbHVQ2Zlm9P1EzTs5QKAPcCpW3Om0wQFVfPzUsOSl7rq4k+NBhGvXy7ascLndE+TBQ0DdWw1ltBd2K0zCe9lfYQTg2Ax4YVDY7LBJaapQVnFpqpQ765Z0YLTxu9tIK742cGgLxgK8YIrRbW+qqq8/a54rTewuzmunk6TCj3Wqsx74J4m0Xb/JJmabeZmkQbPdPYJBqkuQqrgvwfM2Rh0GDjA2cAAAAASUVORK5CYII=';
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
            sessionStorage.setItem("flag_canplay","false");
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
            sessionStorage.setItem("flag_canplay","false");
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
 * 格式化时间显示，补零对齐
 * eg：2:4  -->  02:04
 * @param {string} value - 形如 h:m:s 的字符串 
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