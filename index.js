//Copyright 2015 Savannah Scriptworks
/*******************************************************************************
This file is part of node-ubnt-mfi.

node-ubnt-mfi is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

node-ubnt-mfi is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with node-ubnt-mfi.  If not, see <http://www.gnu.org/licenses/>.
*******************************************************************************/
const extend  = require('extend')
const request = require('request')

function mFi(args){
  this._J       = request.jar()
  this._options = {
    protocol: 'https',
    port    : 6443,
    host    : 'localhost',
    username: '',
    password: ''
  }
  if(args instanceof Object) extend(this._options, args)
}

mFi.prototype._url = function(path){
  //This function takes a path and turns it into a full URL.
  var url  = this._options.protocol + '://' + this._options.host
  var port = ':' + this._options.port
  if(this._options.protocol == 'http'  && this._options.port == 80 ) port = ''
  if(this._options.protocol == 'https' && this._options.port == 443) port = ''
  return url + port + path
}
mFi.prototype._login = function(){
  var that = this
  return new Promise(function(resolve, reject){
    request.post({
      timeout: 1500,
      strictSSL: false,
      url: that._url('/login'),
      jar: that._J,
      form: {username: that._options.username, password: that._options.password, login: 'Login'}
    }, function(e,r,b){
      if(e) return reject(e)
      if(r.statusCode == 302 && r.headers.location == that._url('/manage')) return resolve()
      reject(r.statusCode)
    })
  })
}

mFi.prototype._getUrl = function(url){
  /**********************************************************
  * This is an abstraction of a process for getting a URL asychronously. If
  * the server replies `unauthorized` one attempt will be made to login
  * followed by a reattempt to get the URL.
  ********************************/
  var that = this //context shift imminent.
  function getURL(){
    /************************************
    * This local function gets the desired URL
    **************************************************/
    return new Promise(function(resolve, reject){
      request.get({
        timeout: 1500, strictSSL: false, url: that._url(url), jar: that._J
      }, function(e,r,b){
        if(e) return reject(e)
        if(r.statusCode == 200) return resolve(reformat(b))
        reject(r.statusCode)
      })
    })
  }
  return new Promise(function(resolve, reject){
    /**************************
    * This promise function wraps up the local getURL function
    * with one reattempt if the server replies with a 403 reject.
    *************************************************************/
    getURL().then(resolve, function(code){
      if(code == 403){
        that._login().then(function(){
          getURL().then(resolve, function(){ reject('unrecoverable error') })
        },function(){ reject('not authorized') })
      }else reject('unrecoverable error')
    })
  })
}

mFi.prototype.listAdmin = function(){
  return this._getUrl('/api/v1.0/list/admin')
}
mFi.prototype.listAlarm = function(){
  return this._getUrl('/api/v1.0/list/alarm')
}
mFi.prototype.listSensors = function(){
  return this._getUrl('/api/v1.0/list/sensors')
}
mFi.prototype.listScript = function(){
  return this._getUrl('/api/v1.0/list/script')
}
mFi.prototype.statDevice = function(){
  return this._getUrl('/api/v1.0/stat/device')
}
mFi.prototype.statSysinfo = function(){
  return this._getUrl('/api/v1.0/stat/sysinfo')
}

/*
TODO: arguments
TODO: Other API calls we've seen:

/api/v1.0/list/defined_sensors
/api/v2.0/schedule
/api/v1.0/list/liveview
/api/v1.0/list/event?limit=500&purpose=recentEvent&sort=desc&startTime=-604800000
/api/v1.0/list/setting?fmt=json
/api/v2.0/conditionset
/api/v2.0/scene
/api/v1.0/list/nearest?fmt=json&times=1438401600000,1441080000000&tag=energy_sum
/api/v1.0/list/rulesets?fmt=json
/api/v1.0/list/map
/api/v1.0/data/m2mgeneric_by_id?fmt=json&ids=[space (%20) delimited list of ids]&tags=temperature&indices=1,2,3,4&collection=null&func=trend&startTime=1441512000000&endTime=1441568809880
*/


module.exports = mFi

function reformat(data){
  try{
    data = JSON.parse(data).data
    for(var i=0; i<data.length; i++){
      if(data[i].val_time) data[i].val_time = new Date(data[i].val_time)
      if(data[i].rpt_time) data[i].rpt_time = new Date(data[i].rpt_time)
    }
    return data
  }catch(e){
    return null
  }
}