


/**
 * This test suite is a mix of unit/integration tests
 * It starts with basic unit testing of components, then builds up into integration testing
 * higher level components
 */


// unit test example logger class
require('./logger.unit.tests')

// unit test external http functions
// require('./extHttp.unit.tests')

// unit test iHealth client class (uses extHttp.ts)
// require('./iHealth.unit.tests)



// unit test core mgmtClient
require('./mgmtClient.unit.tests')


// f5Client testing
//  - instantiation
//  - discovery
//  - events

// some basic testing of IPv6 usage
require('./f5Client_ipv6.int.tests')


// ucs sub-class tests 
require('./f5Device_ucs.int.tests')



// unit test core mgmtClient failures
require('./mgmtClient.failures.unit.test')