// Keep the Users object consistent among device drivers... since we clear the driver's base module cache for each driver.
// This value will stay cached in Node...

var APIConfig = require('./APIConfig');
var console   = require('./APIUtil.js').console;
var Firebase  = require("firebase");

var UserConfig = function () {

  // Object which will synchronize with the Firebase User's Object
  var Users = {};

  // The Firebase location for users as defined in configuration:
  var UsersFirebase = new Firebase(APIConfig.general.firebaseRootURI + '/' + APIConfig.general.firebaseUserPath);

  // Set Users equal to the firebase users object (initialize)
  UsersFirebase.once("value", function (usersData) {
    Users = usersData.val();
  })

  // When a change is made in firbase, change it in Users
  UsersFirebase.on("child_changed", function (child) {
    var childData = child.val();
    Users[child.name()] = childData;
  });

  // When a user is removed in firebase, remove it in Users
  UsersFirebase.on("child_removed", function (child) {
    delete Users[child.name()];
  });

  // this.Users = Users
  // Non-configurable, writable, but enumerable
  Object.defineProperty(this, "users", {

      get: function () { return Users; },
      configurable: false,
      enumerable: true,

  }); // End Object.defineProperty

  /**
   * Function which devices call when their settings are initialized,
   * to ensure that each user has the device's settings.
   * @param device - The device which calls this function
   */
  Object.defineProperty(this, "update", {

      value: function (device) {

        UsersFirebase.on("child_added", function (child) {

          var childData = child.val();
          // If there's no "device_configs" key for the user, create it:
          if(!childData[APIConfig.general.firebaseUserSettingsPath]) childData[APIConfig.general.firebaseUserSettingsPath] = {};

          // If there's no "device_configs/[mac]" key for the user and device, create it:
          if(!childData[APIConfig.general.firebaseUserSettingsPath][device.mac]) {
            childData[APIConfig.general.firebaseUserSettingsPath][device.mac] = {};
            childData[APIConfig.general.firebaseUserSettingsPath][device.mac].setEqual(device.settings);
          }

          Users[child.name()] = childData;
          UsersFirebase.update(Users);

        }); // End UserFirebase.on()

      }, // End value()

      configurable: false,
      writable: false,
      enumerable: true,

    }); // End Object.defineProperty


} // End UserConfig Module

// Inherit from the EventEmitter
require('util').inherits(UserConfig, require('events').EventEmitter);

// Export the module
module.exports = new UserConfig;