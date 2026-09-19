window.APP = {
  template: '#app_template',
  name: 'app',
  data() {
    return {
      style: CONFIG.style,
      showInput: false,
      showWindow: false,
      shouldHide: true,
      backingSuggestions: [],
      removedSuggestions: [],
      templates: CONFIG.templates,
      message: '',
      messages: [],
      oldMessages: [],
      oldMessagesIndex: -1,
      tplBackups: [],
      msgTplBackups: []
    };
  },
  destroyed() {
    clearInterval(this.focusTimer);
    window.removeEventListener('message', this.listener);
  },
  mounted() {
    post('http://chatt/loaded', JSON.stringify({}));
    this.listener = window.addEventListener('message', (event) => {
      const item = event.data || event.detail; //'detail' is for debugging via browsers
      if (this[item.type]) {
        this[item.type](item);
      }
    });
  },
  updated() {
    // Get the selected color from localStorage
    var savedColor = localStorage.getItem('chatUIColor');
    if (savedColor) {
      // Update the UI with the saved color
      updateUI(savedColor);
    }
  },
  watch: {
    messages() {
      if (this.showWindowTimer) {
        clearTimeout(this.showWindowTimer);
      }
      this.showWindow = true;
      this.resetShowWindowTimer();

      const messagesObj = this.$refs.messages;
      this.$nextTick(() => {
        messagesObj.scrollTop = messagesObj.scrollHeight;
      });
    },
  },
  computed: {
    suggestions() {
      return this.backingSuggestions.filter((el) => this.removedSuggestions.indexOf(el.name) <= -1);
    },
  },
  methods: {
    ON_SCREEN_STATE_CHANGE({ shouldHide }) {
      this.shouldHide = shouldHide;
    },
    ON_OPEN() {
      this.showInput = true;
      this.showWindow = true;
      if (this.showWindowTimer) {
        clearTimeout(this.showWindowTimer);
      }
      this.focusTimer = setInterval(() => {
        if (this.$refs.input) {
          this.$refs.input.focus();
        } else {
          clearInterval(this.focusTimer);
        }
      }, 100);
	  },
    ON_MESSAGE({ message }) {
      this.messages.push(message);
    },
    ON_CLEAR() {
      this.messages = [];
      this.oldMessages = [];
      this.oldMessagesIndex = -1;
    },
    ON_SUGGESTION_ADD({ suggestion }) {
      const duplicateSuggestion = this.backingSuggestions.find(a => a.name == suggestion.name);
      if (duplicateSuggestion) {
        if(suggestion.help || suggestion.params) {
          duplicateSuggestion.help = suggestion.help || "";
          duplicateSuggestion.params = suggestion.params || [];
        }
        return;
      }
      if (!suggestion.params) {
        suggestion.params = []; //TODO Move somewhere else
      }

      if (this.removedSuggestions.find(a => a.name == suggestion.name)) {
        this.removedSuggestions.splice(this.removedSuggestions.indexOf(suggestion.name), 1)
      }
      this.backingSuggestions.push(suggestion);
    },
    ON_SUGGESTION_REMOVE({ name }) {
      if(this.removedSuggestions.indexOf(name) <= -1) {
        this.removedSuggestions.push(name);
      }
    },
    ON_COMMANDS_RESET() {
      console.log('Resetting Command Suggestions');
      this.removedSuggestions = [];
      this.backingSuggestions = [];
    },
    ON_TEMPLATE_ADD({ template }) {
      if (this.templates[template.id]) {
        this.warn(`Tried to add duplicate template '${template.id}'`)
      } else {
        this.templates[template.id] = template.html;
      }
    },
    ON_UPDATE_THEMES({ themes }) {
      this.removeThemes();

      this.setThemes(themes);
    },
    removeThemes() {
      for (let i = 0; i < document.styleSheets.length; i++) {
        const styleSheet = document.styleSheets[i];
        const node = styleSheet.ownerNode;
        
        if (node.getAttribute('data-theme')) {
          node.parentNode.removeChild(node);
        }
      }

      this.tplBackups.reverse();

      for (const [ elem, oldData ] of this.tplBackups) {
        elem.innerText = oldData;
      }

      this.tplBackups = [];

      this.msgTplBackups.reverse();

      for (const [ id, oldData ] of this.msgTplBackups) {
        this.templates[id] = oldData;
      }

      this.msgTplBackups = [];
    },
    setThemes(themes) {
      for (const [ id, data ] of Object.entries(themes)) {
        if (data.style) {
          const style = document.createElement('style');
          style.type = 'text/css';
          style.setAttribute('data-theme', id);
          style.appendChild(document.createTextNode(data.style));

          document.head.appendChild(style);
        }
        
        if (data.styleSheet) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = data.baseUrl + data.styleSheet;
          link.setAttribute('data-theme', id);

          document.head.appendChild(link);
        }

        if (data.templates) {
          for (const [ tplId, tpl ] of Object.entries(data.templates)) {
            const elem = document.getElementById(tplId);

            if (elem) {
              this.tplBackups.push([ elem, elem.innerText ]);
              elem.innerText = tpl;
            }
          }
        }

        if (data.script) {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = data.baseUrl + data.script;

          document.head.appendChild(script);
        }

        if (data.msgTemplates) {
          for (const [ tplId, tpl ] of Object.entries(data.msgTemplates)) {
            this.msgTplBackups.push([ tplId, this.templates[tplId] ]);
            this.templates[tplId] = tpl;
          }
        }
      }
    },
    warn(msg) {
      this.messages.push({
        args: [msg],
        template: '^3<b>CHAT-WARN</b>: ^0{0}',
      });
    },
    clearShowWindowTimer() {
      clearTimeout(this.showWindowTimer);
    },
    resetShowWindowTimer() {
      this.clearShowWindowTimer();
      this.showWindowTimer = setTimeout(() => {
        if (!this.showInput) {
          this.showWindow = false;
        }
      }, CONFIG.fadeTimeout);
    },
    keyUp() {
      this.resize();
    },
    keyDown(e) {
      if (e.which === 38 || e.which === 40) {
        e.preventDefault();
        this.moveOldMessageIndex(e.which === 38);
      } else if (e.which == 33) {
        var buf = document.getElementsByClassName('chat-messages')[0];
        buf.scrollTop = buf.scrollTop - 100;
      } else if (e.which == 34) {
        var buf = document.getElementsByClassName('chat-messages')[0];
        buf.scrollTop = buf.scrollTop + 100;
      }
    },
    moveOldMessageIndex(up) {
      if (up && this.oldMessages.length > this.oldMessagesIndex + 1) {
        this.oldMessagesIndex += 1;
        this.message = this.oldMessages[this.oldMessagesIndex];
      } else if (!up && this.oldMessagesIndex - 1 >= 0) {
        this.oldMessagesIndex -= 1;
        this.message = this.oldMessages[this.oldMessagesIndex];
      } else if (!up && this.oldMessagesIndex - 1 === -1) {
        this.oldMessagesIndex = -1;
        this.message = '';
      }
    },
    resize() {
      const input = this.$refs.input;
      input.style.height = '5px';
      input.style.height = `${input.scrollHeight + 2}px`;
    },
    send(e) {
      if(this.message !== '') {
        // Get the selected color from localStorage
        var savedColor = localStorage.getItem('chatUIColor');
        if (savedColor) {
          // Update the UI with the saved color
          updateUI(savedColor);
        }
    
        post('http://chatt/chatResult', JSON.stringify({
          message: this.message,
        }));
        this.oldMessages.unshift(this.message);
        this.oldMessagesIndex = -1;
        this.hideInput();
      } else {
        this.hideInput(true);
      }
    },
    hideInput(canceled = false) {
      if (canceled) {
        post('http://chatt/chatResult', JSON.stringify({ canceled }));
      }
      this.message = '';
      this.showInput = false;
      clearInterval(this.focusTimer);
      this.resetShowWindowTimer();
    },
  },
};



