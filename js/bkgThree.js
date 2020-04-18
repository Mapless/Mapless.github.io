
// define
var PI_HALF = 0.5 * Math.PI;
var PI_DIV_180 = Math.PI / 180;

var heightCyl = 10;
var posPerCam = new THREE.Vector3(10, 30, 40);
var posTopCam = new THREE.Vector3(0, 30, 0);
var posLeftCam = new THREE.Vector3(-30, 0, 0);
var posFrontCam = new THREE.Vector3(0, 0, 30);

var widthOrtCam = window.innerWidth / 15;
var heightOrtCam = window.innerHeight / 15;
var isAnimate = false;
var DT_RADIAN = 1 * PI_DIV_180;

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// cams
var perCam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
perCam.position.copy(posPerCam);
var ortCam = new THREE.OrthographicCamera(widthOrtCam / - 2, widthOrtCam / 2, heightOrtCam / 2, heightOrtCam / - 2, 0.1, 1000);

var orbit = new THREE.OrbitControls(perCam, renderer.domElement);
orbit.update();
orbit.addEventListener('change', render);

// define mats
var norMat = new THREE.MeshNormalMaterial();

// define obj
var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
var cylinderGeometry = new THREE.CylinderGeometry(1, 1, heightCyl, 8, 1);
cylinderGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, heightCyl * 0.5, 0));

var cylinderDown = new THREE.Mesh(cylinderGeometry, norMat);
var cylinderUp = new THREE.Mesh(cylinderGeometry, norMat);

// add obj
scene.add(new THREE.GridHelper(20, 10));
scene.add(cylinderDown);
scene.add(cylinderUp);

cylinderDown.add(cylinderUp);
cylinderDown.position.set(0, 0, 0);
cylinderUp.position.set(0, heightCyl, 0);
cylinderUp.rotation.z = Math.PI / 2;

// opera
var CamType = { per: '透视', top: '顶视', left: '左视', front: '主视' }
var params = {
    camType: '透视',
    downMoveX: 0,
    upMoveY: cylinderUp.position.y,
    downRotY: 0,
    upRotX: THREE.Math.radToDeg(cylinderUp.rotation.x),
    upRotY: THREE.Math.radToDeg(cylinderUp.rotation.y),
    upRotZ: THREE.Math.radToDeg(cylinderUp.rotation.z),
    upLength: 10,
    rotate: toggleRotate,
    reset: setCylinderRotation,
};

var gui = new dat.GUI();
gui.add(params, 'camType', [CamType.per, CamType.top, CamType.left, CamType.front]).name("视图类型");
gui.add(params, 'downRotY', 0, 360).name('模型旋转度数');
gui.add(params, 'downMoveX', 0).name('模型水平位移').onChange(moveCylinderDownX);
gui.add(params, 'upMoveY', 0, heightCyl, 1).name('臂竖直位移').onChange(moveCylinderUpY);
gui.add(params, 'upLength', 8, 12).name('臂长');
var rotateParam = gui.addFolder("臂旋转参数");
rotateParam.add(params, 'upRotX', 0, 360, 10).name('X轴').onChange(stopRotate);
rotateParam.add(params, 'upRotY', 0, 360, 10).name('Y轴').onChange(stopRotate);
rotateParam.add(params, 'upRotZ', 0, 360, 10).name('Z轴').onChange(stopRotate);
rotateParam.add(params, 'rotate').name('旋转');
rotateParam.add(params, 'reset').name('重置');

var axesHelper = new THREE.AxesHelper( 10 );
axesHelper.position.set(cylinderUp.position.x, cylinderUp.position.y, cylinderUp.position.z);
cylinderDown.add( axesHelper );

function render() {
    if (params.camType == CamType.per) {
        renderer.render(scene, perCam);
    } else if (params.camType == CamType.top) {
        ortCam.position.copy(posTopCam);
        ortCam.lookAt(cylinderDown.position);
        renderer.render(scene, ortCam);
    } else if (params.camType == CamType.left) {
        ortCam.position.copy(posLeftCam);
        ortCam.lookAt(cylinderDown.position);
        renderer.render(scene, ortCam);
    } else if (params.camType == CamType.front) {
        ortCam.position.copy(posFrontCam);
        ortCam.lookAt(cylinderDown.position);
        renderer.render(scene, ortCam);
    }
}

// animate
function animate() {
    requestAnimationFrame(animate);

    cylinderUp.scale.y = params.upLength / heightCyl;
    cylinderDown.rotation.y = params.downRotY * PI_DIV_180;

    cylinderRotate();

    render();
}

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    perCam.aspect = window.innerWidth / window.innerHeight;
    perCam.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function cylinderRotate()
{
    if (isAnimate)
    {
        isAnimate = false;
        var rad = THREE.Math.degToRad(params.upRotX);
        if ( rad != cylinderUp.rotation.x )
        {
            var dt = getDtRadian(rad, cylinderUp.rotation.x);
            cylinderUp.rotation.x = cylinderUp.rotation.x + dt;
            isAnimate = true;
        }

        rad = THREE.Math.degToRad(params.upRotY);
        if ( rad != cylinderUp.rotation.y )
        {
            var dt = getDtRadian(rad, cylinderUp.rotation.y);
            cylinderUp.rotation.y = cylinderUp.rotation.y + dt;
            isAnimate = true;
        }

        rad = THREE.Math.degToRad(params.upRotZ);
        if ( rad != cylinderUp.rotation.z )
        {
            var dt = getDtRadian(rad, cylinderUp.rotation.z)
            cylinderUp.rotation.z = cylinderUp.rotation.z + dt;
            isAnimate = true;
        }
    }
}

function setCylinderRotation()
{
    cylinderUp.rotation.x = params.upRotX * PI_DIV_180;
    cylinderUp.rotation.y = params.upRotY * PI_DIV_180;
    cylinderUp.rotation.z = params.upRotZ * PI_DIV_180;
    isAnimate = false;
}

function toggleRotate() {
    isAnimate = !isAnimate;
}

function stopRotate()
{
    isAnimate = false;
}

function getDtRadian(dstRadian, curRadian)
{
    var dt = dstRadian - curRadian;
    var sign = dt / Math.abs(dt);
    return Math.abs(dt) > DT_RADIAN ? sign * DT_RADIAN : dt;
}

function moveCylinderDownX()
{
    cylinderDown.position.x = params.downMoveX;
}

function moveCylinderUpY()
{
    cylinderUp.position.y = params.upMoveY;
    axesHelper.position.set(cylinderUp.position.x, cylinderUp.position.y, cylinderUp.position.z);
}

animate();
render();
