(function(){
'use strict';

// unsupported browser
if (!window.addEventListener || !window.history || !window.requestAnimationFrame || !document.getElementsByClassName) return;


// enable service worker
if ('serviceWorker' in navigator) {
        // register service worker
        navigator.serviceWorker.register('/service-worker.js').then(function (registration) {
            // 注册成功
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(function (err) {                   
            // 注册失败 :(
            console.log('ServiceWorker registration failed: ', err);
        });
    }
})()