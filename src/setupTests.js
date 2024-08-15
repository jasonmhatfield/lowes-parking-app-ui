import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
const { TextEncoder, TextDecoder } = require('util');

// Polyfill TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Enable fetch mocks
fetchMock.enableMocks();
