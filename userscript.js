// ==UserScript==
// @name        TinyScript
// @version     0.0.1
// @description A TinyChat Launcher improving moderation, enabling bots, and sharing themes in a compact userscript.
// @author      thebanon
// @license     Copyright (C) thebanon
// @icon        https://i.imgur.com/_______.png
// @match       https://tinychat.com/room/*
// @match       https://tinychat.com/*
// @exclude     https://tinychat.com/settings/*a
// @exclude     https://tinychat.com/subscription/*
// @exclude     https://tinychat.com/promote/*
// @exclude     https://tinychat.com/coins/*
// @exclude     https://tinychat.com/gifts*
// @grant       none
// @run-at      document-start
// @namespace https://greasyfork.org/users/______
// ==/UserScript==

(function() {
    "use strict";

    //WSS
    window.WSS = {};

    window.WSS.con = {};
    window.WSS.con.open = () => {
        if (window.Proxy === undefined) return;
        var handler = {
            set: function(Target, prop, value) {
                if (prop == "onmessage") {
                    var oldMessage = value;
                    value = function(event) {
                        WSS.msg.recv(JSON.parse(event.data), Target);
                        oldMessage(event);
                    };
                }
                return (Target[prop] = value);
            },
            get: function(Target, prop) {
                var value = Target[prop];
                if (prop == "send") {
                    value = function(event) {
                        WSS.msg[prop](JSON.parse(event), Target);
                        Target.send(event);
                    };
                } else if (typeof value == 'function') {
                    value = value.bind(Target);
                }
                return value;
            }
        };
        var WebSocketProxy = new window.Proxy(window.WebSocket, {
            construct: function(Target, args) {
                APP.SocketTarget = new Target(args[0]);
                console.log("SOCKET::CONNECTING", args[0]);
                return new window.Proxy(APP.SocketTarget, handler);
            }
        });
        window.WebSocket = WebSocketProxy;
    }

    window.WSS.msg = {};
    window.WSS.msg.recv = function({
        tc
    }) {
        if (typeof API.server.recv[arguments[0].tc] == "function") {
            console.log(("SERVER::" + arguments[0].tc.toUpperCase()), arguments[0]);
            API.server.recv[arguments[0].tc](arguments[0]);
            addCSS();
        }
    }
    window.WSS.msg.send = function({
        tc
    }) {
        if (typeof API.server.send[arguments[0].tc] == "function") {
            console.log(("CLIENT::" + arguments[0].tc.toUpperCase()), arguments[0]);
            API.server.send[arguments[0].tc](arguments[0]);
            addCSS();
        }
    }
    window.WSS.msg.req = ({
        tc
    }) => {
        if (arguments[1] === undefined) arguments[1] = "Open Request";
        console.log(("CLIENT::SEND::" + arguments[0].toUpperCase()), arguments[1]);
    }

    //APP
    window.APP = {}

    window.APP.config = {}
    window.window.APP.config.Message = [
        []
    ]
    window.APP.config.version = {
        Major: 0,
        Minor: 0,
        Patch: 1
    }

    window.APP.view = {}
    window.APP.view.room = (params) => {
        console.log("TinyScript::APP.VIEW.ROOM", params);
        clearInterval(APP.ScriptLoading);
        APP.ScriptInit = true;
        console.log("TinyScript::APP.VIEW.ROOM", params);

        //ELEMENTS
        var obj = {}
        obj.body = document.body;
        obj.main = document.querySelector("tinychat-webrtc-app").shadowRoot;
        obj.title = obj.main.querySelector("tc-title").shadowRoot;
        obj.chatlog = obj.main.querySelector("tc-chatlog").shadowRoot;
        obj.textarea = obj.chatlog.querySelector("#textarea");
        obj.videolist = obj.main.querySelector("tc-videolist").shadowRoot;
        obj.videoitems = obj.videolist.querySelectorAll("tc-video-item");
        obj.sidemenu = obj.main.querySelector("tc-sidemenu").shadowRoot;
        obj.userlist = obj.sidemenu.querySelector("tc-userlist").shadowRoot;
        obj.moderationlist = obj.sidemenu.querySelector("tc-video-moderation").shadowRoot;
        obj.chatlist = obj.sidemenu.querySelector("tc-chatlist").shadowRoot;
        obj.usercontext = obj.userlist.querySelector("tc-user-contextmenu").shadowRoot;
        console.log("TinyScript::APP.VIEW.ROOM", { params, obj});
        window.DOM = obj;

        //STYLES
        window.APP.css = {};
        Object.keys(obj).forEach(function(name) {
            window.APP.css[name] = {
                element: obj[name],
                stylesheet: null
            }
        });
        console.log(125, "TinyScript::APP.VIEW.ROOM", {
            app: window.app
        });

        //INSERT
        document.body.querySelector("style").insertAdjacentHTML("beforeend", APP.css.main);
        Object.keys(obj).forEach(async function(name) {
            var fullname = "thebanon/tinyscript";
            var theme = null;
            var user = fullname.split("/")[0];
            var repo = fullname.split("/")[1];
            var paths = fullname.split("/").splice(2,fullname.split("/").length - 1);
            var dir = paths.length > 0 ? paths.join("/") : "";
            var host = "https://" + user + ".github.io";
            var path = "/" + repo + "/files/theme" + (theme ? "/" + theme : "");
            var file = "/" + name + ".css";
            try {
                var res = await request(host + path + file, {
                    cache: "reload"
                });
                console.log(151, { name, res, len: res.length });
                if(res.length > 0) {
                    console.log(152, { name, res, len: res.length });
                    if(name === "body") {
                        var style = document.createElement("style");
                        var backgroundColor = "#ffff69";
                        style.id = "style-body";
                        style.innerHTML = res;
                        document.body.removeAttribute("data-mode");
                        document.body.style.backgroundColor = backgroundColor;
                        var el = document.body.querySelector("#style-body");
                        el ? el.replaceWith(style) : document.body.insertAdjacentHTML('afterbegin', style.outerHTML);
                        var el = document.getElementById(style.id);
                        el.stylesheet = res;
                    } else if(name === "videoitems") {
                        console.log(154, { name, res, len: res.length, obj, vid: obj.videolist });
                    } else {
                        var style = document.createElement("style");
                        style.innerHTML = res;
                        var el = window.APP.css[name].element.querySelector("style");
                        el.insertAdjacentHTML("afterend", style.outerHTML);
                        el.stylesheet = res;
                    }
                }
            } catch(e) {
                console.log(151, { e });
            }
        });

        var obj = {
            main: document.querySelector("tinychat-webrtc-app").shadowRoot
        }
        var MainElement = obj.main;
        console.log(185, MainElement.querySelector("tc-chatlog").shadowRoot);
        new MutationObserver(function(elem) {
            MainElement.querySelector("#modal").shadowRoot.querySelector("#modal-window").classList.remove("modal-show");
            if (MainElement.querySelector("#fatal")) Remove(MainElement.querySelector("#fatal"));
            if(MainElement.querySelector("#modal").hasChildNodes()) MainElement.querySelector("#modal").shadowRoot.querySelector("#modal-window").classList.add("modal-show");
        }).observe(MainElement.querySelector("#modal"), {
            childList: true
        });
    }

    //BOT
    window.BOT = {};

    window.BOT.cmd = {}
    window.BOT.cmd.ver = () => {
        console.log("BOT.cmd.ver", window.Version);
    }

    window.BOT.sys = {}
    window.BOT.sys.prompt = function() {
        var UserCommand = arguments[0].match(/^!([a-z0-9]*)(?: ?)(.*)/i);
        if (UserCommand) {
            if (typeof BOT.cmd[UserCommand[1].toLowerCase()] == "function") {
                console.log("COMMAND::" + ((arguments[1]) ? "PM" : "MAIN"), UserCommand[1] + ":" + UserCommand[2]);
                BOT.cmd[UserCommand[1].toLowerCase()](UserCommand[2], arguments[1]);
            }
        }
    }

    //API
    window.API = {};

    window.API.queue = {};
    window.API.queue.add = function() {
        APP.SendQueue.push(arguments[0]);
        API.queue.run();
    };
    window.API.queue.run = function() {
        if (APP.SendQueue !== undefined && APP.SendQueue.length > 0) {
            setTimeout(function() {
                var temp = new Date();
                var OffsetTime = temp - APP.LastMessage;
                if (OffsetTime >= 1500) {
                    APP.LastMessage = new Date();
                    APP.SocketTarget.send(APP.SendQueue[0]);
                    APP.SendQueue.shift();
                }
                API.queue.run();
            }, 1600);
        }
    };

    window.API.server = {};
    window.API.server.recv = {
        joined: function() {
            APP.SocketConnected = true;
        },
        Users: function() {
            console.log(arguments[0]);
        },
        join: function() {
            console.log(arguments[0]);
            3
        },
        sysmsg: function() {
            console.log(arguments[0]);
        },
        nick: function() {
            console.log(arguments[0]);
        },
        stream_connected: async function() {
            console.log(232, 'stream_connected', arguments, arguments[0]);
            var id = arguments[0].handle;
            var fullname = "thebanon/tinyscript";
            var theme = null;
            var name = "videoitems";
            var user = fullname.split("/")[0];
            var repo = fullname.split("/")[1];
            var paths = fullname.split("/").splice(2,fullname.split("/").length - 1);
            var host = "https://" + user + ".github.io";
            var path = "/" + repo + "/files/theme" + (theme ? "/" + theme : "");
            var file = "/" + name + ".css";
            window.vcs ? null : window.vcs = await request(host + path + file, {
                cache: "reload"
            });
            var cams = window.DOM.videolist.querySelectorAll("tc-video-item");
            console.log(155, { DOM, cams, arr: Array.from(cams) });
            Array.from(cams).forEach(function(elem) {
                var cam = elem.shadowRoot;
                var vid = cam.querySelector("video[data-video-id='" + id + "']");
                console.log(157, {id, cam, vid, vcs});
                if(vid) {
                    var style = document.createElement("style");
                    style.innerHTML = window.vcs;
                    cam.querySelector('style:has( + :not(style))').insertAdjacentHTML("afterend", style.outerHTML);
                    //cam.querySelector('style:has( + :not(style))').previousElementSibling.remove();
                    window.APP.css[name].stylesheet = window.vcs;
                }
            });
        },
        stream_closed: function() {
            console.log(arguments[0]);
        },
        publish: function() {
            console.log(arguments[0]);
        },
        unpublish: function() {
            console.log(arguments[0]);
        },
        ping: function() {
            window.TinychatApp.getInstance().defaultChatroom._chatlog.items = [];
            window.TinychatApp.getInstance().defaultChatroom.packetWorker.queue = {};
        },
        quit: function() {
            console.log(arguments[0]);
        },
        msg: async function() {
            console.log(arguments[0])
        },
        pvtmsg: function() {
            console.log(arguments[0]);
        },
        gift: function() {
            console.log(arguments[0]);
        },
    };
    window.API.server.send = {
        pvtmsg: function() {
            console.log(arguments[0]);
        },
        msg: async function() {
            if (APP.ScriptInit) {
                console.log(arguments[0])
            }
        },
        ban: function() {
            console.log(arguments[0]);
        },
        kick: function() {
            console.log(arguments[0]);
        },
        stream_moder_close: function() {
            console.log(arguments[0]);
        }
    };

    //INIT
    Init();
    async function Init() {
        console.log(280, "window.init");
        var err_out = 0;
        APP.ScriptLoading = setInterval(function() {
            err_out++;
            var twa = document.querySelector("tinychat-webrtc-app");
            if (twa) {
                if (twa.shadowRoot) {
                    APP.view.room()
                }
            } else {
                err_out++;
            }
            if (err_out == 50) {
                clearInterval(APP.ScriptLoading);
                clearInterval(APP.FullLoad);
            }
        }, 200);

        if (!document.URL.match(/^https:\/\/tinychat\.com\/(?:$|#)/i)) {
            console.log("WSS.hook", document.URL);
            new MutationObserver(function() {
                this.disconnect();
                WSS.con.open();
            }).observe(document, {
                subtree: true,
                childList: true
            });
        }

        APP.FullLoad = setInterval(function() {
            if (APP.ScriptInit && APP.SocketConnected) {
                clearInterval(APP.FullLoad);
            }
        }, 500);
    }

    async function addCSS() {
        console.log(403, 'addCSS');
        var obj = {
            main: document.querySelector("tinychat-webrtc-app").shadowRoot
        }
        var MainElement = obj.main;
        var fullname = "thebanon/tinyscript";
        var theme = null;
        var elem = MainElement.querySelector("tc-chatlog").shadowRoot;
        var name = "messages";
        var user = fullname.split("/")[0];
        var repo = fullname.split("/")[1];
        var paths = fullname.split("/").splice(2,fullname.split("/").length - 1);
        var host = "https://" + user + ".github.io";
        var path = "/" + repo + "/files/theme" + (theme ? "/" + theme : "");
        var file = "/" + name + ".css";
        var href = host + path + file;
        window.scvs ? null : window.scvs = await request(href, {
            cache: "reload"
        });
        var style = document.createElement("style");
        style.innerHTML = window.scvs;
        console.log(290, "recv.msg.0", {elem, href, scvs, l, arguments}, window.DOM);
        var l = elem.lastElementChild;
        console.log(290, "recv.msg.1", {elem, href, scvs, l, arguments}, window.DOM);
        var m = l.querySelector("tc-message-html");
        console.log(290, "recv.msg.2", { scvs, l, m, html: l.querySelectorAll("tc-message-html"), arguments: arguments[0]} );
        //var els = m[m.length - 1];//.shadowRoot.querySelector("style");
        Array.from(l.querySelectorAll("tc-message-html")).forEach(function(d) {
            var e = d.shadowRoot;
            console.log(290, "recv.msg 3", { scvs, e, m, arguments: arguments[0]} );
            if (e) {
                e.lastElementChild.insertAdjacentHTML("afterend", style.outerHTML);
                e.host.stylesheet = scvs;
                e.host.setAttribute('loaded', true);
            }
        });
    }

    //FETCH
    async function request(resource, options) {
        return new Promise(async function(resolve, reject) {
            await fetch(resource, options).then(async (response) => {
                //console.log(response);
                if (!response.ok) {
                    return response.text().then(text => {
                        var text = JSON.stringify({
                            code: response.status,
                            message: JSON.parse(text)
                        });
                        throw new Error(text);
                    })
                }
                return response.text();
            }).then(response => {
                try {
                    //console.log(39, response);
                    response = JSON.parse(response);
                    console.log(41, 'fetch.request', {
                        response,
                        url
                    });
                    resolve(response);
                } catch (err) {
                    resolve(response);
                }
            }).catch(error => {
                console.log("function_get 404 ERROR", error);
                reject(error);
            })
        });
    }
})();