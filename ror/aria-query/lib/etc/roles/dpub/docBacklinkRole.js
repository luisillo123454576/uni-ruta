"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var docBacklinkRole = {
  abstract: false,
  accessibleNameRequired: true,
  baseConcepts: [],
  childrenPresentational: false,
  nameFrom: ['author', 'contents'],
  prohibitedProps: [],
  props: {
    'aria-errormessage': null,
    'aria-invalid': null
  },
  relatedConcepts: [{
    concept: {
      name: 'referrer [EPUB-SSV]'
    },
    module: 'EPUB'
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [['roletype', 'widget', 'command', 'link']]
};
var _default = exports.default = docBacklinkRole;