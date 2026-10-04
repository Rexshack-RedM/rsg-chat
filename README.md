# rsg-chat

Chat resource for RSG-Core (RedM) with a dark leather & gold styled NUI.

## Dependencies
- [rsg-core](https://github.com/Rexshack-RedM/rsg-core)
- [ox_lib](https://github.com/overextended/ox_lib)

## Installation
1. Drop `rsg-chat` into your resources folder (remove/disable the default `chat` resource).
2. Add `ensure rsg-chat` to your `server.cfg` after `ox_lib` and `rsg-core`.

## Features
- Messages show the player's character name (resolved server-side, can't be spoofed).
- Clickable command suggestions that fill in the input box.
- Per-player message cooldown and max message length.
- Admin-only server announcements.
- Locale support via ox_lib: en, de, el, es, fr, ja, nl, pl, pt-br, ro. Set the language in `server.cfg` with `setr ox:locale de` (for example).

## Commands
| Command | Who | Description |
|---|---|---|
| `/ooc <message>` | Everyone | Send an OOC message (same as normal chat) |
| `/clearchat` | Everyone | Clear your own chat window |
| `/say <message>` | Console / `command.say` ace | Send an untagged message |

Typing a command that doesn't exist shows an "Unknown command" notification.

## Configuration
**`config.lua`** (server):
| Option | Default | Description |
|---|---|---|
| `MaxMessageLength` | `256` | Longer messages are cut off |
| `MessageCooldown` | `1000` | Milliseconds between messages per player |
| `PSAPermission` | `'admin'` | rsg-core permission needed to send a SERVER PSA from a client |

**`html/js/config.js`** (NUI): message templates, `fadeTimeout` (ms before the chat fades), `suggestionLimit`, and window size.

## Server announcements
From any server script:
```lua
TriggerEvent('chat:server:ServerPSA', 'Server restart in 10 minutes')
```
Clients can trigger the same event only if they have the `PSAPermission` permission.

## Events (compatible with the default cfx chat)
Client: `chat:addMessage`, `chat:addSuggestion`, `chat:addSuggestions`, `chat:removeSuggestion`, `chat:addTemplate`, `chat:clear`, `chatMessage`.

Server: `chatMessage` (source, author, message) is fired before every chat message. Call `CancelEvent()` in a handler to block it.

## Notes
- Command help/params are sent by other resources when you load in. Restarting `rsg-chat` alone will drop those details until you reconnect.
