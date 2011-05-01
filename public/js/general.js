/*globals $ window document */
// the line above helps JSLint ignore certain globals; keep it and customize it if you're using JSLint's "good parts" to check your scripts

// The script below does essentially nothing other than define some nearly empty methods and a few settings for demonstration purposes
// You can delete this whole thing, or do whatever you want with it, it's just a basic starting point that I've been using lately

$(function () {
  $.code = function() {
    return Math.floor($._code);
  };

  $.codeFromHash = function() {
    return parseInt(window.location.hash.substr(1, window.location.hash.length - 1), 16);
  };

  // draw
  $.draw = function() {
    var code = $.code();
    var code16 = code.toString(16);

    window.location.hash = code16;
    document.title = String.fromCharCode(code);

    var length = $('.chars').length;
    $('.chars').each(function(index, elem) {
      var offset = -$._size + index;
      var _code = code + offset;
      if (_code > 0xffff) {
        _code = _code - 0xffff;
      } else if (_code < 0) {
        _code = 0xffff + _code;
      }
      var chr = String.fromCharCode(_code);
      // var chr = _code;
      $(elem).text(chr).attr({'code':_code});
    });
  };

  // mousewheel
  $('body').mousewheel(function(event, delta) {
    // console.log('delta => ' + delta);
    var code = $._code - (delta * $._speed);
    if (code < 0) {
      code = 0xffff;
    } else if (code > 0xffff) {
      code = 0;
    }
    $._code = code;
    $.draw();
  });

  // loop
  $._loop = false;
  $.startLoop = function(inc) {
    var loopCount = 0;
    $._loop = true;
    var loop = function() {
      $._code = $._code + inc;
      $.draw();
      loopCount++;
      if (loopCount % 10 == 0) {
        inc = inc * 2;
      }
      if ($._loop) {
        setTimeout(loop, 100);
      }
    };
    loop();
  };
  $('#nav .left').mouseover(function(event) {
    $.startLoop(-1);
  }).mouseleave(function(event) {
    $._loop = false;
  });
  $('#nav .right').mouseover(function(event) {
    $.startLoop(1);
  }).mouseleave(function(event) {
    $._loop = false;
  });

  // onhashchange
  window.onhashchange = function () {
    $._code = $.codeFromHash();
    $.draw();
  };

  // setup
  $.setup = function() {
    for (var i=0; i < $._size; i++) {
      $("#chars").append(
        $('<div class="chars">').attr(
          {'class': "chars " + "small-" + ($._size - i - 1)}
        )
      );
    };
    $("#chars").append('<div id="char" class="chars">');
    for (var i=0; i < $._size; i++) {
      $("#chars").append(
        $('<div class="chars">').attr(
          {'class': "chars " + "small-" + i}
        )
      );
    };

    $('.chars').click(function() {
      $._code = $(this).attr('code');
      $.draw();
    });
  };

  if (window.location.hash != '') {
    $._code = $.codeFromHash();
  } else {
    $._code = 0x2588;
  }

  $._size = 24;
  $._speed = 4;

  $.setup();
  $.draw();
});