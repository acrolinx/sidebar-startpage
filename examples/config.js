'use strict';


var basicConf = {
  sidebarContainerId: 'sidebarContainer',
  //See: https://acrolinx.github.io/sidebar-sdk-js/pluginDoc/interfaces/_acrolinx_libs_plugin_interfaces_.initparameters.html
  serverAddress: 'https://test-next-ssl.acrolinx.com/',
  //You'll get the clientSignature for your integration after a successful certification meeting.
  //See: https://support.acrolinx.com/hc/en-us/articles/205687652-Getting-Started-with-Custom-Integrations
  clientSignature: 'SW50ZWdyYXRpb25EZXZlbG9wbWVudERlbW9Pbmx5',

  /**
   * This callback can be used to set the documentReference.
   * It is called in the moment when the document is checked.
   * The default value is window.location.href.
   * In a CMS the link to the article might be a good documentReference.
   * On other cases the full file name might be a good option.
   * @return {string}
   */
  getDocumentReference: function () {
    return window.location.href;
  },

  /**
   * This optional function will be called after a successful check,
   * if Embed Check Data is enabled on the Acrolinx core server.
   * It’s the task of the integration to save the data in a suitable place.
   */
  // onEmbedCheckData: function (checkData, format) {
  //   console.log('Embed Check Data', checkData, format);
  // },

  //uiMode: 'noOptions',
  //clientLocale: 'en'
  //helpUrl: 'https://www.acrolinx.com',
  //showServerSelector: true,
  //readOnlySuggestions: true,
  sidebarUrl: location.protocol + '//' + location.host + '/app/',

  //enableSingleSignOn: true, //see: https://github.com/acrolinx/acrolinx-proxy-sample

  // clientComponents: [
  //   {
  //     id: 'com.acrolinx.sidebarexample',
  //     name: 'Acrolinx Sidebar Example Client',
  //     version: '1.2.3.999',
  //     category: 'MAIN'
  //   },
  //   {
  //     id: 'com.acrolinx.somecms',
  //     name: 'My CMS',
  //     version: '1.2.3.999'
  //   },
  //   {
  //     id: 'com.acrolinx.somelib',
  //     name: 'Referenced Lib',
  //     version: '1.0.0.0',
  //     category: 'DETAIL'
  //   },
  //   {
  //     id: 'com.acrolinx.anotherlib',
  //     name: 'Another Referenced Lib',
  //     version: '0.0.0.1',
  //     category: 'DETAIL'
  //   }
  // ]

  // This settings will overwrite the saved settings of the user.
  //checkSettings: {
  //  'profileId': 'bb276e04-1d75-11e9-9641-484d7eb8db4f'
  //}

  // If checkSettings is defined then the defaultCheckSettings will be ignored.
  //defaultCheckSettings: {
  //  'profileId': 'bc07ea88-1d75-11e9-8906-484d7eb8db4f'
  //}

};





