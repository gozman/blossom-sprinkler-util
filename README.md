# blossom-sprinkler-util
A command line utility for issuing simple commands to the Blossom sprinkler controller. Based on a reverse-engineered private API

## How to use
Set the following variables in your environment (or use a .env file)

 * BLOSSOM_USER
 * BLOSSOM_PASSWORD
 * CONTROLLER_ID 

### Command line arguments

```
$ node ./myblossom.js --help

  Usage: myblossom [options]

  Options:

    -V, --version         output the version number
    -v, --valve [number]  Valve number to switch on
    -t, --time [seconds]  Time to run sprinkler in seconds
    -s, --stop            Stop all watering
    -h, --help            output usage information
```

### Usage example

```
$ node ./myblossom.js -v 3 -t 20
Sent command to start Street (3)  for 20 seconds
```
