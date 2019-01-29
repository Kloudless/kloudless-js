/* global VERSION */

import Response from 'response';
import Account from 'account';
import ResourceList from 'resource-list';
import Resource from 'resource';
import Binary from 'binary';
import base from 'base';
import { httpMethods } from 'mixins';
import axios from 'axios-instance';

const sdk = {
  Account,
  ResourceList,
  Resource,
  Response,
  Binary,
  axios,
  version: VERSION,
};

Object.assign(sdk, base);
Object.assign(sdk, httpMethods);

export default sdk;
