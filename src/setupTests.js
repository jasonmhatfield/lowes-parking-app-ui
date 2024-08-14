const { TextEncoder, TextDecoder } = require('util');
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

// Polyfill TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Enable fetch mocks
fetchMock.enableMocks();
