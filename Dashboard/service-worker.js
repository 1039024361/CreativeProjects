// configuration
`use strict`;

const
  version = '2.0.0',
  CACHE = version + '::PWAsite',
  offlineURL = '/offline/',
  installFilesEssential = [
    '/',
    '/manifest.json',
    '/Win7DrawingBoard.js',
    '/Win7DrawingBoard.css',
    "/modules/colorConfig/index.js",
    "/modules/drawConfig/index.js",
    "/modules/drawConfig/init.js",
    "/modules/DrawingInfo.js",
    "/modules/EventHandlers/adjustCanvas.js",
    "/modules/EventHandlers/body.js",
    "/modules/EventHandlers/canvasBox.js",
    "/modules/EventHandlers/canvasWrap.js",
    "/modules/EventHandlers/colorEVENT.js",
    "/modules/EventHandlers/EVENT.js",
    "/modules/EventHandlers/rotateDrop.js",
    "/modules/EventHandlers/stretchEVENT.js",
    "/modules/EventHandlers/target.js",
    "/modules/EventHandlers/tool.js",
    "/modules/EventHandlers/wrapDiv.js",
    "/modules/lineConfig/index.js",
    "/modules/RichBase.js",
    "/modules/Shapes.js",
    "/modules/stretchConfig/index.js",
    "/modules/stretchConfig/init.js",
    "/modules/toolMenu.js",
    "/modules/tools/drawImage.js",
    "/modules/tools/drawLine.js",
    "/modules/tools/drawShape.js",
    "/modules/tools/file.js",
    "/modules/tools/fill.js",
    "/modules/tools/fillText.js",
    "/modules/tools/magnify.js",
    "/modules/tools/moreShape.js",
    "/modules/tools/moveStretch.js",
    "/modules/tools/paste.js",
    "/modules/tools/pasteImage.js",
    "/modules/tools/straw.js",
    "/modules/tools/virtualBox.js",
    "/modules/Transform.js",
    "/utils/Base.js",
    "/utils/ClassFactory.js",
    "/utils/Client.js",
    "/utils/common.js",
    "/utils/EventUtil.js",
    "/utils/Observer.js",
    "/utils/require.js",
    "/utils/tools.js",
    "/images/180.gif",
    "/images/180.png",
    "/images/area-pos.gif",
    "/images/brush.png",
    "/images/brush1.png",
    "/images/brush2.png",
    "/images/brush3.png",
    "/images/brush4.png",
    "/images/brush5.png",
    "/images/brush6.png",
    "/images/brush7.png",
    "/images/brush8.png",
    "/images/brush9.png",
    "/images/circle.gif",
    "/images/copy.gif",
    "/images/ctrl/all.jpg",
    "/images/cut-copy.gif",
    "/images/cut.gif",
    "/images/cut1.gif",
    "/images/delect.gif",
    "/images/drop/1.gif",
    "/images/drop/10.gif",
    "/images/drop/11.gif",
    "/images/drop/2.gif",
    "/images/drop/3.gif",
    "/images/drop/4.gif",
    "/images/drop/5.gif",
    "/images/drop/6.gif",
    "/images/drop/7.gif",
    "/images/drop/8.gif",
    "/images/drop/9.gif",
    "/images/drop/list.gif",
    "/images/drop-parse.gif",
    "/images/drop-source.gif",
    "/images/drop.png",
    "/images/erase.gif",
    "/images/fill.gif",
    "/images/fill2.gif",
    "/images/fill2.png",
    "/images/hr.gif",
    "/images/l90.gif",
    "/images/magnifier.gif",
    "/images/new-area-pos.gif",
    "/images/oppselect.gif",
    "/images/oppselect.png",
    "/images/outline.gif",
    "/images/paste.jpg",
    "/images/paste1.gif",
    "/images/paste1.jpg",
    "/images/paste2.jpg",
    "/images/pen-bw.gif",
    "/images/pen.gif",
    "/images/position.gif",
    "/images/r90.gif",
    "/images/redo.gif",
    "/images/resize.gif",
    "/images/rotate.gif",
    "/images/rotate.png",
    "/images/select.png",
    "/images/select1.png",
    "/images/selectall.gif",
    "/images/selectall.png",
    "/images/selectcolor.gif",
    "/images/selectcolor.png",
    "/images/shape/outline2.gif",
    "/images/shape/outline3.gif",
    "/images/shape/outline4.gif",
    "/images/shape/outline5.gif",
    "/images/shape/outline6.gif",
    "/images/shape/outline7.gif",
    "/images/shape/outlinf1.gif",
    "/images/shape/shape.png",
    "/images/shape/shape1.gif",
    "/images/shape/shape10.gif",
    "/images/shape/shape11.gif",
    "/images/shape/shape12.gif",
    "/images/shape/shape13.gif",
    "/images/shape/shape14.gif",
    "/images/shape/shape15.gif",
    "/images/shape/shape16.gif",
    "/images/shape/shape17.gif",
    "/images/shape/shape18.gif",
    "/images/shape/shape19.gif",
    "/images/shape/shape2.gif",
    "/images/shape/shape2.png",
    "/images/shape/shape20.gif",
    "/images/shape/shape21.gif",
    "/images/shape/shape22.gif",
    "/images/shape/shape23.gif",
    "/images/shape/shape3.gif",
    "/images/shape/shape4.gif",
    "/images/shape/shape5.gif",
    "/images/shape/shape6.gif",
    "/images/shape/shape7.gif",
    "/images/shape/shape8.gif",
    "/images/shape/shape9.gif",
    "/images/shape-2.png",
    "/images/straw.gif",
    "/images/tailor.gif",
    "/images/text.gif",
    "/images/top-menu-drop.png",
    "/images/undo.gif",
    "/images/vr.gif"
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
