/*******************************************
* Static tests for the basic structure of the ubnt-mfi API.
*************************************************/

var assert = require('chai').assert
var mFi    = require('../index.js'), controller
var config = require('./config.json')

describe('ubnt-mfi', function(){
  //Check that the ubnt-mfi library was exported as a function
  it('should be a function', function(done){
    assert.isFunction(mFi); done()
  })
})

describe('naked instance of ubnt-mfi', function(){
  before(function(){ controller = new mFi({}) })

  //Check that our instance of ubnt-mfi is an object
  it('should be an object', function(done){
    assert.isObject(controller); done()
  })

  //Ensure public functions exist
  ;([
    'listAdmin', 'listAlarm', 'listSensors',
    'listScript', 'statDevice', 'statSysinfo'
  ]).forEach(function(fn){
    it('should have a ' +fn+ ' function', function(done){
      assert.isFunction(controller[fn]); done()
    })
    it(fn + ' should return a promise', function(done){
      assert.instanceOf(controller[fn](),Promise); done()
    })
  })

  //Ensure private functions exist
  ;(['_url', '_login', '_getUrl']).forEach(function(fn){
    it('should have a ' +fn+ ' function', function(done){
      assert.isFunction(controller[fn]); done()
    })
  })

  //Ensure private objects exist
  ;(['_options', '_J']).forEach(function(ob){
    it('should have a ' +ob+ ' object', function(done){
      assert.isObject(controller[ob]); done()
    })
  })

  //Check default values
  it('_options.protocol should be "https"', function(done){
    assert.equal(controller._options.protocol, 'https'); done()
  })
  it('_options.port should be 6443', function(done){
    assert.equal(controller._options.port, 6443); done()
  })
  it('_options.host should be localhost', function(done){
    //This is a required value, but let's test it anyway; why not?
    assert.equal(controller._options.host, 'localhost'); done()
  })
})

describe('Default values can be changed', function(){
  var args = {protocol: 'http', port: 90, username: 'testU', password: 'testP', host: 'testH'}

  before(function(){ controller = new mFi(args) })

  Object.keys(args).forEach(function(key){
    it(key + ' should be ' + args[key], function(done){
      assert.equal(controller._options[key], args[key])
      done()
    })
  })

})

describe('_url()', function(){
  //The order and values of args are critical as they correspond to the tests.
  var args = [
    {protocol: 'https', port: 6443, host: 'testH'},
    {protocol: 'http', port: 80, host: 'testH'},
    {protocol: 'https', port: 443, host: 'testH'}
  ]

  beforeEach(function(done){ controller = new mFi(args.shift()); done() })

  it('should combine protocol, port, host, and path', function(done){
    assert.equal(controller._url('/path'), 'https://testH:6443/path'); done()
  })
  it('should drop port when protocol is http and port is 80', function(done){
    assert.equal(controller._url('/'), 'http://testH/'); done()
  })
  it('should drop port when protocol is https and port is 443', function(done){
    assert.equal(controller._url('/'), 'https://testH/'); done()
  })
})

describe('flagrent network errors', function(){
  //The order and values of args are critical as they correspond to the tests.
  var args = [
    {port: -1},
    {host: null},
    {protocol: 'invalid'}
  ], result
  beforeEach(function(done){
    controller = new mFi(args.shift()); result = undefined
    controller.listAdmin().then(function(d){
      result = d; done()
    }, function(e){
      result = e; done()
    })
  })

  it('shoud fail when connecting to an invalid port', function(done){
    assert.equal(result, 'unrecoverable error'); done()
  })
  it('shoud fail when connecting to an invalid host', function(done){
    assert.equal(result, 'unrecoverable error'); done()
  })
  it('shoud fail when connecting with an invalid protocol', function(done){
    assert.equal(result, 'unrecoverable error'); done()
  })
})

/****************************************************
* The following tests will run against a real mFi controller, which means
* there needs to be an mFi controller running for these tests to complete.
* See config.json, which must contain valid settings relevant to the mFi
* controller used for testing.
**********************************************/
describe('authentication', function(){
  /****************************************
  * These tests are for the _login function, which will resolve a promise
  * if successful, and reject a promise otherwise.
  **********************************************************/
  var args = [
    {host: config.host},
    {host: config.host, username: config.username, password: config.password}
  ], result
  beforeEach(function(done){
    controller = new mFi(args.shift()); result = undefined
    controller._login().then(function(d){
      result = true; done()
    }, function(e){
      result = false; done()
    })
  })

  it('should fail with invalid credentials', function(done){
    assert.typeOf(result, 'boolean')
    assert.equal(result, false)
    done()
  })
  it('should succeed with valid credentials', function(done){
    assert.typeOf(result, 'boolean')
    assert.equal(result, true)
    done()
  })
})

describe('listAdmin', function(){
  var result
  before(function(done){
    controller = new mFi(config)
    controller.listAdmin().then(function(d){
      result = d; done()
    }, function(e){
      result = e; done()
    })
  })

  it('should be properly structured', function(done){
    assert.instanceOf(result, Array)

    var structure = {
      _id: 'isString',
      lang: 'isString',
      name: 'isString',
      x_password: 'isString'
    }
    for(var i=0; i<result.length; i++){
      assert.typeOf(result[i], 'object')
      for(var k in structure) assert[structure[k]](result[i][k], k)
    }
    done()
  })
})

describe('listSensors', function(){
  var result
  before(function(done){
    controller = new mFi(config)
    controller.listSensors().then(function(d){
      result = d; done()
    }, function(e){
      result = e; done()
    })
  })

  it('should be properly structured', function(done){
    assert.instanceOf(result, Array)
    var structure = {
      _id: 'isString',
      fovangle: 'isNumber',
      fovradius: 'isNumber',
      fovrotation: 'isNumber',
      label: 'isString',
      locked: 'isBoolean',
      mac: 'isString',
      map_id: 'isString',
      model: 'isString',
      port: 'isString',
      tag: 'isString',
      temperature: 'isNumber',
      val: 'isNumber',
      x: 'isNumber',
      y: 'isNumber'
    }
    for(var i=0; i<result.length; i++){
      assert.typeOf(result[i], 'object')
      for(var k in structure){
        if(result[i][k] !== null) assert[structure[k]](result[i][k], k)
      }
      assert.instanceOf(result[i].rpt_time, Date, 'rpt_time')
      assert.instanceOf(result[i].val_time, Date, 'val_time')
    }
    done()
  })
})