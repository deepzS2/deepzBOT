(function ($) {
  $.fn.visible = function (partial) {

    var $t = $(this),
      $w = $(window),
      viewTop = $w.scrollTop(),
      viewBottom = viewTop + $w.height(),
      _top = $t.offset().top,
      _bottom = _top + $t.height(),
      compareTop = partial === true ? _bottom : _top,
      compareBottom = partial === true ? _top : _bottom;

    return ((compareBottom <= viewBottom) && (compareTop >= viewTop));

  };

})(jQuery);

const win = $(window)
const allLefts = $(".display-left")
const allRights = $(".display-right")

allLefts.each(function (i, element) {
  const el = $(element)

  if (el.visible(true)) {
    el.addClass('visible')
    el.addClass('fade-left')
    el.removeClass('hide')
  } else {
    el.removeClass('visible')
    el.removeClass('fade-left')
    el.addClass('hide')
  }
})

allRights.each(function (i, element) {
  const el = $(element)

  if (el.visible(true)) {
    el.addClass('visible')
    el.addClass('fade-right')
    el.removeClass('hide')
  } else {
    el.removeClass('visible')
    el.removeClass('fade-right')
    el.addClass('hide')
  }
})

win.scroll(function (event) {
  allLefts.each(function (i, element) {
    const el = $(element)

    if (el.visible(true)) {
      el.addClass('visible')
      el.addClass('fade-left')
      el.removeClass('hide')
    } else {
      el.removeClass('visible')
      el.removeClass('fade-left')
      el.addClass('hide')
    }
  })

  allRights.each(function (i, element) {
    const el = $(element)

    if (el.visible(true)) {
      el.addClass('visible')
      el.addClass('fade-right')
      el.removeClass('hide')
    } else {
      el.removeClass('visible')
      el.removeClass('fade-right')
      el.addClass('hide')
    }
  })
})

// Theme switcher
const toggleSwitch = document.querySelector('#theme-wrapper input[type="checkbox"]');

const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);

  if (currentTheme === 'dark') {
    toggleSwitch.checked = true;
  }
}


function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark'); //add this
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light'); //add this
  }
}

toggleSwitch.addEventListener('change', switchTheme, false);