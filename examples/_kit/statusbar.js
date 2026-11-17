// Injects an iOS status bar (9:41, full signal, Wi-Fi, full battery) into <div class="status"></div>.
document.querySelectorAll('.status').forEach((el) => {
  const c = getComputedStyle(document.body).color;
  el.innerHTML = `<span>9:41</span><span class="icons">
  <svg width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="${c}"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="${c}"/><rect x="10" y="3" width="3" height="9" rx="1" fill="${c}"/><rect x="15" y="0" width="3" height="12" rx="1" fill="${c}"/></svg>
  <svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.3c2.3 0 4.4.9 6 2.4l1.2-1.2A10.2 10.2 0 0 0 8.5.6 10.2 10.2 0 0 0 1.3 3.5l1.2 1.2a8.5 8.5 0 0 1 6-2.4Zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.2-1.2a6.8 6.8 0 0 0-9.6 0l1.2 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.4c.5 0 1 .2 1.3.5L8.5 11 7.2 9.6c.3-.3.8-.5 1.3-.5Z" fill="${c}"/></svg>
  <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="${c}" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.5" fill="${c}"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="${c}" opacity=".45"/></svg></span>`;
});
