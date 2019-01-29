/* global KLOUDLESS_APP_ID */
// Testing page SDK

/**
 * You can also use the following global variables to test SDK in dev tool:
 * window.sdk: the SDK object
 * window.account: the connected Account object
 * window.responseObj: the selected Response object in the dropdown
 * window.exceptionObj: the exception object from the latest request failure
 */

import kloudless from 'kloudless';

// cache account token so we don't need to reconnect on every hot reload
const cacheKey = `@kloudless/kloudless/${KLOUDLESS_APP_ID}/token`;

const scopeInput = document.getElementById('scope');
const message = document.getElementById('message');
message.value = '';


const objOptions = document.getElementById('obj');
const methodOptions = document.getElementById('method');
const requestOptions = document.getElementById('options');

window.sdk = kloudless;
window.account = null;

function addSelectOption(value, text, selected = false) {
  objOptions.innerHTML += (
    `<option value="${value}" ${selected ? 'selected' : ''}>${text}</option>`
  );
}

function resetSelectOptions() {
  objOptions.innerHTML = '';
  addSelectOption('sdk', 'SDK');
  if (window.account) {
    addSelectOption('account', 'Account', true);
  }
}
resetSelectOptions();

const token = sessionStorage.getItem(cacheKey);
if (token) {
  kloudless.verifyToken({
    appId: KLOUDLESS_APP_ID,
    token,
    initAccount: true,
  }).then((result) => {
    if (!result.valid) {
      message.value += `account connection failed: ${result.error}\n`;
      return;
    }
    window.account = result.account;
    message.value += 'account connected\n';
    resetSelectOptions();
  }).catch((exception) => {
    message.value += `account connection failed: ${exception}\n`;
  });
}


let responseObjMap = {

};

window.connectAccount = function connectAccount() {
  kloudless.connectAccount({
    scope: scopeInput.value,
    appId: KLOUDLESS_APP_ID,
  }).then((account) => {
    window.account = account;
    message.value += 'account connected\n';
    sessionStorage.setItem(cacheKey, account.token);
    responseObjMap = {};
    resetSelectOptions();
  });
};


function setResponseObjMap(response, selected) {
  const id = response.id || response.url;
  responseObjMap[id] = response;
  if (selected) {
    addSelectOption(id, response, true);
    objOptions.click();
  } else {
    addSelectOption(id, response);
  }
}

window.makeRequest = function makeRequest() {
  let obj;
  const { value } = objOptions;
  if (value === 'account' || value === 'sdk') {
    obj = window[value];
  } else {
    obj = responseObjMap[objOptions.value];
  }
  const options = JSON.parse(requestOptions.value);
  obj[methodOptions.value](options)
    .then((responseObj) => {
      message.value
        += `Request successful: ${methodOptions.value.toUpperCase()}`
        + ` ${responseObj.url}\n`;
      resetSelectOptions();
      responseObjMap = {};
      setResponseObjMap(responseObj, true);
      if (responseObj instanceof kloudless.ResourceList) {
        responseObj.objects.forEach((resource) => {
          setResponseObjMap(resource);
        });
      }
    }).catch((exception) => {
      window.exceptionObj = exception;
      message.value += `Request failed: ${exception}\n`;
    });
};

window.selectApiVersion = function selectApiVersion(select) {
  kloudless.setApiVersion(select.value);
};
document.getElementById('api-version').click();

const objDataDiv = document.getElementById('objData');
window.selectObj = function selectObj(select) {
  // show selected object's data
  let obj;
  if (select.value === 'account' || select.value === 'kloudless') {
    obj = window[select.value];
  } else {
    obj = responseObjMap[select.value];
    window.responseObj = obj;
  }
  let data;
  try {
    data = JSON.stringify(obj.data, null, 2);
  } catch (error) {
    /* eslint-disable-next-line */
    data = obj.data;
  }
  objDataDiv.innerHTML = data;
};
