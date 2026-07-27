import React, { useMemo } from 'react';

// 웹 전용 KakaoMapView.
// 네이티브 버전은 react-native-webview(WebView)를 쓰지만 웹은 미지원이라
// 브라우저에서는 동일한 카카오맵 HTML을 <iframe srcDoc>으로 렌더링한다.
const KakaoMapView = ({ lat, lng }) => {
  const html = useMemo(
    () => `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
      <style>html,body,#map{height:100%;margin:0;padding:0}</style>
      <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=4fc788d2ee89f916ab9ee7b5cdee480c&autoload=false"></script>
      <script>
        window.onload = function() {
          kakao.maps.load(function() {
            var container = document.getElementById('map');
            var center = new kakao.maps.LatLng(${lat}, ${lng});
            var map = new kakao.maps.Map(container, { center: center, level: 3 });
            var marker = new kakao.maps.Marker({ position: center });
            marker.setMap(map);
          });
        }
      </script>
    </head>
    <body><div id="map"></div></body>
    </html>
  `,
    [lat, lng]
  );

  return (
    <iframe
      title="kakao-map"
      srcDoc={html}
      style={{ width: '100%', height: 200, border: 0, borderRadius: 8 }}
    />
  );
};

export default KakaoMapView;
