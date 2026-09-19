# rsg-chat

A chat resource for RedM servers running the [RSG-Core](https://github.com/Rexshack-RedM/rsg-core) framework. It is a Vue-based NUI chat window that shows players' **in-character names** instead of their account names.

## Features

- In-character names: messages use the character's first and last name from `rsg-core`, falling back to the account name if no character is loaded.
- OOC chat: plain messages typed into chat are broadcast as `[OOC] Name: message`.
- Commands:
  - `/ooc <message>` sends an OOC message to everyone.
  - `/say <message>` sends a message to everyone (shown as `console` when run from the server console).
  - `/clearchat` clears your own chat window.
- Server PSA: trigger `chat:server:ServerPSA` to broadcast a `SERVER:` announcement.
- Command suggestions: the client is sent suggestions for every registered command it has ACE permission for.
- Customisable UI: templates, fade timeout, suggestion limit and window style are set in `html/js/config.js`.
- Built-in version checker that compares against the latest release on GitHub at resource start.

## Requirements

- [rsg-core](https://github.com/Rexshack-RedM/rsg-core)
- RedM (game `rdr3`)

## Installation

1. Download or clone the resource into your server's `resources` folder, for example `resources/[framework]/rsg-chat`.
2. Make sure the folder is named `rsg-chat`. The version checker uses the folder name to look up the latest version.
3. Remove or disable any other chat resource, including the default `chat`.
4. Add it to `server.cfg` after `rsg-core`:

   ```cfg
   ensure rsg-core
   ensure rsg-chat
   ```

5. Restart the server.

## Configuration

Edit `html/js/config.js`. `config.default.js` is a reference copy and should not be edited.

```js
window.CONFIG = {
  defaultTemplateId: 'default',      // template used for messages with 2 args
  defaultAltTemplateId: 'defaultAlt',// template used for messages with 1 arg
  templates: {                       // add your own static templates here
    'default': '<div class="chat-message">OOC {0}: {1}</div>',
    'defaultAlt': '{0}',
    'print': '<pre>{0}</pre>',
    'example:important': '<h1>^2{0}</h1>'
  },
  fadeTimeout: 10000,                // ms before chat fades out
  suggestionLimit: 5,                // max command suggestions shown
  style: {
    background: 'transparent',
    width: '38%',
    height: '22%'
  }
};
```

`style` accepts any CSS property, for example `background: 'rgba(255, 93, 0, 0.62)'` or `border: '1px solid #000000'`.

Message appearance is also controlled by `html/css/style.css`. Server-side message formats are set in `server/commands.lua` and `server/main.lua`.

## Usage

- Open the chat input with the default text chat key (`INPUT_MP_TEXT_CHAT_ALL`).
- Send a message from another resource:

  ```lua
  -- server side
  TriggerClientEvent('chat:addMessage', source, {
      template = '<div class="chat-message"><b>{0}</b>: {1}</div>',
      args = { 'Sheriff', 'Hello there' }
  })

  -- server-wide announcement
  TriggerEvent('chat:server:ServerPSA', 'Restart in 10 minutes')
  ```

- Add a command suggestion with `chat:addSuggestion` and remove it with `chat:removeSuggestion`.

## Credits

- Staff Member Phil for this script
