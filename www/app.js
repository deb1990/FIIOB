function getJsonObjectsByContainsValue(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object' && !obj.render) {
            objects = objects.concat(getJsonObjectsByContainsValue(obj[i], key, val));
        } else if (i == key && obj[key].toLowerCase().indexOf(val.toLowerCase()) != -1) {
            objects.push(obj);
        }
    }
    return objects;
}

//window.fbAsyncInit = function () {
//    FB.init({
//        appId: '1391905344393231',
//        status: true,
//        cookie: true,
//        xfbml: true
//    });
//};
////    Load the SDK asynchronously
//(function (d) {
//    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
//    if (d.getElementById(id)) {
//        return;
//    }
//    js = d.createElement('script');
//    js.id = id;
//    js.async = true;
//    js.src = "http://connect.facebook.net/en_US/all.js";
//    ref.parentNode.insertBefore(js, ref);
//}(document));


var memberShip = {
    isMember: false,
    groupID: '146194088779617',
    nextPage: 'https://graph.facebook.com/146194088779617/feed',
    initialPage: 'https://graph.facebook.com/146194088779617/feed'
};
function replaceURLWithHTMLLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, "<a style='color:#ccc' target='_blank' href='$1'>$1</a>");
}
function like(me){
    if(document.getElementById(me.getAttribute('postid')+'_like').className == 'disableIcon1'){
        (function (id) {
            FB.api("/"+id+"/likes", 'post',function(response) {
                if(response === true) {
                    document.getElementById(id+'_like').className = 'icon1';
                }
            });
        })(me.getAttribute('postid'));
    }

}
var commentID;
function commentOpen(){
    document.getElementById('commentBox').style.display='block';
    document.getElementById('fade').style.display='block'
    document.getElementById('postNewComment').value ="";
    commentID = this.getAttribute('postid');
    loadComment();

}

function loadComment() {
    document.getElementById('thelistCom').innerHTML = "";

    FB.api("https://graph.facebook.com/"+commentID+"/comments?limit=1000", function (data) {
        var commentData = data.data;
        var postByPic;
        for (var i = commentData.length-1; i > -1; i--) {
            var date = new Date(commentData[i].created_time);
            var days = Math.floor(Math.abs(new Date() - date) / (1000 * 3600 * 24))
            if (days > 0)
                date = ',&nbsp;&nbsp;'+days + ' days ago&nbsp;&nbsp;';
            else {
                var hours = Math.floor(Math.abs(new Date() - date) / (1000 * 3600))
                if (hours > 0)
                    date = ',&nbsp;&nbsp;'+hours + ' hours ago&nbsp;&nbsp;';
                else {
                    var mins = Math.floor(Math.abs(new Date() - date) / (1000 * 60))
                    date = ',&nbsp;&nbsp;'+mins + ' mins ago&nbsp;&nbsp;';
                }
            }
            (function (post) {
                FB.api("/" + post.from.id, {fields: "id,name,picture"}, function (image) {
                    postByPic = image.picture.data.url;
                    document.getElementById(post.id + '_postByPic').src = postByPic;
                    commentScroll.refresh();
                });

            })(commentData[i]);

            var likeStatus;
            if (commentData[i].user_likes) {
                likeStatus = "<div onclick='like(this)' id='" + commentData[i].id + "_like' postid='" + commentData[i].id + "' class='icon1'><i class='fa fa-heart'></i>&nbsp;"+commentData[i].like_count+"</div><br>";
            }
            else {
                likeStatus = "<div onclick='like(this)' id='" + commentData[i].id + "_like' postid='" + commentData[i].id + "' class='disableIcon1'><i class='fa fa-heart'></i>&nbsp;"+commentData[i].like_count+"</div><br>";
            }



            var message = '';
            if (commentData[i].message) {
                message = replaceURLWithHTMLLinks(commentData[i].message)
            }

            $('#thelistCom').append(
                "<li><table class='feed'>" +
                    "<tr>" +
                    "<td align='top' style='width:35px;padding: 0 6px 0 0;vertical-align:top;'><img class='postByPic' id='" + commentData[i].id + "_postByPic'></td>" +
                    "<td style='vertical-align:top;'>" +
                    "<div class='userName'>" + commentData[i].from.name + "</div>" +
                    "<div class='postTime'>" + date + "</div>" +
                    "<div class='iconBox'>" +
                    likeStatus +
                    "<div style='width: 100%'></div>" +
                    "<div class='message'>" + message + "</div>" +
                    "</td>" +
                    "</tr>" +
                    "</table></li>");
        }
    });
}


