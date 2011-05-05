$(function () {
  $.code = function() {
    return Math.floor($._code);
  };

  // draw
  $.draw = function() {
    var code = $.code();

    $('#char-code').text('#' + code.toString(16));

    var length = $('.chars').length;
    $('.chars').each(function(index, elem) {
      var offset = -$._size + index;
      var _code = code + offset;
      if (_code >= 0x10000) {
        _code = _code - 0x10000;
      } else if (_code < 0) {
        _code = 0x10000 + _code;
      }
      var chr = String.fromCharCode(_code);
      $(elem).text(chr).attr({'href':'/' + $.toCharCode16(_code)});
      if (_code == $._current_code) {
        $(elem).addClass('current');
      } else {
        $(elem).removeClass('current');
      }
    });
  };

  $.toCharCode16 = function(code) {
    var code16 = code.toString(16);
    for (var i=0; i < (4 - code16.length); i++) {
      code16 = '0' + code16;
    };
    return code16;
  };

  // mousewheel
  $('#chars-bar').mousewheel(function(event, delta) {
    var code = $._code - (delta * $._speed);
    if (code < 0) {
      code = 0xffff;
    } else if (code > 0xffff) {
      code = 0;
    }
    $._code = code;
    $.draw();
    return false;
  });

  // loop
  $._loop = false;
  $.startLoop = function(inc) {
    var loopCount = 0;
    $._loop = true;
    var loop = function() {
      console.log(inc);
      $._code = $._code + inc;
      if ($._code < 0) {
        $._code = 0x10000 + $._code;
      } else if ($._code >= 0x10000) {
        $._code = 0 + $._code;
      }
      $.draw();
      loopCount++;
      if (loopCount % 10 == 0) {
        var _inc = inc * 2;
        if (Math.abs(_inc) <= $._loop_max_speed) {
          inc = _inc;
        }
      }
      if ($._loop) {
        setTimeout(loop, 100);
      }
    };
    loop();
  };
  $('.nav.left').mouseover(function(event) {
    $.startLoop(-1);
  }).mouseleave(function(event) {
    $._loop = false;
  });
  $('.nav.right').mouseover(function(event) {
    $.startLoop(1);
  }).mouseleave(function(event) {
    $._loop = false;
  });

  // setup
  $.setup = function() {
    for (var i=0; i < $._size * 2 + 1; i++) {
      $("#chars").append($('<a class="chars">'));
    };

    $('.chars').hover(function() {
      $(this).addClass('hover');
    }, function() {
      $(this).removeClass('hover');
    });
  };

  var matches = location.pathname.match(/^\/([0-9a-f]{1,4})$/i);
  if (matches) {
    $._current_code = $._code = parseInt(matches[1], 16);
  } else {
    $._code = Math.random() * 0xffff;
  }
  $._size = 16;
  $._speed = 4;
  $._loop_max_speed = 128;

  $.setup();
  $.draw();
});