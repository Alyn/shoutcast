var curSong = "";
/*
If I used IceCast, all of this parsing would be easy as getting "status-json.xsl" and getting data form that.
Easy, just one data pull, not 3 pages... Ugh maybe the history would be pull from logging file created by the IceCast.
Also the pages and the stream are proxied by the apache bc CORS...
*/
function getCurNex() {
  jQuery.get("/currentmetadata?sid=1", {cache: false}, function(xmlDoc) {
    var check = xmlDoc.getElementsByTagName("SONGMETADATA")[0].childNodes[0];
    if(check) {
      $('#cur').html(xmlDoc.getElementsByTagName("TIT2")[0].childNodes[0].nodeValue);
      $('#nex').html(xmlDoc.getElementsByTagName("soon")[0].childNodes[0].nodeValue);
      if(xmlDoc.getElementsByTagName("TIT2")[0].childNodes[0].nodeValue != curSong) {
        getHistory();
      }
      curSong = xmlDoc.getElementsByTagName("TIT2")[0].childNodes[0].nodeValue;
    } else {
      $('#cur').html("No data available");
      $('#nex').html("No data available");
      $('#his').html("No data available");
    }
  })
  .fail(function(x) {
    if (x.status == 503) {
      $('#cur').html("Error 503 - Shoutcast server is probably down");
      $('#nex').html("Error 503 - Shoutcast server is probably down");
      $('#his').html("Error 503 - Shoutcast server is probably down");
    }
  });
}

function getHistory() {
  jQuery.get("/played.html", {cache: false}, function(data) {
    var html = "<table>" + data.split("<b>Song Title</b></td></tr>").pop().split('<script type="text/javascript">')[0].replace('<td style="padding: 0 1em;"><b>Current Song</b></td>', '');
    html = new DOMParser().parseFromString(html, "text/html");

    var cells = html.querySelectorAll("td");
    $('#his').html("");
    var outputTable = "<table style='margin-left:auto;margin-right:auto;'><thead><tr><th style='text-align:right'>Song title</th><th style='min-width:100px;text-align:center'>Time</th><th></th><th style='min-width:100px;text-align:center'>Time</th><th>Song title</th></tr></thead><tbody><tr><tr><td></td><td></td><td class='ladderEnd'></td></tr>";
    var alternate = 0;
    for (var i = 0; i < cells.length; i+=2) {
      var time = cells[i].firstChild.data;
      var song = cells[i+1].firstChild.data;
      if(alternate % 2 === 0) {
        outputTable += "<tr><td></td><td></td><td class='ladder lRight'></td><td class='time'>"+time+"</td><td class='rightCol'>"+song+"</td></tr>";
      } else {
        outputTable += "<tr><td class='leftCol'>"+song+"</td><td class='time'>"+time+"</td><td class='ladder'></td></tr>";
      }
      alternate++;
    }
    $('#his').html(outputTable + "<tr><tr><td></td><td></td><td class='ladderEnd eDown'></td></tr></tbody></table>");
  });
}

function getStatus() {
  jQuery.get("/shoutindex.html?sid=1", {cache: false}, function(data) {
    $('#status').html(data.split("<td>Stream Status: </td><td><b>").pop().split('</b></td></tr>')[0]);
  })
  .fail(function(x) {
    $('#status').html("Error "+x.status+" - Shoutcast server is probably down");
  });
}

//Audio events
var audio = document.getElementById('stream');

audio.addEventListener('waiting', function() { //starts with press
  $('#loadingimg').fadeIn({}, 100);
});
audio.addEventListener('playing', function() { //starts with audio
  $('#loadingimg').fadeOut({}, 100);
  $('#defaultimg').hover(function() {
    $('#stopimg').fadeIn({}, 100);
  }, function(){
    if($("#stopimg:hover").length == 0) {
      $('#stopimg').fadeOut({}, 100);
    }
  });
});
audio.addEventListener('pause', function() { //when is paused (also when no media)
  $('#playimg').fadeIn({}, 100);
});
audio.addEventListener('error', function() {
  if(audio.networkState == 3){
    alert("No media found, stream is probably not online!");
    $('#loadingimg').fadeOut({}, 100);
    $('#stopimg').fadeOut({}, 100);
    $('#playimg').fadeIn({}, 100);
  }
});

//Audio controls
$('#playimg').click(function() {
  $('#playimg').fadeOut({}, 100);
  audio.play();
  audio.volume = 0.8;
});
$('#stopimg').click(function() {
  audio.pause();
  $('#stopimg').fadeOut({}, 100);
  $('#defaultimg').unbind('mouseenter').unbind('mouseleave');
});
$('#reset').click(function() {
  $('#defaultimg').unbind('mouseenter').unbind('mouseleave');
  audio.src = "about:blank";
  audio.load();
  audio.src = "/live/;stream.mp3";
  audio.play();
});

