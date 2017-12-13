/*
Copyright 2016 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
importScripts('workbox-sw.dev.v2.0.0.js');

const workboxSW = new WorkboxSW();
workboxSW.precache([]);

// fonts
workboxSW.router.registerRoute('https://fonts.googleapis.com/(.*)',
  workboxSW.strategies.cacheFirst({
    cacheName: 'googleapis',
    cacheExpiration: {
      maxEntries: 20
    },
    cacheableResponse: {statuses: [0, 200]}
  })
);

// images
workboxSW.router.registerRoute(/\.(?:png|gif|jpg)$/,
  workboxSW.strategies.cacheFirst({
    cacheName: 'images-cache',
    cacheExpiration: {
      maxEntries: 50
    }
  })
);

// icons
workboxSW.router.registerRoute('/images/icon/*',
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: 'icon-cache',
    cacheExpiration: {
      maxEntries: 20
    }
  })
);

// network first
var dashboardHandler = workboxSW.strategies.networkFirst({
  cacheName: 'dashboard-cache',
  cacheExpiration: {
    maxEntries: 50
  }
});

workboxSW.router.registerRoute('/dashboard.ejs', args => {
  return dashboardHandler.handle(args).then(response => {
    if (!response) {
      return caches.match('/offline.html');
    } else if (response.status === 404) {
      return caches.match('/404.html');
    }
    return response;
  });
});

var informationsHandler = workboxSW.strategies.networkFirst({
  cacheName: 'informations',
  cacheExpiration: {
    maxEntries: 50
  }
});

workboxSW.router.registerRoute('/informations.ejs', args => {
  return informationsHandler.handle(args).then(response => {
    if (!response) {
      return caches.match('/offline.ejs');
    } else if (response.status === 404) {
      return caches.match('/404.ejs');
    }
    return response;
  });
});