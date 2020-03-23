// configuration
`use strict`;

const
  version = '2.0.0',
  CACHE = version + '::PWAsite',
  offlineURL = '/offline/',
  installFilesEssential = [
    "/CreativeProjects/Dashboard/modules/colorConfig/index.js",
    "/CreativeProjects/Dashboard/modules/drawConfig/index.js",
    "/CreativeProjects/Dashboard/modules/drawConfig/init.js",
    "/CreativeProjects/Dashboard/modules/DrawingInfo.js",
    "/CreativeProjects/Dashboard/modules/EventHandlers/adjustCanvas.js",
    "/CreativeProjects/Dashboard/modules/EventHandlers/body.js",
    "/CreativeProjects/Dashboard/modules/EventHandlers/canvasBox.js",
    "/CreativeProjects/Dashboard/modules/EventHandlers/canvasWrap.js",
    "/CreativeProjects/Dashboard/modules/EventHandlers/colorEVENT.js",
    "/CreativeProjects/Dashboard/modules/EventHandlers/EVENT.js",
    "/CreativeProjects/Dashboard/modules/EventHandlers/rotateDrop.js",
    "/CreativeProjects/Dashboard/modules/EventHandlers/stretchEVENT.js",
    "/CreativeProjects/Dashboard/modules/EventHandlers/target.js",
    "/CreativeProjects/Dashboard/modules/EventHandlers/tool.js",
    "/CreativeProjects/Dashboard/modules/EventHandlers/wrapDiv.js",
    "/CreativeProjects/Dashboard/modules/lineConfig/index.js",
    "/CreativeProjects/Dashboard/modules/RichBase.js",
    "/CreativeProjects/Dashboard/modules/Shapes.js",
    "/CreativeProjects/Dashboard/modules/stretchConfig/index.js",
    "/CreativeProjects/Dashboard/modules/stretchConfig/init.js",
    "/CreativeProjects/Dashboard/modules/toolMenu.js",
    "/CreativeProjects/Dashboard/modules/tools/drawImage.js",
    "/CreativeProjects/Dashboard/modules/tools/drawLine.js",
    "/CreativeProjects/Dashboard/modules/tools/drawShape.js",
    "/CreativeProjects/Dashboard/modules/tools/file.js",
    "/CreativeProjects/Dashboard/modules/tools/fill.js",
    "/CreativeProjects/Dashboard/modules/tools/fillText.js",
    "/CreativeProjects/Dashboard/modules/tools/magnify.js",
    "/CreativeProjects/Dashboard/modules/tools/moreShape.js",
    "/CreativeProjects/Dashboard/modules/tools/moveStretch.js",
    "/CreativeProjects/Dashboard/modules/tools/paste.js",
    "/CreativeProjects/Dashboard/modules/tools/pasteImage.js",
    "/CreativeProjects/Dashboard/modules/tools/straw.js",
    "/CreativeProjects/Dashboard/modules/tools/virtualBox.js",
    "/CreativeProjects/Dashboard/modules/Transform.js",
    "/CreativeProjects/Dashboard/utils/Base.js",
    "/CreativeProjects/Dashboard/utils/ClassFactory.js",
    "/CreativeProjects/Dashboard/utils/Client.js",
    "/CreativeProjects/Dashboard/utils/common.js",
    "/CreativeProjects/Dashboard/utils/EventUtil.js",
    "/CreativeProjects/Dashboard/utils/Observer.js",
    "/CreativeProjects/Dashboard/utils/require.js",
    "/CreativeProjects/Dashboard/utils/tools.js",
    "/CreativeProjects/Dashboard/images/180.gif",
    "/CreativeProjects/Dashboard/images/180.png",
    "/CreativeProjects/Dashboard/images/area-pos.gif",
    "/CreativeProjects/Dashboard/images/brush.png",
    "/CreativeProjects/Dashboard/images/brush1.png",
    "/CreativeProjects/Dashboard/images/brush2.png",
    "/CreativeProjects/Dashboard/images/brush3.png",
    "/CreativeProjects/Dashboard/images/brush4.png",
    "/CreativeProjects/Dashboard/images/brush5.png",
    "/CreativeProjects/Dashboard/images/brush6.png",
    "/CreativeProjects/Dashboard/images/brush7.png",
    "/CreativeProjects/Dashboard/images/brush8.png",
    "/CreativeProjects/Dashboard/images/brush9.png",
    "/CreativeProjects/Dashboard/images/circle.gif",
    "/CreativeProjects/Dashboard/images/copy.gif",
    "/CreativeProjects/Dashboard/images/ctrl/all.jpg",
    "/CreativeProjects/Dashboard/images/cut-copy.gif",
    "/CreativeProjects/Dashboard/images/cut.gif",
    "/CreativeProjects/Dashboard/images/cut1.gif",
    "/CreativeProjects/Dashboard/images/delect.gif",
    "/CreativeProjects/Dashboard/images/drop/1.gif",
    "/CreativeProjects/Dashboard/images/drop/10.gif",
    "/CreativeProjects/Dashboard/images/drop/11.gif",
    "/CreativeProjects/Dashboard/images/drop/2.gif",
    "/CreativeProjects/Dashboard/images/drop/3.gif",
    "/CreativeProjects/Dashboard/images/drop/4.gif",
    "/CreativeProjects/Dashboard/images/drop/5.gif",
    "/CreativeProjects/Dashboard/images/drop/6.gif",
    "/CreativeProjects/Dashboard/images/drop/7.gif",
    "/CreativeProjects/Dashboard/images/drop/8.gif",
    "/CreativeProjects/Dashboard/images/drop/9.gif",
    "/CreativeProjects/Dashboard/images/drop/list.gif",
    "/CreativeProjects/Dashboard/images/drop-parse.gif",
    "/CreativeProjects/Dashboard/images/drop-source.gif",
    "/CreativeProjects/Dashboard/images/drop.png",
    "/CreativeProjects/Dashboard/images/erase.gif",
    "/CreativeProjects/Dashboard/images/fill.gif",
    "/CreativeProjects/Dashboard/images/fill2.gif",
    "/CreativeProjects/Dashboard/images/fill2.png",
    "/CreativeProjects/Dashboard/images/hr.gif",
    "/CreativeProjects/Dashboard/images/l90.gif",
    "/CreativeProjects/Dashboard/images/magnifier.gif",
    "/CreativeProjects/Dashboard/images/new-area-pos.gif",
    "/CreativeProjects/Dashboard/images/oppselect.gif",
    "/CreativeProjects/Dashboard/images/oppselect.png",
    "/CreativeProjects/Dashboard/images/outline.gif",
    "/CreativeProjects/Dashboard/images/paste.jpg",
    "/CreativeProjects/Dashboard/images/paste1.gif",
    "/CreativeProjects/Dashboard/images/paste1.jpg",
    "/CreativeProjects/Dashboard/images/paste2.jpg",
    "/CreativeProjects/Dashboard/images/pen-bw.gif",
    "/CreativeProjects/Dashboard/images/pen.gif",
    "/CreativeProjects/Dashboard/images/position.gif",
    "/CreativeProjects/Dashboard/images/r90.gif",
    "/CreativeProjects/Dashboard/images/redo.gif",
    "/CreativeProjects/Dashboard/images/resize.gif",
    "/CreativeProjects/Dashboard/images/rotate.gif",
    "/CreativeProjects/Dashboard/images/rotate.png",
    "/CreativeProjects/Dashboard/images/select.png",
    "/CreativeProjects/Dashboard/images/select1.png",
    "/CreativeProjects/Dashboard/images/selectall.gif",
    "/CreativeProjects/Dashboard/images/selectall.png",
    "/CreativeProjects/Dashboard/images/selectcolor.gif",
    "/CreativeProjects/Dashboard/images/selectcolor.png",
    "/CreativeProjects/Dashboard/images/shape/outline2.gif",
    "/CreativeProjects/Dashboard/images/shape/outline3.gif",
    "/CreativeProjects/Dashboard/images/shape/outline4.gif",
    "/CreativeProjects/Dashboard/images/shape/outline5.gif",
    "/CreativeProjects/Dashboard/images/shape/outline6.gif",
    "/CreativeProjects/Dashboard/images/shape/outline7.gif",
    "/CreativeProjects/Dashboard/images/shape/outlinf1.gif",
    "/CreativeProjects/Dashboard/images/shape/shape.png",
    "/CreativeProjects/Dashboard/images/shape/shape1.gif",
    "/CreativeProjects/Dashboard/images/shape/shape10.gif",
    "/CreativeProjects/Dashboard/images/shape/shape11.gif",
    "/CreativeProjects/Dashboard/images/shape/shape12.gif",
    "/CreativeProjects/Dashboard/images/shape/shape13.gif",
    "/CreativeProjects/Dashboard/images/shape/shape14.gif",
    "/CreativeProjects/Dashboard/images/shape/shape15.gif",
    "/CreativeProjects/Dashboard/images/shape/shape16.gif",
    "/CreativeProjects/Dashboard/images/shape/shape17.gif",
    "/CreativeProjects/Dashboard/images/shape/shape18.gif",
    "/CreativeProjects/Dashboard/images/shape/shape19.gif",
    "/CreativeProjects/Dashboard/images/shape/shape2.gif",
    "/CreativeProjects/Dashboard/images/shape/shape2.png",
    "/CreativeProjects/Dashboard/images/shape/shape20.gif",
    "/CreativeProjects/Dashboard/images/shape/shape21.gif",
    "/CreativeProjects/Dashboard/images/shape/shape22.gif",
    "/CreativeProjects/Dashboard/images/shape/shape23.gif",
    "/CreativeProjects/Dashboard/images/shape/shape3.gif",
    "/CreativeProjects/Dashboard/images/shape/shape4.gif",
    "/CreativeProjects/Dashboard/images/shape/shape5.gif",
    "/CreativeProjects/Dashboard/images/shape/shape6.gif",
    "/CreativeProjects/Dashboard/images/shape/shape7.gif",
    "/CreativeProjects/Dashboard/images/shape/shape8.gif",
    "/CreativeProjects/Dashboard/images/shape/shape9.gif",
    "/CreativeProjects/Dashboard/images/shape-2.png",
    "/CreativeProjects/Dashboard/images/straw.gif",
    "/CreativeProjects/Dashboard/images/tailor.gif",
    "/CreativeProjects/Dashboard/images/text.gif",
    "/CreativeProjects/Dashboard/images/top-menu-drop.png",
    "/CreativeProjects/Dashboard/images/undo.gif",
    "/CreativeProjects/Dashboard/images/vr.gif"
  ],
  installFilesDesirable = [
  ];

