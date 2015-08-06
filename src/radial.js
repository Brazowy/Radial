var Radial = {
  settings: {
    id: 'radial',
    hiddenClass: 'hidden',
    cancelLabel: 'Cancel',
    activationDelay: 500,
    animationDuration: 500
  },
  data: {
    timeouts: {},
    click: {}
  },
  stack: [],
  init: function(settings) {
    // Merge custom settings with defaults
    if (typeof settings === 'object') {
      for (var i in settings) {
        if (settings.hasOwnProperty(i)) this.settings[i] = settings[i];
      }
    }

    // Insert container
    var container = document.createElement('div');
    container.id = this.settings.id;

    var body = this.getBodyElement();
    body.appendChild(container);

    // Close Radial when clicked outside of Radial element
    body.addEventListener('click', function(event) {
      var close = false;

      // @TODO: Only close if click event orginated outside of container

      if (close) Radial.close();
    });

    // Close Radial when escape is pressed
    window.addEventListener('keyup', function(event) {
      if (event.keyCode === 27) Radial.close();
    });

    // Hide by default
    this.render();

    return this;
  },
  getBodyElement: function() {
    return document.getElementsByTagName('body').item(0);
  },
  instantiate: function(obj) {
    // Combine mousedown and mouseup for pseudo long press
    obj.element.addEventListener('mousedown', function(event) {
      Radial.data.click.x = event.clientX;
      Radial.data.click.y = event.clientY;

      obj.menu.data.timeout = window.setTimeout(function() {
        Radial.close();
        Radial.display(obj.menu);
      }, Radial.settings.activationDelay);
    });

    obj.element.addEventListener('mouseup', function() {
      clearTimeout(obj.menu.data.timeout);
    });

    return this;
  },
  create: function() {
    var menu = new Radial.menu();

    // Every menu should have a cancel option to prevent chain breaking
    menu.addItem({
      label: this.settings.cancelLabel,
      click: function() {
        Radial.cancel();
      },
      sort: 'zz'
    });

    return menu;
  },
  menu: function() {
    this.data = {};
    this.items = [];
    this.addItem = function(item) {
      if (typeof item.sort === 'undefined') item.sort = item.label;

      this.items.push(item);

      // Re-sort items to ensure correct order
      this.items.sort(function(a, b) {
        return a.sort > b.sort;
      });
    };
  },
  render: function() {
    // Call hide first to trigger animations
    this.hide();

    if (this.stack.length === 0) return this;

    var menu = this.getMenu();

    var ol = document.createElement('ol');

    menu.items.forEach(function(item) {
      var anchor = document.createElement('a');
      anchor.href = '#';
      anchor.appendChild(document.createTextNode(item.label));
      anchor.addEventListener('click', function() {
        item.click();

        return false;
      });

      var li = document.createElement('li');
      li.appendChild(anchor);

      ol.appendChild(li);
    });

    var container = this.getContainer();

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    container.appendChild(ol);

    this.show();

    // Only reposition on initial open
    if (this.stack.length === 1) this.position();
  },
  position: function() {
    var container = this.getContainer();
    var shiftLeft = container.offsetWidth / 2;
    var shiftUp = container.offsetHeight / 2;

    container.style.left = this.data.click.x - shiftLeft + 'px';
    container.style.top = this.data.click.y - shiftUp + 'px';

    // @TODO: Adjust position if menu is out of window bounds

    return this;
  },
  getMenu: function() {
    return this.stack[0];
  },
  getContainer: function() {
    return document.getElementById(this.settings.id);
  },
  hide: function() {
    // @TODO: Hide elements one by one from lowest to highest
    var container = this.getContainer();

    if (container.className.indexOf(this.settings.hiddenClass) > -1) {
      return this;
    }

    container.className += ' ' + this.settings.hiddenClass;
    container.className.trim();

    return this;
  },
  show: function() {
    // @TODO: Show elements one by one based on animation delay from highest to lowest
    var container = this.getContainer();

    container.className = container.className.replace(
      this.settings.hiddenClass, ''
    ).trim();

    return this;
  },
  close: function() {
    this.stack = [];
    this.render();

    return this;
  },
  display(menu) {
    this.stack.unshift(menu);
    this.render();

    return this;
  },
  cancel: function() {
    this.stack.shift();
    this.render();

    return this;
  }
}
