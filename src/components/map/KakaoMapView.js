import { WebView } from 'react-native-webview';
import React, { useMemo } from 'react';
import { View } from 'react-native';

const KakaoMapView = ({ lat, lng }) => {
  const html = useMemo(() => `
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

            // RN에서 좌표 업데이트 받을 채널
            document.addEventListener('message', function(e) {
              try {
                var msg = JSON.parse(e.data);
                if (msg.type === 'move' && msg.lat && msg.lng) {
                  var pos = new kakao.maps.LatLng(msg.lat, msg.lng);
                  map.setCenter(pos);
                  marker.setPosition(pos);
                }
              } catch (_) {}
            });
          });
        }
      </script>
    </head>
    <body><div id="map"></div></body>
    </html>
  `, [lat, lng]);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        style={{ flex: 1 , width: '100%', height: 200}}
      />
    </View>
  );
};

export default KakaoMapView;
