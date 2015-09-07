## Install ##

```bash
npm install ubnt-mfi
```

## Example ##

```javascript
const mFi = require('ubnt-mfi')

var controller = new mFi({
  host    : '192.168.1.7',
  username: 'nodejs',
  password: 'password'
})
controller.listSensors().then(function(sensors){
  console.dir(sensors)
}, function(e){
  console.log("Failed:",e)
})
```
## API ##

##### INSTANTIATION #####
```javascript
var controller = new mFi({
  //REQUIRED:
  host    : //string: hostname or IP
  username: //string: admin username
  password: //string: admin password
  //OPTIONAL:
  protocol: //string : https (default) or http
  port    : //integer: default is 6443
})
```

##### FUNCTIONS #####

Calling a function will return a promise. If the promise is successful, the data returned by mFi will be converted to an object literal with some basic type fixes (date values will become date objects).

```javascript
controller.listSensors().then(/* promise functions go here! */)
```

If the promise fails, either 'not authorized' or 'unrecoverable error' will be returned, the former indicating an authentication failure and the latter serving to generalize all other manner of failures including host not found, address unavailable, connection refused, etc.

Please understand this library is based on an undocumented API. We've implemented some discovered functions, but haven't yet taken time to detail their arguments or reply values.

* [listAdmin](#)
* [listAlarm](#)
* [listSensors](#)
* [listScript](#)
* [statDevice](#)
* [statSysinfo](#)

## Background ##

We prefer [insteon](http://insteon.com/) for home automation, which is oriented towards enthusiast developers and offers a rich ecosystem of devices. There is a lot of exciting stuff happening in the automation/IoT market and we look forward to seeing what the [thread group](http://threadgroup.org/) brings out. We needed a way to integrate an mFi temperature sensor with existing automation logic, which was the impetus for creating this library.

##### WHAT #####

[mFi](https://www.ubnt.com/enterprise/#mfi) is ubiquiti's machine-to-machine control and automation system. With mFi, you can control power outlets, relays, and serial devices while collecting data from various sensors including temperature, motion, electrical current, and contact sensors (door/window).

This is a nodejs library for polling data from an mFi controller. mFi devices need to be connected to (and configured in) an mFi controller; this library will communicate with the mFi controller and expose the data collected from the devices connected to it so that you can use that data in your own nodejs application.

##### WHY #####

This is a bit of a po-TAY-to / po-TAH-to question. There are two ways to look at how to integrate mFi with other automation equipment. mFi is great by itself and can be used as the master controller capable of leveraging custom sensors as well as URL actions. Both of these features help mFi expand the automation realm beyond the devices and systems offered by ubiquiti.

But we preferred a different design where an independent master controller collects data from mFi as if it were just another network element. With this approach, we don't have to write action triggers in mFi and can consolidate control logic on a separate system.

##### HOW #####

How indeed. Ubiquiti has a lot of interesting things going on with their unifi line, but they haven't put a lot of effort into advancing the mFi product line. There is an API exposed through the mFi controller, but it's not published and not supported by ubiquiti. We've reverse-engineered portions of that API by watching network traffic through chrome browser while navigating an mFi controller.

## LICENSE ##
![LGPLv3](http://www.gnu.org/graphics/lgplv3-88x31.png)
