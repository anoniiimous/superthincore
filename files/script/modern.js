var headerUser = document.getElementById("header-user");
headerUser.classList.add('header-button');
var media = `<div class="header-button header-media" id="header-media">
    <div id="user" class="user-icon" onclick="toogleUser()">
        <img class="switcher" src="https://avatars.tinychat.com/bc/a6a5ff/50/small/php9AHzSO.jpeg?v=1">
    </div>
</div>`;
var config = `<div class="header-button header-config" id="header-config">
    <div id="user" class="user-icon" onclick="toogleUser()">
        <img class="switcher" src="https://avatars.tinychat.com/bc/a6a5ff/50/small/php9AHzSO.jpeg?v=1">
    </div>
</div>`;
var html = media + config;
headerUser.insertAdjacentHTML("beforebegin", html);