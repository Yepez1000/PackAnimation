'use client';
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gsap } from "gsap";
import { min } from "three/webgpu";









export default function Home() {
  useEffect(() => {
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

    if (!canvas) {
      console.error("Canvas element not found!");
      return;
    }

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ canvas });
  

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff); // White background
    camera.position.set(0, 4, 0); 
    camera.lookAt(0, 0, 0);
    
    


    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    // directionalLight.position.set(0, 10, 0);
    // scene.add(directionalLight);


    const ambientLight = new THREE.AmbientLight(0x404040, 450); // Increased intensity
    scene.add(ambientLight);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Controls
    

    // Load GLTF Model

    let cardpack : THREE.Object3D | null = null;
    let isMoving = false;

    // const lineWidth = 4;
    // const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    //   new THREE.Vector3(-.65, 0, -.75),
    //   new THREE.Vector3(.85, 0, -.75)
    // ]);
    // const lineMaterial = new THREE.LineBasicMaterial({
    //   color: 0xff0000, linewidth: lineWidth });
    // const lineObject = new THREE.Line(lineGeometry, lineMaterial);
    // scene.add(lineObject);


    
    const loader = new GLTFLoader();
    loader.load(
      "/trading_card_pack/scene.gltf",
      (gltf) => {
        console.log("Model loaded:", gltf.scene);

        cardpack = gltf.scene;

        // Reset position and scale
        gltf.scene.position.set(0, 0, .25);
        gltf.scene.scale.set(1, 1 ,1);
        gltf.scene.rotation.y = Math.PI / 2;

        scene.add(gltf.scene);

        // renderer.domElement.addEventListener('click', () => {
        //   if (cardpack && !isMoving) {
        //     isMoving = true;

        //     // Create a GSAP animation for smooth movement
        //     gsap.to(cardpack.position, {
        //       z: cardpack.position.z + 5, // Move 5 units up
        //       duration: 1.5, // 1 second duration
        //       ease: "power2.in",
        //       onComplete: () => {
        //         isMoving = false; // Allow further moves after animation completes
        //       }
        //     });
        //   }
        // });

  
  

      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error occurred:", error);
      }
    );

    loader.load(
      "/pokemon_card_3d/scene.gltf",
      (gltf) => {
        console.log("Model loaded:", gltf.scene);

        // Reset position and scale
        gltf.scene.position.set(.12, 0, .25);
        gltf.scene.scale.set(4, 4, 4);
        gltf.scene.rotation.y = -Math.PI / 2;
        gltf.scene.rotation.z = Math.PI / 2;

        scene.add(gltf.scene);

       


      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error occurred:", error);
      }
    );

    const textureLoader = new THREE.TextureLoader();

    // Array of texture paths for different Pokémon skins
    const texturePaths = [
      '/textures/skin1.png',
      '/textures/skin2.png',
      '/textures/skin3.png',
      '/textures/skin4.png'
    ];

    let pokemonModels: THREE.Group[] = []; // To store all Pokémon clones
    let offset = 0;

    // // Load the Pokémon model and apply different textures
    loader.load("/pokemon_card_3d/scene.gltf", (gltf) => {
      const baseModel = gltf.scene;

      // Create multiple Pokémon clones with different textures
      texturePaths.forEach((texturePath, index) => {
        const clone = baseModel.clone(); // Clone the loaded model

        // Load and apply a unique texture for this clone
        textureLoader.load(texturePath, (texture) => {
          clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              // Assign new material with the loaded texture
              mesh.material = new THREE.MeshStandardMaterial({ map: texture });
            }
          });
        });

        // Position the clone in the scene
        offset -= 0.01;
        clone.position.set(.12, offset, .25);
        clone.scale.set(4, 4, 4);
        clone.rotation.y = -Math.PI / 2;
        clone.rotation.z = Math.PI / 2;


        scene.add(clone);
        pokemonModels.push(clone);
      });
    });


    function openpack() {
    if (cardpack && !isMoving) {
        isMoving = true;

        // Create a GSAP animation for smooth movement
        gsap.to(cardpack.position, {
          z: cardpack.position.z + 5, // Move 5 units up
          duration: 1.5, // 1 second duration
          ease: "power2.in",
          onComplete: () => {
            isMoving = false; // Allow further moves after animation completes
          }
        });
      }

    }

   


    class PointCloudManager {
      private pointGeometry: THREE.BufferGeometry;
      private pointMaterial: THREE.PointsMaterial;
      private pointCloud: THREE.Points;
      private positions: Float32Array;
      private positionAttribute: THREE.BufferAttribute;
      private currentPointCount: number = 0;
      private lastPoint: THREE.Vector3 | null = null;

      constructor(scene: THREE.Scene, color: number = 0xff0000, size: number = 0.05) {
        this.pointGeometry = new THREE.BufferGeometry();
        this.pointMaterial = new THREE.PointsMaterial({
          color: color,  // Allow custom color
          size: size,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        // Increased buffer size for more points
        this.positions = new Float32Array(10000 * 3);
        this.positionAttribute = new THREE.BufferAttribute(this.positions, 3);
        this.pointGeometry.setAttribute('position', this.positionAttribute);

        this.pointCloud = new THREE.Points(this.pointGeometry, this.pointMaterial);
        scene.add(this.pointCloud);
      }

      // Enhanced method to add points with more natural interpolation
      addPoint(point: THREE.Vector3) {
        // If we're about to exceed the pre-allocated buffer, resize it
        if (this.currentPointCount * 3 >= this.positions.length) {
          const newPositions = new Float32Array(this.positions.length * 2);
          newPositions.set(this.positions);
          this.positions = newPositions;
          this.positionAttribute.array = this.positions;
        }

        // If there's a last point, interpolate between last point and current point
        if (this.lastPoint) {
          const interpolationSteps = 10; // Number of interpolated points
          for (let i = 0; i < interpolationSteps; i++) {
            // Add some randomness to create a more organic line
            const t = i / interpolationSteps;
            const jitterX = (Math.random() - 0.5) * 0.02; // Small random offset
            const jitterY = (Math.random() - 0.5) * 0.02;
            const jitterZ = (Math.random() - 0.5) * 0.02;

            const interpPoint = new THREE.Vector3(
              this.lastPoint.x + (point.x - this.lastPoint.x) * t + jitterX,
              this.lastPoint.y + (point.y - this.lastPoint.y) * t + jitterY,
              this.lastPoint.z + (point.z - this.lastPoint.z) * t + jitterZ
            );

            // Add interpolated point
            this.positions[this.currentPointCount * 3] = interpPoint.x;
            this.positions[this.currentPointCount * 3 + 1] = interpPoint.y;
            this.positions[this.currentPointCount * 3 + 2] = interpPoint.z;

            this.currentPointCount++;
          }
        }

        // Add the actual point
        this.positions[this.currentPointCount * 3] = point.x;
        this.positions[this.currentPointCount * 3 + 1] = point.y;
        this.positions[this.currentPointCount * 3 + 2] = point.z;

        this.currentPointCount++;
        this.lastPoint = point.clone();

        // Update the attribute range to reflect new points
        this.positionAttribute.needsUpdate = true;
        this.pointGeometry.computeBoundingSphere();
      }

      // Modified clear method to reset everything completely
      clear() {
        // Reset the positions array
        this.positions = new Float32Array(10000 * 3);

        // Recreate the position attribute
        this.positionAttribute = new THREE.BufferAttribute(this.positions, 3);
        this.pointGeometry.setAttribute('position', this.positionAttribute);

        // Reset point count and last point
        this.currentPointCount = 0;
        this.lastPoint = null;

        // Update geometry
        this.positionAttribute.needsUpdate = true;
        this.pointGeometry.computeBoundingSphere();
      }

      // Optional: Get total number of points
      getPointCount(): number {
        return this.currentPointCount;
      }
      getMinMaxX(): { minX: number; maxX: number } {
        if (this.currentPointCount === 0) {
          return { minX: 0, maxX: 0 }; // No points added yet
        }

        let minX = Infinity;
        let maxX = -Infinity;
     

        for (let i = 0; i < this.currentPointCount; i++) {
          const x = this.positions[i * 3];
      

          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }

        return { minX, maxX };
      }
    }

    function calculateIntersectionPoint(event: MouseEvent, camera: THREE.Camera, scene: THREE.Scene, targetObject?: THREE.Object3D): THREE.Vector3 | null {
      // Create a raycaster and mouse vector
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      // Update the mouse vector based on the mouse position

      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      const cuttingThresholdYmax: number = -0.58
      const cuttingThresholdYmin: number = -0.77

      // Set the raycaster
      raycaster.setFromCamera(mouse, camera);

      // If a specific target object is provided, intersect with it
      if (targetObject) {
        const intersects = raycaster.intersectObject(targetObject);

        if (intersects.length > 0) {

          if (intersects[0].point.z > cuttingThresholdYmax || intersects[0].point.z < cuttingThresholdYmin) {
            pointCloudManager.clear();
            return null
          }
          return intersects[0].point;
        }
      }

      // Return null if no intersection is found
      return null;
    }

    // Usage example
    const pointCloudManager = new PointCloudManager(scene);

    let maxX: number = 0;
    let minX: number = 1000;
    let isDragging = false;

    // Point drawing setup
    const pointGeometry = new THREE.BufferGeometry();
    const pointMaterial = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 0.2
    });
    const pointCloud = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(pointCloud);

    renderer.domElement.addEventListener('pointerdown', (event) => {
      isDragging = true;
    });

    renderer.domElement.addEventListener('pointermove', (event) => {
      if (!isDragging || !cardpack) {
        return;
      }
      const intersectionPoint = calculateIntersectionPoint(event, camera, scene, cardpack);


      if (intersectionPoint) {
        if( intersectionPoint.x > maxX) maxX = intersectionPoint.x;
        if( intersectionPoint.x < minX) minX = intersectionPoint.x;




        pointCloudManager.addPoint(intersectionPoint);
        console.log('Intersection point:', intersectionPoint);
      }
    });

    renderer.domElement.addEventListener('pointerup', () => {
      isDragging = false;

      console.log('Min X:', minX);
      console.log('Max X:', maxX);

      console.log("Max X - Min X",minX - maxX)
      if( maxX - minX > 1.24) {
        openpack();
      }
      // Clear the point cloud
      minX = 1000;
      maxX = 0;

      pointCloudManager.clear();

    });

    function animate() {

      renderer.render(scene, camera);

      requestAnimationFrame(animate);
    }

    animate();
    

    // Handle Window Resize
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", () => { });
      renderer.dispose();
    };
  }, []);

  return (
    <div>
      <canvas id="canvas" style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
