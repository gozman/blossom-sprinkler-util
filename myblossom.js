#!/usr/bin/env node

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

require('dotenv').config()
var program = require('commander');
const request = require('superagent');
var access_token = "Bearer ";
var valves = {"valves":[0,0,0,0,0,0,0,0,0,0,0,0]};
var valveLabels = ["Front Gate", "Back Gate", "Street", "Pool", "Unassigned", "Unassigned", "Unassigned", "Unassigned", "Unassigned", "Shed"]
var opPromise;

program
  .version('0.1.0')
  .option('-v, --valve [number]', 'Valve number to switch on')
  .option('-t, --time [seconds]', 'Time to run sprinkler in seconds')
  .option('-s, --stop', 'Stop all watering')
  .parse(process.argv);

function startValve(valve, time) {
  return new Promise(function(resolve, reject) {
    request
      .post("https://home.myblossom.com/api/v2/oauth2/login/")
      .send({"email":process.env.BLOSSOM_USER,"password":process.env.BLOSSOM_PASSWORD})
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        //Collect the access token
        if(res.body.access_token && !err) {
          access_token += res.body.access_token;
          valves.valves[program.valve-1] = program.time;

          request
            .put("https://home.myblossom.com/api/v2/controller/" + process.env.CONTROLLER_ID + "/setvalve-many/")
            .set('Authorization', access_token)
            .set('Content-Type', 'application/json')
            .send(valves)
            .end((err, res) => {
              if(err) {
                reject(err);
              } else {
                resolve("Sent command to start " + valveLabels[program.valve-1] + " (" + program.valve + ")" + " for " + program.time + " seconds");
              }
            });
        } else {
          reject(err);
        }
      });
  });
}

function stopSystem(valve, time) {
  return new Promise(function(resolve, reject) {
    request
      .post("https://home.myblossom.com/api/v2/oauth2/login/")
      .send({"email":process.env.BLOSSOM_USER,"password":process.env.BLOSSOM_PASSWORD})
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        //Collect the access token
        if(res.body.access_token && !err) {
          access_token += res.body.access_token;

          request
            .put("https://home.myblossom.com/api/v2/controller/" + process.env.CONTROLLER_ID + "/setvalve/")
            .set('Authorization', access_token)
            .set('Content-Type', 'application/json')
            .send({"valve":0})
            .end((err, res) => {
              if(err) {
                reject(err);
              } else {
                resolve("Stopped sprinkler system")
              }
            });
        } else {
          reject(err);
        }
      });
  });
}

if(program.valve) {
  if(!program.time) {
    console.log('Must specify a time for activating the valve with -t');
    process.exit(1);
  } else {
    opPromise = startValve();
  }
} else if(program.stop) {
  opPromise = stopSystem();
}

if(opPromise) {
  opPromise.then(function(res) {
    console.log(res);
  }).catch(function(err) {
    console.log(err);
  });
}