// Function to initialize jscolor picker
function initializeColorPicker() {
  var colorInput = document.getElementsByClassName('color')[0];
  if (colorInput) {
      var picker = new jscolor(colorInput, {
          format: 'rgba', // Set color format to RGBA
          backgroundColor: 'rgba(0, 0, 0, 0.1)', // Set default background color with transparency
          borderColor: '#ccc',
          alphaChannel: true // Enable alpha channel (transparency)
      });
  }
}

// Call the function to initialize jscolor picker when the document is ready
$(document).ready(function() {
  initializeColorPicker();
});

// Function to update UI with selected color
function updateUI(color) {
  // Update the background color of textarea, suggestions, and chat pill
  $('.chat-input textarea, .suggestions, .buttons button, .chat-message').css('background-color', color);
}

// Function to save the selected color to localStorage
function saveSelectedColor(color) {
  localStorage.setItem('chatUIColor', color);
}

// Event listener for color change in jscolor picker
$('.color').on('change', function() {
  // Get the selected color
  var selectedColor = this.value;
  // Update the UI with the selected color
  updateUI(selectedColor);
  // Save the selected color to localStorage
  saveSelectedColor(selectedColor);
});

// Function to open jscolor picker and update UI directly
function openColorPicker() {
  // Trigger jscolor picker
  $('.color')[0].jscolor.show();
}


// Function to load the saved color from localStorage
function loadSavedColor() {
  var savedColor = localStorage.getItem('chatUIColor');
  if (savedColor) {
      // Update the UI with the saved color
      updateUI(savedColor);
  }
}

// Call the function to load the saved color when the document is ready
$(document).ready(function() {
  loadSavedColor();
});