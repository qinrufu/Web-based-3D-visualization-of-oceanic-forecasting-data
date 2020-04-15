var thisWidget;

//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {//适应不同样式
        $("body").addClass(thisWidget.config.style);
    }

    //测试:调用了【index页面对应widg.js】 中的方法
    thisWidget.testFun();
}

//测试
function testIframeFun() {
    // toastr.error('我是弹窗中的方法');
    var canvas = document.getElementById("renderCanvas");

    var createScene = function (engine) {
        var scene = new BABYLON.Scene(engine);

        // Camera
        var camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 512, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        // Light
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

        // Skybox
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("//www.babylonjs.com/assets/skybox/TropicalSunnyDay", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;

        // Water material
        var waterMaterial = new BABYLON.WaterMaterial("waterMaterial", scene, new BABYLON.Vector2(512, 512));
        waterMaterial.bumpTexture = new BABYLON.Texture("//www.babylonjs.com/assets/waterbump.png", scene);
        waterMaterial.windForce = -10;
        waterMaterial.waveHeight = 0.2;
        waterMaterial.bumpHeight = 0.1;
        waterMaterial.waveLength = 0.1;
        waterMaterial.waveSpeed = 20.0;
        waterMaterial.colorBlendFactor = 0;
        waterMaterial.windDirection = new BABYLON.Vector2(1, 1);
        waterMaterial.colorBlendFactor = 0;


        // Ground
        var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "textures/heightMap.png",
            512, 512, 100, -50, 50, scene, false);
        var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", scene);
        groundMaterial.diffuseTexture.uScale = 1;
        groundMaterial.diffuseTexture.vScale = 6;
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.position.y = -2.05;
        ground.material = groundMaterial;



        // Water mesh
        var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 512, 512, 32, scene, false);
        waterMesh.material = waterMaterial;

        // Model
        // var sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", scene);
        // sphereMaterial.diffuseTexture = new BABYLON.Texture("//www.babylonjs.com/assets/wood.jpg", scene);

        // var sphere = BABYLON.Mesh.CreateSphere("sphere", 32, 24, scene);
        // sphere.position.y = 20;
        // sphere.material = sphereMaterial;

        // Configure water material


        var boxMaterial = new BABYLON.StandardMaterial("box", scene);
        boxMaterial.specularColor = new BABYLON.Color3(255,255, 255);
        boxMaterial.alpha = 0.4;

        var box = BABYLON.MeshBuilder.CreateBox("Box1", { height: 55, width: 512, depth: 512 }, scene);
        box.position.y = -28;
        box.material = boxMaterial;
        

        waterMaterial.addToRenderList(ground);
        waterMaterial.addToRenderList(skybox);
        // waterMaterial.addToRenderList(sphere);

        //tree
        // var spriteManagerTrees = new BABYLON.SpriteManager("treesManager", "textures/palm.png", 512, 512, scene);

        // //We create 20 trees at random positions
        // for (var i = 0; i < 20; i++) {
        //     var tree = new BABYLON.Sprite("tree", spriteManagerTrees);
        //     tree.position.x = Math.random() * 300 - 50;
        //     tree.position.z = Math.random() * 300 - 50;
        //     tree.isPickable = true;
        // }


        return scene;
    };

    var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    var scene = createScene();

    engine.runRenderLoop(function () {
        if (scene) {
            scene.render();
        }
    });
}