// install static assets
function installStaticFiles() {

  return caches.open(CACHE)
    .then(cache => {

      // cache desirable files
      cache.addAll(installFilesDesirable);

      // cache essential files
      return cache.addAll(installFilesEssential);

    });

}

// clear old caches
function clearOldCaches() {

  return caches.keys()
    .then(keylist => {

      return Promise.all(
        keylist
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      );

    });

}

// application installation
self.addEventListener('install', event => {

  console.log('service worker: install');

  // cache core files
  event.waitUntil(
    installStaticFiles()
    .then(() => self.skipWaiting())
  );

});


// application activated
self.addEventListener('activate', event => {

  console.log('service worker: activate');

	// delete old caches
  event.waitUntil(
    clearOldCaches()
    .then(() => self.clients.claim())
	);

});


// is image URL?
let iExt = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].map(f => '.' + f);
function isImage(url) {

  return iExt.reduce((ret, ext) => ret || url.endsWith(ext), false);

}


// return offline asset
function offlineAsset(url) {

  if (isImage(url)) {

    // return image
    return new Response(
      '<svg role="img" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title>offline</title><path d="M0 0h400v300H0z" fill="#eee" /><text x="200" y="150" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="50" fill="#ccc">offline</text></svg>',
      { headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-store'
      }}
    );
  }
  else {

    // return page
    console.log('offlineAsset: caches: ', caches)
    return caches.match(offlineURL);
  }

}


// application fetch network data
self.addEventListener('fetch', event => {

  // abandon non-GET requests
  if (event.request.method !== 'GET') return;

  let url = event.request.url;

  event.respondWith(

    caches.open(CACHE)
      .then(cache => {

        return cache.match(event.request)
          .then(response => {

            if (response) {
              // return cached file
              console.log('cache fetch: ' + url);
              return response;
            }

            // make network request
            return fetch(event.request)
              .then(newreq => {

                console.log('network fetch: ' + url);
                if (newreq.ok) cache.put(event.request, newreq.clone());
                return newreq;

              })
              // app is offline
              .catch(() => offlineAsset(url));

          });

      })

  );

});
