var Util = {
    Tool: {
        getLocation: function (viewer, movement) {
            let ray = viewer.camera.getPickRay(movement.position);
            let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            let lng = Cesium.Math.toDegrees(cartographic.longitude);
            let lat = Cesium.Math.toDegrees(cartographic.latitude);
            let height = cartographic.height;
            return {
                lng: lng,
                lat: lat,
                height: height
            }
        },
    },
    Ajax: {

    }
};