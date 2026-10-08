const C='insaan-v3',A=['./','index.html','style.css','app.js','manifest.json','icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('index.html'))))});
self.addEventListener('notificationclick',e=>{e.notification.close();const id=e.notification.data&&e.notification.data.id,a=e.action;e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{if(l.length){l[0].focus();l[0].postMessage({a,id})}else return clients.openWindow('./index.html')}))});
