export const luaPubSub = `
__pubsub_events = {}

function subscribe(eventName, callback)
    if type(callback) ~= "function" then
        error("Callback must be a function")
        return
    end

    local evt = __pubsub_events[eventName] or {}
    table.insert(evt, callback)
    __pubsub_events[eventName] = evt
end

function unsubscribe(eventName, callback)
    local evt = __pubsub_events[eventName]
    if evt then
        for i, registered_callback in ipairs(evt) do
            if registered_callback == callback then
                table.remove(evt, i)
                break
            end
        end
    end
end

function dispatch(eventName, data)
    local evt = __pubsub_events[eventName] or {}
    for _idx, callback in ipairs(evt) do
        callback(data)
    end
end
`;
