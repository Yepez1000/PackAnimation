import * as THREE from 'three';

class PointDrawer {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.Renderer;

    private points: THREE.Points;
    private pointsMaterial: THREE.PointsMaterial;
    private pointsGeometry: THREE.BufferGeometry;

    private isDragging: boolean = false;
    private pointPositions: THREE.Vector3[] = [];

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // Create points material
        this.pointsMaterial = new THREE.PointsMaterial({
            color: 0xff0000,  // Red color
            size: 0.1,        // Point size
            sizeAttenuation: true  // Points get smaller as they get further away
        });

        // Create initial empty geometry
        this.pointsGeometry = new THREE.BufferGeometry();

        // Create Points object
        this.points = new THREE.Points(this.pointsGeometry, this.pointsMaterial);
        this.scene.add(this.points);

        // Set up event listeners
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.renderer.domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.renderer.domElement.addEventListener('pointerup', this.onPointerUp.bind(this));
        this.renderer.domElement.addEventListener('pointerout', this.onPointerUp.bind(this));
    }

    private onPointerDown(event: PointerEvent) {
        this.isDragging = true;
        this.addPointFromEvent(event);
    }

    private onPointerMove(event: PointerEvent) {
        if (!this.isDragging) return;
        this.addPointFromEvent(event);
    }

    private onPointerUp() {
        this.isDragging = false;
    }

    private addPointFromEvent(event: PointerEvent) {
        // Get the renderer's DOM element (canvas)
        const canvas = this.renderer.domElement;

        // Create a vector to store the mouse position
        const mouse = new THREE.Vector2(
            ((event.clientX - canvas.offsetLeft) / canvas.clientWidth) * 2 - 1,
            -((event.clientY - canvas.offsetTop) / canvas.clientHeight) * 2 + 1
        );

        // Create a raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        // Define a plane parallel to the camera
        const planeNormal = new THREE.Vector3(0, 0, 1);
        const planeConstant = 0; // Distance from origin
        const plane = new THREE.Plane(planeNormal, planeConstant);

        // Find intersection point
        const intersectionPoint = new THREE.Vector3();
        const intersects = raycaster.ray.intersectPlane(plane, intersectionPoint);

        if (intersects) {
            // Add the point to our array of points
            this.pointPositions.push(intersectionPoint.clone());
            this.updatePointsGeometry();
        }
    }

    private updatePointsGeometry() {
        // Convert points to a format Three.js can use
        const positions = new Float32Array(this.pointPositions.length * 3);
        this.pointPositions.forEach((point, index) => {
            positions[index * 3] = point.x;
            positions[index * 3 + 1] = point.y;
            positions[index * 3 + 2] = point.z;
        });

        // Create or update the buffer attribute
        this.pointsGeometry.setAttribute('position',
            new THREE.BufferAttribute(positions, 3)
        );

        // Notify Three.js that the geometry has changed
        this.pointsGeometry.attributes.position.needsUpdate = true;
    }

    // Optional method to clear all points
    public clearPoints() {
        this.pointPositions = [];
        this.updatePointsGeometry();
    }
}

// Usage example in a React component or vanilla Three.js setup:
// const pointDrawer = new PointDrawer(scene, camera, renderer);