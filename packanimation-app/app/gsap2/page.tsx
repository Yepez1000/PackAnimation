'use client'

import { useRef, useEffect } from "react";
import gsap from "gsap";

const CanvasAnimation = () => {

    gsap.timeline().from(".App", { opacity: 0, scale:0, ease:"back" });
   
    return (
        <div className="App">
            <h1>Canvas Animation</h1>
        </div>
    );
};

export default CanvasAnimation;
