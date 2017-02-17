# SmartApp Operations

## Getting the Device Lists/Current State
<b>Do not use for polling more than every 10 minutes</b>

API call:	
```
GET https://graph.api.smartthings.com:443/api/smartapps/installations/(Smartapp Installation)/devices?access_token=(API Key)
```
This will return a JSON structure with devices in an array called deviceList.
The device is broken in to capabilities, commands and attributes.
 * Capabilities are used to characterize the device and know the commands and attributes that should work on it.
 * Attributes are used to view the current value and are read only.
 * Commands are used to actually control the device.

You can get more information on what the commands and attributes mean based on the capabilities in the Smartthings Documentation.
For the Switch Level capability I'm showing here, you can see the documentation here: http://docs.smartthings.com/en/latest/capabilities-reference.html#switch-level

Here is an example device with some items removed for brevity:
```
	{
      "name": "Front Door Light 1",
      "basename": "GE Link Bulb",
      "deviceid": "f1cfb515-2674-4626-81ba-b03ada2fa907",
      "status": "ACTIVE",
      "manufacturerName": "GE_Appliances",
      "modelName": "ZLL Light",
      "lastTime": "2017-02-17T20:40:54+0000",
      "capabilities": {
        "Switch": 1,
		"Switch Level": 1
      },
      "commands": {
        "on": [],
        "setLevel": [
          "NUMBER",
          "NUMBER"
        ],
        "refresh": []
      },
      "attributes": {
        "switch": "on",
        "level": 99
      }
    }
```

## Running Commands
### Single Value Commands
For commands that don't have parameters, run the command:
```
POST https://graph.api.smartthings.com:443/api/smartapps/installations/(Smartapp Installation)/(DeviceID)/command/(Command To Run)?access_token=(API Key)
```
You'll get a reply like this:
```
{
  "status": "Success",
  "message": "Device Front Door Light 1, Command off"
}
```

### Multi Value Commands
For commands that have parameters, like the "setLevel" command above, pass the parameters through JSON.
```
POST https://graph.api.smartthings.com:443/api/smartapps/installations/(Smartapp Installation)/(DeviceID)/command/(Command To Run)?access_token=(API Key)
Body would be {value1:50, value2:100}
```
If it only has one value then you would omit value2.
This reply looks the same as above:
```
{
  "status": "Success",
  "message": "Device Front Door Light 1, Command setLevel"
}
```
## Getting Updates From SmartThings
### Receiving Hub Updates Directly
<b>Provides realtime notifications from the hub</b><BR />
To use this function, you have to start a web server on your device to listen for the updates.

You then send the IP and Port for the web server to the API:
```
GET https://graph.api.smartthings.com:443/api/smartapps/installations/(Smartapp Installation)/startDirect/(IP)/(PORT)?access_token=(API Key)
```

The SmartApp will immediately sent a dump of the /device API call:
```
POST http://(IP):(PORT)/initial
The Body is the JSON /device dump.
```
And when updates are generated, they are sent:
```
POST http://(IP):(PORT)/update
The Body is the JSON for the individual update.
```
Each update looks like this:
```
{
  "value": "off",
  "device": "f1cfb515-2674-4626-81ba-b03ada2fa907",
  "attribute": "switch",
  "date": "2017-02-17T21:34:44+0000"
}
```
This identifies the affected device, what attribute changed, the new value of that attribute and finally when the change occurred... in UTC.

The smartapp can only send to one IP/PORT and will attempt to send to that IP/PORT until it is changed. 
You can disable the update by sending a blank IP (Probably).


### Using PubNub For Update Notifications
<b>Provides realtime notifications without having direct hub communication</b><BR />


To use this function, you must have a Pubnub account. The free subscription works for most installations.
Enter the pubnub information into the smartapp configuration.
You can enter it directly into your own app as well or retrieve it with this call:
```
GET https://graph.api.smartthings.com:443/api/smartapps/installations/(Smartapp Installation)/getSubscriptionService?access_token=(API Key)
```
This will allow you to listen for the update message.
Each update looks like this:
```
{
  "status": "Success",
  "attributes": [
    {
      "value": "off",
      "device": "f1cfb515-2674-4626-81ba-b03ada2fa907",
      "attribute": "switch",
      "date": "2017-02-17T21:34:44+0000"
    }
  ]
}
```
This identifies the affected device, what attribute changed, the new value of that attribute and finally when the change occurred... in UTC.

### Updates-Only Fetching Through Subscriptions 
<b>Not recommended for more often than every 30 seconds</b><BR />
<b>If no requests have been made after 10 minutes it stop queueing device updates</b><BR />
You can retrieve only the updates from the API. This is done by subscribing to the updates. Updates are queued on the SmartApp until you request the queue.
```
GET https://graph.api.smartthings.com:443/api/smartapps/installations/(Smartapp Installation)/subscribe?access_token=(API Key)
```

It will reply with:
```
{
  "status": "Success"
}
```

Now you can fetch updates:
```
GET https://graph.api.smartthings.com:443/api/smartapps/installations/(Smartapp Installation)/getUpdates?access_token=(API Key)
```

It will return even if there are no updates:
```
{
  "status": "None"
}
```

Or if there are updates it will return:
```
{
  "status": "Success",
  "attributes": [
    {
      "value": "off",
      "device": "f1cfb515-2674-4626-81ba-b03ada2fa907",
      "attribute": "switch",
      "date": "2017-02-17T21:34:44+0000"
    }
  ]
}
```
This identifies the affected device, what attribute changed, the new value of that attribute and finally when the change occurred... in UTC.

When done you can either let the subscription time out or you can unsubscribe:
```
GET https://graph.api.smartthings.com:443/api/smartapps/installations/(Smartapp Installation)/unsubscribe?access_token=(API Key)
```

### Polling Device Information 
<b>Not recommended for more often than every 10 minutes</b><BR />

You can retrieve a specific device JSON by querying the API:
```
GET https://graph.api.smartthings.com:443/api/smartapps/installations/(Smartapp Installation)/(DeviceID)/query?access_token=(API Key)
```

Or you can query for a specific attribute through the API:
```
GET https://graph.api.smartthings.com:443/api/smartapps/installations/(Smartapp Installation)/(DeviceID)/attribute/(attributeName)?access_token=(API Key)
```

This method is not recommended for regular polling due to the strain it places on the SmartThings Infrastructure.

