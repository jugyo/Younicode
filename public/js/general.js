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

  $.draw = function() {
    var code = $.code();
    if ($("#char-code").text() == code.toString()) {
      return;
    }

    var code16 = code.toString(16);

    $("#char-code").text(code16);

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
      $(elem).text(chr);
    });
  };

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

  window.onhashchange = function () {
    $._code = $.codeFromHash();
    $.draw();
  };

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