$('#spotify').click(function() {
  window.open("https://open.spotify.com/search/"+curSong.split('(')[0], '_blank');
});
$('#yt').click(function() {
  window.open("https://www.youtube.com/results?search_query="+curSong.split('(')[0], '_blank');
});

$("#slide").slider({id: "slider"});
$("#slide").on("slide", function(slideEvt) {
  var theVolume = slideEvt.value;
  if(theVolume != 0) {
		audio.volume = Math.pow(10.,0.025*(theVolume-100));
	} else {
		audio.volume = 0.;
	}
});

//window adjust stuff
window.onresize = function(event) {
  adjustThings();
};

function adjustThings() {
  if ($(window).width() < 992) {
     $('#statusdiv').addClass('margin5');
     $('header').removeClass('sticky');
     $('#player1').addClass('player1');
  } else {
    $('#statusdiv').removeClass('margin5');
    $('header').addClass('sticky');
    $('#player1').removeClass('player1');
  }
  if ($(window).width() < 1200) {
     $('body').css('background-color', "#292A2D");
     $('body').css('background-image', 'none');
  } else {
    $('body').css('background-color', "none");
    $('body').css('background-image', 'url("content/background.jpg")');
  }
  $('main').css('min-height', '');
  $('main').css('min-height', $(window).height() - document.querySelector("header").offsetHeight+'px');
}

/*livestream player
The client side OK, but server? just use youtube streaming and replace this with iframe
*/
function createStream() {
  var player = videojs('lsHLS');
  player.on('error', function() {
    if(player.error().status == 404 || player.error().code == 4){
      $('#lsHLS').hide();
      $('#errorlive').show();
    }
  });
}

//to check hash, loads page or post
function checkHash() {
  if(window.location.hash.substr(1) == "history") {
    $('.active').removeClass('active').fadeOut({}, 500);
    setTimeout(function() {
      $('#history').addClass('active').fadeIn({}, 500);
      adjustThings();
    }, 600);
  } else if (window.location.hash.substr(1) == "livestream") {
    $('.active').removeClass('active').fadeOut({}, 500);
    setTimeout(function() {
      $('#livestream').addClass('active').fadeIn({}, 500);
      adjustThings();
    }, 600);
  } else {
    loadPost(window.location.hash.substr(1));
  }
}

$('.nav a').click(function() {
  var hashref = $(this).attr('href');
  if(!hashref) {
    history.replaceState(null, null, "/");
    $('.active').removeClass('active').fadeOut({}, 500);
    $('#home').addClass('active').fadeIn({}, 500);
  }
});

//news
function loadPost(target) {
  jQuery.get("/articles/"+target+".txt", {cache: false}, function(data) {
    $('#newspost').html(data);
    $('.active').removeClass('active').fadeOut({}, 500);
    $('#newspost').addClass('active').fadeIn({}, 500);
    setTimeout(adjustThings,550);
  })
  .fail(function(x) {
    alert("Couldn't load post, error code "+x.status);
  });
}

if(window.location.hash)
  checkHash();

window.onhashchange = function() {
 if(!window.location.hash) {
   $('.active').removeClass('active').fadeOut({}, 500);
   $('#home').addClass('active').fadeIn({}, 500);
   setTimeout(adjustThings,600);
 } else {
   checkHash();
 }
}

$('.morebutton').click(function() {
  loadPosts(2,0,true);
});

function loadPosts(from,to,hide) {
  jQuery.get("/articles/posts.json", {cache: false}, function(data) {
    showPosts(data,from,to,hide);
  })
  .fail(function(x) {
    alert("Couldn't load posts, error code "+x.status);
  });
}

function showPosts(array, slicepos, upto, hide) {
  var temp2,n;
  if(upto == 0) {
    n = array.length;
  } else {
    n = upto;
  }
  for(var i=slicepos;i<n;i++) {
    if((i+slicepos) % 2 == 0) {
      temp2 = Math.floor(Math.random() * 9999);
      $('.newssection button').before('<div class="row r'+temp2+'" style="margin: auto;">');
    }
    $('.r'+temp2).append('<div class="post col-md col-sm"><div class="posthead"><a href="#'+array[i].file+'">'+array[i].name+'</a><p class="postDate">'+array[i].date+'</p></div><div class="postPreview"><p>'+array[i].quickview+'</p><i>More in the post</i></div></div>');
    if((i+slicepos) % 2 != 0) {
      $('.newssection button').before('</div>');
    }
  }
  if(hide)
    $('.newssection button').fadeOut();
}

//scrollup button
$(window).scroll(function(){
  if ($(this).scrollTop() > 100) {
    $('#scrollup').fadeIn();
  } else {
    $('#scrollup').fadeOut();
  }
});

$('#scrollup').click(function(){
  $("html, body").animate({ scrollTop: 0 }, 600);
  return false;
});

//on document.ready (tooltips)
$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip({
   container: 'header'
  });
  getCurNex();
  setInterval(getCurNex, 15000);
  getStatus();
  setInterval(getStatus, 60000);
  adjustThings();
  loadPosts(0,2,false);
});
