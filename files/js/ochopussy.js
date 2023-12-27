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

window.github.repos = {};
window.github.repos.contents = async(params,settings)=>{
    settings ? null : settings = {};
    return new Promise(function(resolve, reject) {
        const url = github.endpoint + "/repos/" + params.owner + "/" + params.repo + "/contents" + params.resource;
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