function loadData(mode) {
    var loadUrl = memberShip.nextPage;
    if (mode == 'refresh') {
        loadUrl = memberShip.initialPage;
        document.getElementById('thelist').innerHTML = "";
    }

    FB.api(loadUrl, function (data) {
        var feedData = data.data;
        memberShip.nextPage = data.paging.next;


        var postByPic;
        for (var i = 0; i < feedData.length; i++) {
            var date = new Date(feedData[i].created_time);
            var days = Math.floor(Math.abs(new Date() - date) / (1000 * 3600 * 24))
            if (days > 0)
                date = ',&nbsp;&nbsp;'+days + ' days ago&nbsp;&nbsp;';
            else {
                var hours = Math.floor(Math.abs(new Date() - date) / (1000 * 3600))
                if (hours > 0)
                    date = ',&nbsp;&nbsp;'+hours + ' hours ago&nbsp;&nbsp;';
                else {
                    var mins = Math.floor(Math.abs(new Date() - date) / (1000 * 60))
                    date = ',&nbsp;&nbsp;'+mins + ' mins ago&nbsp;&nbsp;';
                }
            }
            (function (post) {
                FB.api(post.object_id + '', function (comments) {
                    if (comments || !comments.error) {
                        try {
                            if (comments.images) {
                                if (comments.images[3].source) {
                                    document.getElementById(post.id + '_msgPic').src = comments.images[3].source;
                                }
                                else
                                {
                                    document.getElementById(post.id + '_msgPic').style.display = 'none';
                                }
                            }
                            else
                            {
                                document.getElementById(post.id + '_msgPic').style.display = 'none';
                            }
                            myScroll.refresh();
                        }
                        catch (e) {
                            document.getElementById(post.id + '_msgPic').style.display = 'none';
                            myScroll.refresh();
                        }

                    }
                });
                FB.api(post.id + "/comments?filter=toplevel&limit=1000", function (comments) {
                    if (comments || !comments.error) {
                        document.getElementById(post.id + '_comment').innerHTML = "<i class='fa fa-comment'></i>&nbsp;"+comments.data.length;
                        document.getElementById(post.id + '_comment').onclick = commentOpen;
                    }
                });

                FB.api(post.id + "/likes?limit=1000", function (likes) {
                    if (likes || !likes.error) {
                        document.getElementById(post.id + '_like').innerHTML = "<i class='fa fa-heart'></i>&nbsp;"+likes.data.length;
//                        document.getElementById(post.id + '_like').onclick = like;
                        if (getJsonObjectsByContainsValue(likes, 'id', memberShip.userID).length > 0) {
                            document.getElementById(post.id + '_like').className='icon1';
                        }
                    }
                });
                FB.api("/" + post.from.id, {fields: "id,name,picture"}, function (image) {
                    postByPic = image.picture.data.url;
                    document.getElementById(post.id + '_postByPic').src = postByPic;
                    myScroll.refresh();
                });

            })(feedData[i]);

            var message = '';
            if (feedData[i].message) {
                message = replaceURLWithHTMLLinks(feedData[i].message)
            }

            $('#thelist').append(
                "<li><table class='feed'>" +
                    "<tr>" +
                    "<td align='top' style='width:35px;padding: 0 6px 0 0;vertical-align:top;'><img class='postByPic' id='" + feedData[i].id + "_postByPic'></td>" +
                    "<td style='vertical-align:top;'>" +
                        "<div class='userName'>" + feedData[i].from.name + "</div>" +
                        "<div class='postTime'>" + date + "</div><br>" +
                        "<div class='iconBox'>" +
                        "<div onclick='like(this)' id='" + feedData[i].id + "_like' postid='" + feedData[i].id + "' class='disableIcon1'><i class='fa fa-heart'></i></div>" +
                        "<div id='" + feedData[i].id + "_comment' postid='" + feedData[i].id + "' class='icon2'><i class='fa fa-comment'></i></div></div><br>" +
                        "<div style='width: 100%'><img class='msgPic' id='" + feedData[i].id + "_msgPic'></div>" +
                        "<div class='message'>" + message + "</div>" +
                    "</td>" +
                    "</tr>" +
                    "</table></li>");
        }
    });
}
function login() {
    try{
    FB.login(function (response) {
            if (response.authResponse) {
                alert(response);
                access_token = response.authResponse.accessToken;
                user_id = response.authResponse.userID;
                memberShip.userID=response.authResponse.userID;
                FB.api(
                    "/me/groups",
                    function (response) {
                        try{
                        if (response && !response.error) {
                            var groups = response.data;
                            for (var i = 0; i < groups.length; i++) {
                                if (groups[i].id == memberShip.groupID) {
                                    memberShip.isMember = true;
                                    break;
                                }
                            }
                            if (memberShip.isMember == true) {
                                FB.api('/me', function (user) {
                                    if (user || !user.error) {
                                        memberShip.userID = user.id;
                                    }
                                });

                                 document.getElementById('beforeLogin').style.display ='none';

                                loadData('refresh')

                            }
                            else
                                alert('Not Member')
                        }
                        else
                            alert(response.error);
                        }
                        catch(e){
                            alert(e);
                        }
                    }
                );

            }
            else {
                alert('User cancelled login or did not fully authorize.');

            }
        }
        ,
        {
            scope: 'user_groups'
        }
    );}
    catch(e){
        alert(e)
    }
}

