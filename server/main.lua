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

AddEventHandler("chatMessage", function(source, color, message)
    local src = source
    args = stringsplit(message, " ")
    CancelEvent()
    if string.find(args[1], "/") then
        local cmd = args[1]
        table.remove(args, 1)
		else
        TriggerClientEvent('chat:addMessage', -1, {
            template = '<div class="chat-message"><b>[OOC] {0}</b>: {1}</div>',
            args = { GetCharacterName(src), message }
        })
    end
end)

RegisterServerEvent('chat:server:ServerPSA')
AddEventHandler('chat:server:ServerPSA', function(message)
    TriggerClientEvent('chat:addMessage', -1, {
        template = '<div class="chat-message server">SERVER: {0}</div>',
        args = { message }
    })
    CancelEvent()
end)

function stringsplit(inputstr, sep)
	if sep == nil then
		sep = "%s"
	end
	local t={} ; i=1
	for str in string.gmatch(inputstr, "([^"..sep.."]+)") do
		t[i] = str
		i = i + 1
	end
	return t
end