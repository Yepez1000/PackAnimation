'use client';
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gsap } from "gsap";
import { text } from "stream/consumers";









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


    const ambientLight = new THREE.AmbientLight(0x404040, 100); // Increased intensity previously 450
    scene.add(ambientLight);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // // Controls
    // const controls = new OrbitControls(camera, renderer.domElement);
    // // controls.minPolarAngle = Math.PI / 4; // Limit upward rotation (e.g., 45 degrees)
    // controls.maxPolarAngle = Math.PI / 2; 
    

    // Load GLTF Model

    let cardpack_top : THREE.Object3D | null = null;
    let cardpack_buttom: THREE.Object3D | null = null;
    let isMoving = false;
    let pokemon_card : THREE.Object3D | null = null;
    let packopened = false;

    const lineWidth = 10;
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-.75, 0, -0.95),
      new THREE.Vector3(.75, 0, -0.95)
    ]);
    
    const cutLineMaterial = new THREE.ShaderMaterial({
 
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
          fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;
        void main() {
          float glow = abs(sin(time * 2.0 + vUv.x * 10.0)); // Sine wave animation
          gl_FragColor = vec4(color * glow, 1.0);
        }
      `,
      uniforms: {
        time: { value: 0 }, // This will be animated
        color: { value: new THREE.Color(0xff0000) }, // Glowing red color
      },
      transparent: true, // Allow blending with the background
    });
    // const lineMaterial = new THREE.LineBasicMaterial({
    //   color: 0xff0000, linewidth: lineWidth });
    const lineObject = new THREE.Line(lineGeometry, cutLineMaterial);
    lineObject.position.set(0.0, 0.2, 0.1);
    scene.add(lineObject);


    
    const loader = new GLTFLoader();
    loader.load(
      "/trading_card_pack_top/scene.gltf",
      (gltf) => {
        console.log("Model loaded:", gltf.scene);

        cardpack_top = gltf.scene;

        // Reset position and scale
        cardpack_top.position.set(0.06, 0, 0);
        cardpack_top.scale.set(1.1, 1.1,1.1);
        cardpack_top.rotation.y = Math.PI / 2;

        cardpack_top.traverse((child) => {
          if (child instanceof THREE.Mesh) {
        
            child.material.metalness = 0.2;
            child.material.roughness = 0.9;
          }

        });

       
        scene.add(cardpack_top);

    
      
  
  

      },
      (xhr) => {
        // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error occurred:", error);
      }
    );
    loader.load(
      "/trading_card_pack_buttom/scene.gltf",
      (gltf) => {
        console.log("Model loaded:", gltf.scene);

        cardpack_buttom = gltf.scene;

        // Reset position and scale
        cardpack_buttom.position.set(0.06, 0, 0);
        cardpack_buttom.scale.set(1.1, 1.1, 1.1);
        cardpack_buttom.rotation.y = Math.PI / 2;

        cardpack_buttom.traverse((child) => {
          if (child instanceof THREE.Mesh) {

            child.material.metalness = 0.2;
            child.material.roughness = 0.9;
          }

        });


        scene.add(cardpack_buttom);






      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error occurred:", error);
      }
    );


    // loader.load(
    //   "/pokemon_card_3d/scene.gltf",
    //   (gltf) => {
    //     console.log("Model loaded:", gltf.scene);

    //     pokemon_card = gltf.scene;

    //     // Reset position and scale
    //     gltf.scene.position.set(.12, 0, .25);
    //     gltf.scene.scale.set(4, 4, 4);
    //     gltf.scene.rotation.y = -Math.PI / 2;
    //     gltf.scene.rotation.z = Math.PI / 2;

    //     scene.add(gltf.scene);

       


    //   },
    //   (xhr) => {
    //     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    //   },
    //   (error) => {
    //     console.error("An error occurred:", error);
    //   }
    // );

    const textureLoader = new THREE.TextureLoader();

    // Array of texture paths for different Pokémon skins
    const texturePaths = [
      '/charizard.jpeg',
      '/pikachu_card.jpeg',
      '/textures/skin3.png',
      '/textures/skin4.png',
    ];

    let pokemonModels: THREE.Object3D[] = []; // To store all Pokémon clones
    let offset = 0;

    // // Load the Pokémon model and apply different textures
    loader.load("/pokemon_card_3d/scene.gltf", (gltf) => {
      const baseModel = gltf.scene;
     

      // Create multiple Pokémon clones with different textures
      texturePaths.forEach((texturePath, index) => {
        let clone = baseModel.clone(); // Clone the loaded model

        // Load and apply a unique texture for this clone

        textureLoader.load(texturePath, (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          
          clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              // Assign new material with the loaded texture
              mesh.material = new THREE.MeshStandardMaterial({ 
                map: texture,
                metalness: 0, // Non-metallic
                roughness: 0.8,  // High roughness for less reflectivity
                emissive: 0x000000, // No emissive glow
              });
            }
          });
        });


        // Position the clone in the scene
        offset -= 0.01;
        clone.position.set(0, offset, 0);
        clone.scale.set(4, 4, 4);
        clone.rotation.y = -Math.PI / 2;
        clone.rotation.z = Math.PI / 2;


        scene.add(clone);
        pokemonModels.push(clone);
      });
    });

    let audio:THREE.Audio;
    let ripping_buffer: AudioBuffer;
    let hit_buffer: AudioBuffer;

    const listener = new THREE.AudioListener();
    camera.add(listener);

    const ripping = new THREE.Audio(listener);

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("/audiomass-output.mp3", (buffer) => {
      console.log('Audio loaded:', buffer);

      
      ripping.setBuffer(buffer);
      ripping.setLoop(false);
      ripping.setVolume(1.0);

      ripping_buffer = buffer;
    })

    const audioContext = listener.context;
    let source: AudioBufferSourceNode;


    const hit = new THREE.Audio(listener);

    audioLoader.load("hitsoundeffect.mp3", (buffer) => {
      
      hit.setBuffer(buffer)
      hit.setLoop(false);
      hit.setVolume(1.0);

      hit_buffer = buffer
    })   

    const star = new THREE.Audio(listener);

    audioLoader.load('starsoundeffect.mp3', (buffer) => {
      star.setBuffer(buffer);
      star.setLoop(false)
      star.setVolume(1.0);

    })

    function addstar(numstars: number){
      offset = .35
      console.log('addedstars')
      for(let i = 0; i< numstars; i++){

        loader.load('ender_star/scene.gltf', (gltf) => {
          gltf.scene.position.set(-0.5 + i*offset,0,0.7);
          gltf.scene.rotation.x = (Math.PI/2);
          gltf.scene.scale.set(0.25,0.25,0.25);
          scene.add(gltf.scene)
        })

      }
    }
    
  

    function playAudioAtPercentage(percentage : number, audioBuffer: AudioBuffer) {
      if (!ripping || !audioBuffer) {
        console.error("Audio is not loaded yet!");
        return;
      }

      // Validate percentage input
      if (percentage < 0 || percentage > 100) {
        console.error("Percentage must be between 0 and 100.");
        return;
      }

      console.log("Audio object:",ripping)

      if(!ripping.buffer){
        console.error("Audio buffer or source is not available.");
        return;
        
      }

      // Calculate the target time based on the percentage
      const duration = ripping.buffer.duration; // Total audio duration in seconds
      const targetTime = (percentage / 100) * duration;

      // Stop any ongoing playback
    

      // Create a new source node and play from the specified position
      if (source){
        source.stop();
      }
      source = audioContext.createBufferSource();
    
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0, targetTime); 
    }


    function openpack() {
    if (cardpack_buttom && !isMoving && cardpack_top) {
        packopened = true;

        scene.remove(lineObject)
        isMoving = true;

      // Define a motion path using control points for a parabolic arc
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),    // Start position
        new THREE.Vector3(-2, -2, 3),  // Arc upward and backward
        new THREE.Vector3(-5, 2, 5), // Fall forward and downward
      ]);

      hit.play()

      // Animate along the curve
      gsap.to({ t: 0 }, {
        t: 1,
        duration: 4,
        ease: "power2.out",
        onUpdate: function () {
          const point = curve.getPointAt(this.targets()[0].t);
          cardpack_top?.position.set(point.x, point.y, point.z);
        },
      });

      // Add rotation animation
      gsap.to(cardpack_top.rotation, {
        x: Math.PI * 1.2, // Flip backward
        y: -Math.PI * 0.5, // Add slight sideways spin
        z: Math.PI * 0.2, // Slight twist
        duration: 4,
        ease: "power2.out",
      });
        gsap.to(cardpack_buttom.position, {
          z: cardpack_buttom.position.z + 5, // Move 5 units up
          duration: 1.5, // 1 second duration
          ease: "power2.in",
          onComplete: () => {
            isMoving = false; // Allow further moves after animation completes
          }
        });
        addstar(3)
      }

    }


    function movecard(pokemon_card: THREE.Object3D) {
      
      if (pokemon_card) {
        star.stop()
        star.play();

        gsap.to(pokemon_card.position, {
          x: pokemon_card.position.x + 10,
          duration: 1.5,


        });
      };
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

      // Set the raycaster
      raycaster.setFromCamera(mouse, camera);

      // If a specific target object is provided, intersect with it
      if (targetObject) {
        const intersects = raycaster.intersectObject(targetObject);

        // console.log("intersects",intersects)

        if (intersects.length > 0) {

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
    let count = 0;
    let lastPercentage: number = -1;

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
      console.log('packopened?', !packopened )
      if (!pokemonModels || !packopened) {
          return
      } 

      console.log("pokemonModels[count]",pokemonModels[count])
      const cardIntersectionPoint = calculateIntersectionPoint(event, camera, scene, pokemonModels[count]);
      console.log("cardIntersectionPoint",cardIntersectionPoint)
      if (cardIntersectionPoint) {
       movecard(pokemonModels[count]);
       count += 1
      }

    });

    renderer.domElement.addEventListener('pointermove', (event) => {
      const cuttingThresholdYmax: number = -0.80
      const cuttingThresholdYmin: number = -0.9
      const cuttingLenght: number = 1.24
      let percentage: number = 0
      if (!isDragging || !cardpack_buttom) {
        return;
      }

  
      const intersectionPoint = calculateIntersectionPoint(event, camera, scene, cardpack_buttom);


  
      if (intersectionPoint) {
        // controls.enabled = false;
        if( intersectionPoint.x > maxX) maxX = intersectionPoint.x;
        if( intersectionPoint.x < minX) minX = intersectionPoint.x;


        
        console.log(intersectionPoint.z)
        if (intersectionPoint.z > cuttingThresholdYmax || intersectionPoint.z < cuttingThresholdYmin) {
          lastPercentage = -1
          pointCloudManager.clear();
          return null
        }

        percentage = (maxX - minX) / cuttingLenght * 100

        if(percentage - lastPercentage > 10){
          lastPercentage = percentage
     
          playAudioAtPercentage(lastPercentage, ripping_buffer)
        }
          
     

      




        pointCloudManager.addPoint(intersectionPoint);
        // console.log('Intersection point:', intersectionPoint);
      }
      
    });

    renderer.domElement.addEventListener('pointerup', () => {
      isDragging = false;
      
      // controls.enabled = true;
      if(source){
        source.stop()
      }
    

      // console.log('Min X:', minX);
      // console.log('Max X:', maxX);

      // console.log("Max X - Min X",minX - maxX)
      if( maxX - minX > 1.24) {
        openpack();
      }
      // Clear the point cloud
      minX = 1000;
      maxX = 0;


      lastPercentage = - 1
      pointCloudManager.clear();

    });

    function animate() {

      renderer.render(scene, camera);
      cutLineMaterial.uniforms.time.value += .01; 

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
