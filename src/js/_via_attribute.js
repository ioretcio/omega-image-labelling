/**
 *
 * @class
 * @classdesc Attribute
 * @author Abhishek Dutta <adutta@robots.ox.ac.uk>
 * @date 31 Dec. 2018
 *
 */

'use strict'

const _VIA_ATTRIBUTE_TYPE = { 'TEXT':1, 'CHECKBOX':2, 'RADIO':3, 'SELECT':4, 'IMAGE':5 };

const _VIA_ATTRIBUTE_ANCHOR = {
  'FILE1_Z0_XY1':'Spatial Region in an Image (e.g. bounding box of an object)',
};

function _via_attribute(name, anchor_id, type, desc, options, default_option_id) {
  this.aname     = name;
  this.anchor_id = anchor_id;
  this.type      = type;
  this.desc      = desc;
  this.options   = options;
  this.default_option_id = default_option_id;
}

