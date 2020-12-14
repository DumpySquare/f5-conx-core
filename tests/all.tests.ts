

/**
 * This test suite is a mix of unit/integration tests
 * It starts with basic unit testing of components, then builds up into integration testing
 * higher level components
 */


 // set env vars for the tests
process.env.F5_CONX_CORE_TCP_TIMEOUT = "3000"
process.env.F5_CONX_CORE_LOG_LEVEL = "debug"
process.env.F5_CONX_CORE_LOG_BUFFER = "true"
process.env.F5_CONX_CORE_LOG_CONSOLE = "false"

// unit test example logger class
require('./logger.unit.tests')

// unit test external http functions
// require('./extHttp.unit.tests')

// unit test iHealth client class (uses extHttp.ts)
// require('./iHealth.unit.tests)

// unit test core mgmtClient failures
require('./mgmtClient.failures.unit.test')


// unit test core mgmtClient
require('./mgmtClient.unit.tests')


// f5Client testing
//  - instantiation
//  - discovery
//  - events

// some basic testing of IPv6 usage
require('./f5Client_ipv6.int.tests')


// ucs sub-class tests 
require('./f5Client_ucs.int.tests')


