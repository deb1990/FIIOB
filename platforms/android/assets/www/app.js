var myScroll,
    pullDownEl, pullDownOffset,
    pullUpEl, pullUpOffset;

var commentScroll,
    comPullDownEl, comPullDownOffset,
    comPullUpEl, comPullUpOffset;


//fiiob:146194088779617
//pecu:145986828780603

var memberShip = {
    isMember: false,
    groupID: '146194088779617',
    nextPage: '/146194088779617/feed',
    initialPage: '/146194088779617/feed',
    userID: ''
};
var commentID;
var deleteID;
var delFlag;

document.addEventListener("backbutton", onBackKeyDown, false);

function onBackKeyDown() {
    if (document.getElementById('fadeDel').style.display == 'block')
    {
        document.getElementById('fadeDel').style.display = 'none';
        document.getElementById('confirmDel').style.display = 'none';
    }
    else if(document.getElementById('newPost').style.display == 'black')
    {
        document.getElementById('newPost').style.display = 'none';
        document.getElementById('fade').style.display = 'none'
    }
    else if(document.getElementById('commentBox').style.display == 'block')
    {
        document.getElementById('commentBox').style.display = 'none';
        document.getElementById('fade').style.display = 'none'
    }
    else if(document.getElementById('confirmExit').style.display == 'block')
    {
        document.getElementById('fadeExit').style.display = 'none';
        document.getElementById('confirmExit').style.display = 'none'
    }
    else
    {
        document.getElementById('fadeExit').style.display = 'block';
        document.getElementById('confirmExit').style.display = 'block';
    }
}

