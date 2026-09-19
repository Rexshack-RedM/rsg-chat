--[[ COMMANDS ]]--
local RSGCore = exports['rsg-core']:GetCoreObject()

-- Returns the player's in-character first + last name, falling back to the
-- account name when the player object is not available (e.g. not loaded yet)
local function GetCharacterName(src)
    local Player = RSGCore.Functions.GetPlayer(src)
    if Player and Player.PlayerData and Player.PlayerData.charinfo then
        local firstname = Player.PlayerData.charinfo.firstname
        local lastname = Player.PlayerData.charinfo.lastname
        if firstname and lastname then
            return (firstname .. ' ' .. lastname):gsub('^%s*(.-)%s*$', '%1')
        end
    end
    return GetPlayerName(src)
end

RegisterCommand('clearchat', function(source, args, rawCommand)
    TriggerClientEvent('chat:clear', source)
end, false)

RegisterCommand('ooc', function(source, args, rawCommand)
    local src = source
    local msg = rawCommand:sub(5)
    if player ~= false then
        local user = GetCharacterName(src)
            TriggerClientEvent('chat:addMessage', -1, {
            template = '<div class="chat-message"><b>[OOC] {0}:</b> {1}</div>',
            args = { user, msg }
        })
    end
end, false)

RegisterCommand('say', function(source, args, rawCommand)
    TriggerClientEvent('chatMessage', -1, (source == 0) and 'console' or GetCharacterName(source), { 255, 255, 255 }, rawCommand:sub(5))
end)