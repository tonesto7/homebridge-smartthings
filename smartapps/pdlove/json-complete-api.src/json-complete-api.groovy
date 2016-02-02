/**
 *  JSON Complete API
 *
 *  Copyright 2016 Paul Lovelace
 *
 */
definition(
    name: "JSON Complete API",
    namespace: "pdlove",
    author: "Paul Lovelace",
    description: "API for JSON with complete set of devices",
    category: "SmartThings Labs",
    iconUrl: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience.png",
    iconX2Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png",
    iconX3Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png",
    oauth: true)


preferences {
    page(name: "copyConfig")
}

def copyConfig() {
    if (!state.accessToken) {
        createAccessToken()
    }
    dynamicPage(name: "copyConfig", title: "Config", install:true, uninstall:true) {
        section("Select devices to include in the /devices API call") {
            input "deviceList", "capability.refresh", title: "All Devices", multiple: true, required: false
        }

        section() {
            paragraph "View this SmartApp's configuration to use it in other places."
            href url:"${apiServerUrl("/api/smartapps/installations/${app.id}/config?access_token=${state.accessToken}")}", style:"embedded", required:false, title:"Config", description:"Tap, select, copy, then click \"Done\""
        }

        section() {
        	paragraph "View the JSON generated from the installed devices."
            href url:"${apiServerUrl("/api/smartapps/installations/${app.id}/devices?access_token=${state.accessToken}")}", style:"embedded", required:false, title:"Device Results", description:"View accessories JSON"
        }
    }
}

def installed() {
	log.debug "Installed with settings: ${settings}"
	initialize()

}

def updated() {
	log.debug "Updated with settings: ${settings}"

	unsubscribe()
	initialize()
}

def initialize() {
	if(!state.accessToken) {
         createAccessToken()
    }
}


def authError() {
    [error: "Permission denied"]
}

def renderConfig() {
    def configJson = new groovy.json.JsonOutput().toJson([
        description: "JSON API",
        platforms: [
            [
                platform: "SmartThings",
                name: "SmartThings",
                app_url: apiServerUrl("/api/smartapps/installations/"),
                app_id: app.id,
                access_token:  state.accessToken
            ]
        ],
    ])

    def configString = new groovy.json.JsonOutput().prettyPrint(configJson)
    render contentType: "text/plain", data: configString
}

def authorizedDevices() {
    [
        deviceList: deviceList
    ]
}

def CommandReply(statusOut, messageOut) {
	def replyData = 
    	[
        	status: statusOut,
            message: messageOut
        ]
        
    def replyJson    = new groovy.json.JsonOutput().toJson(replyData)
    render contentType: "application/json", data: replyJson  
}

def deviceCommand() {
  log.info("Command Request")
  def device  = deviceList.find { it.id == params.id }
  def command = params.command
  if (!device) {
  	  log.error("Device Not Found")
      CommandReply("Failure", "Device Not Found")
  } else if (!device.hasCommand(command)) {
      log.error("Device "+device.displayName+" does not have the command "+command)
      CommandReply("Failure", "Device "+device.displayName+" does not have the command "+command)
  } else {
      def value1 = request.JSON?.value1
      def value2 = request.JSON?.value2
      try {
      	if (value2) {
	        device."$command"(value1,value2)
	    } else if (value1) {
	    	device."$command"(value1)
	    } else {
	    	device."$command"()
	    }
        log.info("Command Successful for Device "+device.displayName+", Command "+command)
        CommandReply("Success", "Device "+device.displayName+", Command "+command)
      } catch (e) {
      	log.error("Error Occurred For Device "+device.displayName+", Command "+command)
 	    CommandReply("Failure", "Error Occurred For Device "+device.displayName+", Command "+command)
      }
  }
}


def deviceAttribute() {
  def device    = deviceList.find { it.id == params.id }
  def attribute = params.attribute
  if (!device) {
      httpError(404, "Device not found")
  } else {
      def currentValue = device.currentValue(attribute)
      [currentValue: currentValue]
  }
}

def deviceQuery() {
  def device    = deviceList.find { it.id == params.id }
  if (!device) {
      httpError(404, "Device not found")
  } else {
 	def deviceData = 
                [
                    name: device.displayName,
            		deviceid: device.id,
            		capabilities: deviceCapabilityList(device),
            		commands: deviceCommandList(device),
            		attributes: deviceAttributeList(device)
                ]       
    
    def deviceJson    = new groovy.json.JsonOutput().toJson(deviceData)
    render contentType: "application/json", data: deviceJson  
    }
}

def deviceCapabilityList(device) {
  def i=0
  device.capabilities.collectEntries { capability->
    [
      (capability.name):1
    ]
  }
}

def deviceCommandList(device) {
  def i=0
  device.supportedCommands.collectEntries { command->
    [
      (command.name): (command.arguments)
    ]
  }
}

def deviceAttributeList(device) {
  device.supportedAttributes.collectEntries { attribute->
    [
      (attribute.name): device.currentValue(attribute.name)
    ]
  }
}
        	
def renderDevices() {
    def deviceData = authorizedDevices().collectEntries { devices->
        [
            (devices.key): devices.value.collect { device->
                [
                    name: device.displayName,
            		deviceid: device.id,
            		capabilities: deviceCapabilityList(device),
            		commands: deviceCommandList(device),
            		attributes: deviceAttributeList(device)
                ]
            }
        ]
    }
    def deviceJson    = new groovy.json.JsonOutput().toJson(deviceData)
    render contentType: "application/json", data: deviceJson
}
mappings {
    if (!params.access_token || (params.access_token && params.access_token != state.accessToken)) {
        path("/devices")                        { action: [GET: "authError"] }
        path("/config")                         { action: [GET: "authError"] }
        path("/location")                       { action: [GET: "authError"] }
        path("/:id/command/:command")     		{ action: [POST: "authError"] }
        path("/:id/attribute/:attribute") 		{ action: [GET: "authError"] }
    } else {
        path("/devices")                        { action: [GET: "renderDevices"] }
        path("/config")                         { action: [GET: "renderConfig"]  }
        path("/location")                       { action: [GET: "renderLocation"] }
        path("/:id/command/:command")     		{ action: [POST: "deviceCommand"] }
        path("/:id/query")						{ action: [GET: "deviceQuery"] }	
        path("/:id/attribute/:attribute") 		{ action: [GET: "deviceAttribute"] }
    }
}