function postComment(){
    FB.api(commentID+'/comments', 'post', { message: document.getElementById('postNewComment').value }, function(response) {
        loadComment();
        document.getElementById('postNewComment').value ="";

    });
}

var myScroll,
    pullDownEl, pullDownOffset,
    pullUpEl, pullUpOffset;

var commentScroll,
    comPullDownEl, comPullDownOffset,
    comPullUpEl, comPullUpOffset;

function pullDownAction() {
    setTimeout(function () {
        loadData('refresh');
        myScroll.refresh();
    }, 1);
}

function comPullDownAction() {
    setTimeout(function () {
        loadComment();
        commentScroll.refresh();
    }, 1);
}

function pullUpAction() {
    setTimeout(function () {
        loadData('addMore');
        myScroll.refresh();
    }, 1000);
}

function loaded() {
    pullDownEl = document.getElementById('pullDown');
    pullDownOffset = pullDownEl.offsetHeight;
    pullUpEl = document.getElementById('pullUp');
    pullUpOffset = pullUpEl.offsetHeight;
    myScroll = new iScroll('wrapper', {
        useTransition: true,
        topOffset: pullDownOffset,
        onRefresh: function () {
            if (pullDownEl.className.match('loading')) {
                pullDownEl.className = '';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
            } else if (pullUpEl.className.match('loading')) {
                pullUpEl.className = '';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
            }
        },
        onScrollMove: function () {
            if (this.y > 5 && !pullDownEl.className.match('flip')) {
                pullDownEl.className = 'flip';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
                this.minScrollY = 0;
            } else if (this.y < 5 && pullDownEl.className.match('flip')) {
                pullDownEl.className = '';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                this.minScrollY = -pullDownOffset;
            } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
                pullUpEl.className = 'flip';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Release to refresh...';
                this.maxScrollY = this.maxScrollY;
            } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
                pullUpEl.className = '';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
                this.maxScrollY = pullUpOffset;
            }
        },
        onScrollEnd: function () {
            if (pullDownEl.className.match('flip')) {
                pullDownEl.className = 'loading';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';
                pullDownAction();	// Execute custom function (ajax call?)
            } else if (pullUpEl.className.match('flip')) {
                pullUpEl.className = 'loading';
                pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Loading...';
                pullUpAction();	// Execute custom function (ajax call?)
            }
        }
    });

    setTimeout(function () {
        document.getElementById('wrapper').style.left = '0';
    }, 800);
    commentLoaded();
}


function commentLoaded() {
    comPullDownEl = document.getElementById('pullDownCom');
    comPullDownOffset = comPullDownEl.offsetHeight;
    commentScroll = new iScroll('wrapperCom', {
        useTransition: true,
        topOffset: pullDownOffset,
        onRefresh: function () {
            if (comPullDownEl.className.match('loading')) {
                comPullDownEl.className = '';
                comPullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
            }
        },
        onScrollMove: function () {
            if (this.y > 5 && !comPullDownEl.className.match('flip')) {
                comPullDownEl.className = 'flip';
                comPullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
                this.minScrollY = 0;
            } else if (this.y < 5 && comPullDownEl.className.match('flip')) {
                comPullDownEl.className = '';
                comPullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                this.minScrollY = -comPullDownOffset;
            }
        },
        onScrollEnd: function () {
            if (comPullDownEl.className.match('flip')) {
                comPullDownEl.className = 'loading';
                comPullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';
                comPullDownAction();	// Execute custom function (ajax call?)
            }
        }
    });

    setTimeout(function () {
        document.getElementById('wrapperCom').style.left = '0';
    }, 800);
}

document.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, false);
document.addEventListener('DOMContentLoaded', function () {
    alert('wini');
    setTimeout(loaded, 200);
}, false);