function login() {
    document.getElementById('btnLogin').disabled = true;
    FB.login(function (response) {
            if (response.authResponse) {
                access_token = response.authResponse.accessToken;
                memberShip.userID = response.authResponse.userID;
                FB.api(
                    "/me/groups",
                    function (response) {
                        console.log(response)
                        try {
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
                                    document.getElementById('beforeLogin').style.display = 'none';

                                    loadData('refresh')

                                }
                                else
                                    alert('Not Member')
                            }
                            else
                                alert(response.error);
                        }
                        catch (e) {
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
    );
}
function loadData(mode) {
    $('#fadeSpinner').css({"display": "block"});
    var loadUrl = memberShip.nextPage;
    if (mode == 'refresh') {
        loadUrl = memberShip.initialPage;
        document.getElementById('thelist').innerHTML = "";
    }

    FB.api(loadUrl, function (data) {
        var feedData = data.data;
        var nextPage = data.paging.next;
        var url = 'graph.facebook.com';
        memberShip.nextPage = nextPage.substr(nextPage.indexOf('graph.facebook.com') + url.length, nextPage.length);

        var postByPic;
        for (var i = 0; i < feedData.length; i++) {
            var date = new Date(feedData[i].created_time);
            var days = Math.floor(Math.abs(new Date() - date) / (1000 * 3600 * 24))
            if (days > 0)
                date = ',&nbsp;&nbsp;' + days + ' days ago&nbsp;&nbsp;';
            else {
                var hours = Math.floor(Math.abs(new Date() - date) / (1000 * 3600))
                if (hours > 0)
                    date = ',&nbsp;&nbsp;' + hours + ' hours ago&nbsp;&nbsp;';
                else {
                    var mins = Math.floor(Math.abs(new Date() - date) / (1000 * 60))
                    date = ',&nbsp;&nbsp;' + mins + ' mins ago&nbsp;&nbsp;';
                }
            }
            (function (post) {
                FB.api(post.object_id + '', function (comments) {
                    if (comments || !comments.error) {
                        try {
                            if (comments.images) {
                                if (comments.images[3].source) {
                                    document.getElementById(post.id + '_msgPic').src = comments.images[3].source;
                                    document.getElementById(post.id + '_msgPic').style.display = 'initial';
                                }
                            }
                            myScroll.refresh();
                        }
                        catch (e) {
                            myScroll.refresh();
                        }

                    }
                });
                FB.api(post.id + "/comments?filter=toplevel&limit=1000", function (comments) {
                    if (comments || !comments.error) {
                        document.getElementById(post.id + '_comment').innerHTML = "<i class='fa fa-comment'></i>&nbsp;" + comments.data.length;
                        document.getElementById(post.id + '_comment').onclick = commentOpen;
                    }
                });

                FB.api(post.id + "/likes?limit=1000", function (likes) {
                    if (likes || !likes.error) {
                        document.getElementById(post.id + '_like').innerHTML = "<i class='fa fa-heart'></i>&nbsp;" + likes.data.length;
//                        document.getElementById(post.id + '_like').onclick = like;
                        if (getJsonObjectsByContainsValue(likes, 'id', memberShip.userID).length > 0) {
                            document.getElementById(post.id + '_like').className = 'icon1';
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
                message = message.replace(/\n/g, '<br>');
            }
            var del = ''
            if (feedData[i].from.id == memberShip.userID) {
                del = "<div onclick='deleteItem(this,\"P\")' id='" + feedData[i].id + "_like' postid='" + feedData[i].id + "' class='delete'>Delete</div>";
            }

            $('#thelist').append(
                "<li id='" + feedData[i].id + "_postLi'><table class='feed'>" +
                    "<tr>" +
                    "<td align='top' style='width:35px;padding: 0 6px 0 0;vertical-align:top;'><img class='postByPic' id='" + feedData[i].id + "_postByPic'></td>" +
                    "<td style='vertical-align:top;'>" +
                    "<div class='userName'>" + feedData[i].from.name + "</div>" +
                    "<div class='postTime'>" + date + "</div><br>" +
                    "<div class='iconBox'>" +
                    "<div onclick='like(this)' id='" + feedData[i].id + "_like' postid='" + feedData[i].id + "' class='disableIcon1'><i class='fa fa-heart'></i></div>" +
                    "<div id='" + feedData[i].id + "_comment' postid='" + feedData[i].id + "' class='icon2'><i class='fa fa-comment'></i></div></div><br>" +
                    "<div style='width: 100%'><img style='display: none' class='msgPic' id='" + feedData[i].id + "_msgPic'></div>" +
                    "<div class='message'>" + message + "</div>" +
                    del +
                    "</td>" +
                    "</tr>" +
                    "</table></li>");

        }
        $('.message').emoticonize();
        $('#fadeSpinner').css({"display": "none"});
    });

}

function loadComment() {
    $('#fadeSpinner').css({"display": "block"});
    document.getElementById('thelistCom').innerHTML = "";

    FB.api("/" + commentID + "/comments?limit=1000", function (data) {
        var commentData = data.data;
        var postByPic;
        for (var i = 0; i < commentData.length; i++) {
            var date = new Date(commentData[i].created_time);
            var days = Math.floor(Math.abs(new Date() - date) / (1000 * 3600 * 24))
            if (days > 0)
                date = ',&nbsp;&nbsp;' + days + ' days ago&nbsp;&nbsp;';
            else {
                var hours = Math.floor(Math.abs(new Date() - date) / (1000 * 3600))
                if (hours > 0)
                    date = ',&nbsp;&nbsp;' + hours + ' hours ago&nbsp;&nbsp;';
                else {
                    var mins = Math.floor(Math.abs(new Date() - date) / (1000 * 60))
                    date = ',&nbsp;&nbsp;' + mins + ' mins ago&nbsp;&nbsp;';
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
                likeStatus = "<div onclick='like(this)' id='" + commentData[i].id + "_like' postid='" + commentData[i].id + "' class='icon1'><i class='fa fa-heart'></i>&nbsp;" + commentData[i].like_count + "</div><br>";
            }
            else {
                likeStatus = "<div onclick='like(this)' id='" + commentData[i].id + "_like' postid='" + commentData[i].id + "' class='disableIcon1'><i class='fa fa-heart'></i>&nbsp;" + commentData[i].like_count + "</div><br>";
            }


            var message = '';
            if (commentData[i].message) {
                message = replaceURLWithHTMLLinks(commentData[i].message)
            }

            var del = ''
            if (commentData[i].from.id == memberShip.userID) {
                del = "<div onclick='deleteItem(this,\"C\")' id='" + commentData[i].id + "_like' postid='" + commentData[i].id + "' class='delete'>Delete</div>";
            }

            $('#thelistCom').append(
                "<li id='" + commentData[i].id + "_commentLi'><table class='feed'>" +
                    "<tr>" +
                    "<td align='top' style='width:35px;padding: 0 6px 0 0;vertical-align:top;'><img class='postByPic' id='" + commentData[i].id + "_postByPic'></td>" +
                    "<td style='vertical-align:top;'>" +
                    "<div class='userName'>" + commentData[i].from.name + "</div>" +
                    "<div class='postTime'>" + date + "</div>" +
                    "<div class='iconBox'>" +
                    likeStatus +
                    "<div style='width: 100%'></div>" +
                    "<div class='message'>" + message + "</div>" +
                    del +
                    "</td>" +
                    "</tr>" +
                    "</table></li>");
        }
        $('#fadeSpinner').css({"display": "none"});
        $('.message').emoticonize();
//        commentScroll.scrollTo(0, -$('#thelistCom').height(), 1)
    });
}
function deleteItem(me, mode) {
    delFlag = mode;
    deleteID = me.getAttribute('postid');
    document.getElementById('fadeDel').style.display = 'block';
    document.getElementById('confirmDel').style.display = 'block';
}
function deletePost() {
    document.getElementById('confirmDel').style.display = 'none';
    document.getElementById('fadeDel').style.display = 'none';
    FB.api("/" + deleteID, 'delete', function (response) {
        if (response === true) {
            if (delFlag == 'P') {
                $('#' + deleteID + '_postLi').remove();
                myScroll.refresh();
            }
            else {
                $('#' + deleteID + '_commentLi').remove();
                commentScroll.refresh();
//                commentScroll.scrollTo(0, -$('#thelistCom').height(), 1)
            }
        }
    });
}
function like(me) {
    if (document.getElementById(me.getAttribute('postid') + '_like').className == 'disableIcon1') {
        (function (id) {
            FB.api(id + "/likes", 'post', function (response) {
                console.log(response, id);
                if (response === true) {
                    document.getElementById(id + '_like').className = 'icon1';
                }
            });
        })(me.getAttribute('postid'));
    }
//    else
//    {
//        (function (id) {
//            FB.api(id + "/likes", 'delete', function (response) {
//                console.log(response,id);
//                if (response === true) {
//                    document.getElementById(id + '_like').className = 'disableIcon1';
//                }
//            });
//        })(me.getAttribute('postid'));
//    }

}
function commentOpen() {
    commentScroll.refresh();
    document.getElementById('commentBox').style.display = 'block';
    document.getElementById('fade').style.display = 'block'
    document.getElementById('postNewComment').value = "";
    commentID = this.getAttribute('postid');
    loadComment();

}
function newPost() {
    document.getElementById('newPost').style.display = 'none';
    document.getElementById('fade').style.display = 'none'
    if (document.getElementById('postNew').value.length > 0) {
        FB.api(memberShip.groupID+'/feed', 'post', { message: document.getElementById('postNew').value }, function (response) {
            document.getElementById('postNew').value = "";
            loadData('refresh');
        });
    }
}
function postComment() {
    if (document.getElementById('postNewComment').value.length > 0) {
        FB.api(commentID + '/comments', 'post', { message: document.getElementById('postNewComment').value }, function (response) {
            loadComment();
            document.getElementById('postNewComment').value = "";

        });
    }
}

function pullDownAction() {
    setTimeout(function () {
        loadData('refresh');
        myScroll.refresh();
    }, 1);
}
function pullUpAction() {
    setTimeout(function () {
        loadData('addMore');
        myScroll.refresh();
    }, 1);
}
function comPullDownAction() {
    setTimeout(function () {
        loadComment();
        commentScroll.refresh();
    }, 1);
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
function replaceURLWithHTMLLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, "<a style='color:#ccc' target='_blank' href='$1'>$1</a>");
}
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
document.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, false);
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(loaded, 1);
}, false);