window.github = {};

window.github.config = {};
window.github.config.endpoint = "https://api.github.com";

window.github.oauth = {};
window.github.oauth.login = ()=>{
    var redirect_uri = window.location.protocol + "//" + window.location.host + window.location.pathname;
    console.log(6, {
        redirect_uri
    });
    var provider = new firebase.auth.GithubAuthProvider();
    provider.addScope('delete_repo');
    provider.addScope('gist');
    provider.addScope('public_repo');
    provider.addScope('repo');
    provider.addScope('user');
    provider.setCustomParameters({
        'redirect_uri': redirect_uri
    });
    firebase.auth().signInWithPopup(provider).then((result)=>{
        var credential = result.credential;
        var token = credential.accessToken;
        var user = result.user;
        var uid = user.uid;
        console.log(25, {
            result,
            user
        });
        document.body.setAttribute('uid', uid)
        localStorage.setItem('githubAccessToken', token);
        localStorage.setItem('user', result.additionalUserInfo.username);
    }
    ).catch((error)=>{
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log({
            error
        });
    }
    );
}
window.github.oauth.sign_out = async()=>{
    firebase.auth().signOut();
    document.body.removeAttribute('uid');
    localStorage.removeItem('githubAccessToken');
    localStorage.removeItem('user');
}
window.github.oauth.user = async(target)=>{
    if (localStorage.user) {
        try {
            var user = await github.users.user(localStorage.user)
        } catch (e) {
            console.log(e);
            var user = null;
        }
    } else {
        var user = null;
    }
    console.log(44, user)
    return user
}

github.raw = {};
github.raw.blob = async(params,settings)=>{
    settings ? null : settings = {};
    return new Promise((resolve,reject)=>{
        fetch("https://api.github.com/repos/" + params.owner + "/" + params.repo + "/contents" + params.resource, {
            cache: "reload",
            headers: {
                Accept: "application/vnd.github.raw",
                Authorization: "token " + localStorage.githubAccessToken
            }
        }).then(async(response)=>{
            if (response.status === 404) {
                var res = await response.json();
                var json = {
                    json: res,
                    error: new Error(response.status)
                }
                throw json;
            } else {
                return response.blob()
            }
        }
        ).then((blob)=>{
            resolve(URL.createObjectURL(blob));
        }
        ).catch((e)=>{
            reject(e.json)
        }
        );
    }
    );
}
github.raw.file = async(params)=>{
    var url = "https://api.github.com/repos/" + params.owner + "/" + params.repo + "/contents/" + params.resource;
    var settings = {
        cache: "no-store",
        headers: {
            'If-None-Match': ''
        }
    };
    const accessToken = localStorage.githubAccessToken;
    if (accessToken) {
        settings.headers.Accept = "application/vnd.github.raw",
        settings.headers.Authorization = "token " + accessToken
    }
    //console.log(url, settings);
    return new Promise((resolve,reject)=>{
        fetch(url, settings).then(async(response)=>{
            if (response.status === 404) {
                var res = await response.json();
                var json = {
                    json: res,
                    error: new Error(response.status)
                }
                throw json;
            } else {
                return response.text()
            }
        }
        ).then((response)=>{
            resolve(response);
        }
        ).catch((e)=>{
            reject(e.json)
        }
        );
    }
    );
}

window.github.repos = {};
window.github.repos.contents = async(params,settings)=>{
    settings ? null : settings = {};
    return new Promise(function(resolve, reject) {
        const url = github.config.endpoint + "/repos/" + params.owner + "/" + params.repo + "/contents/" + params.resource;
        const a = data=>{
            resolve(data);
        }
        const b = (error)=>{
            console.log(error);
            reject(error);
        }
        const accessToken = localStorage.githubAccessToken;
        accessToken ? settings.headers = {
            Accept: "application/vnd.github+json",
            Authorization: "token " + accessToken
        } : null;
        if (settings) {
            if (settings.headers) {
                settings.headers['If-None-Match'] = "";
            } else {
                settings.headers = {
                    'If-None-Match': ''
                };
            }
        } else {
            settings = {
                headers: {
                    'If-None-Match': ''
                }
            };
        }
        console.log(94, 'github.repos.contents', {
            url,
            settings
        });
        request(url, settings).then(a).catch(b);
    }
    );
}

window.github.user = {};
window.github.user.repos = (params,settings)=>{
    settings ? null : settings = {};
    return new Promise(function(resolve, reject) {
        const url = github.config.endpoint + "/user/repos";
        const a = data=>{
            resolve(data);
        }
        const b = (error)=>{
            console.log(error);
            reject(error);
        }
        const accessToken = localStorage.githubAccessToken;
        accessToken ? settings.headers = {
            Accept: "application/vnd.github+json",
            Authorization: "token " + accessToken
        } : null;
        if (settings) {
            if (settings.headers) {
                settings.headers['If-None-Match'] = "";
            } else {
                settings.headers = {
                    'If-None-Match': ''
                };
            }
        } else {
            settings = {
                headers: {
                    'If-None-Match': ''
                }
            };
        }
        console.log(209, 'github.user.repos', {
            url,
            settings
        });
        request(url, settings).then(a).catch(b);
    }
    );
}
window.github.user.user = (params,settings)=>{
    settings ? null : settings = {};
    return new Promise(function(resolve, reject) {
        const url = github.config.endpoint + "/user";
        const a = data=>{
            resolve(data);
        }
        const b = (error)=>{
            console.log(error);
            reject(error);
        }
        const accessToken = localStorage.githubAccessToken;
        accessToken ? settings.headers = {
            Accept: "application/vnd.github+json",
            Authorization: "token " + accessToken
        } : null;
        if (settings) {
            if (settings.headers) {
                settings.headers['If-None-Match'] = "";
            } else {
                settings.headers = {
                    'If-None-Match': ''
                };
            }
        } else {
            settings = {
                headers: {
                    'If-None-Match': ''
                }
            };
        }
        console.log(209, 'github.user.repos', {
            url,
            settings
        });
        request(url, settings).then(a).catch(b);
    }
    );
}

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