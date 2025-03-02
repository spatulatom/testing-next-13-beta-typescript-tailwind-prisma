"use client"

import { useRef, useEffect } from "react"

// Main component for GLSL visualization
export default function Galaxy() {
  // Refs to store WebGL context and program across renders
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const glRef = useRef<WebGL2RenderingContext | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Initialize WebGL2 context
    // We use WebGL2 for better GLSL compatibility and performance
    const gl = canvas.getContext("webgl2")
    glRef.current = gl
    if (!gl) {
      console.error("WebGL2 not supported")
      return
    }

    // Canvas resize handler
    // Ensures the visualization fills the screen and maintains proper resolution
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Basic vertex shader
    // Simply passes through vertex positions for full-screen quad
    const vertexShaderSource = `#version 300 es
      in vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `

    // Fragment shader containing the main visualization logic
    const fragmentShaderSource = `#version 300 es
      precision highp float;  // High precision for better quality
      out vec4 outColor;     // Output color
      uniform vec2 u_resolution;  // Screen resolution
      uniform vec2 u_mouse;       // Mouse position
      uniform float u_time;       // Time for animation

      // HSV to RGB conversion function
      // h: hue (0-1)
      // s: saturation (0-1)
      // v: value/brightness (0-1)
      vec3 hsv(float h, float s, float v) {
        vec4 t = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
        vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
        return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
      }

      void main() {
        // Initialize variables
        vec2 r = u_resolution;          // Screen resolution
        vec2 FC = gl_FragCoord.xy;      // Current pixel position
        float t = u_time;               // Current time
        vec4 o = vec4(0, 0, 0, 1);      // Output color (starts black)
        
        // Main loop variables
        float i, e, R, s;
        vec3 q, p, d = vec3(FC.xy/r-.2,.4);  // Initial direction vector

        // Main rendering loop - creates the solar system effect
        for(q.yz--;i++<99.;){
          // Color accumulation using HSV
          // .1+e*0.7: Hue varies from orange to blue
          // .6: Moderate saturation for rich but not overpowering colors
          // Brightness calculation scaled down for subtler effect
          o.rgb+=hsv(.1+e*0.7,.6,min(e*s*e/.01,.3-e)/12.);
          //  o.rgb+=hsv(.3+e*0.7,.6,min(e*s*e/.01,.3-e)/12.);
          
          s=1.;
          p=q+=d*e*R*.3;  // Ray marching step
          
          // Transform space coordinates
          p=vec3(
            log2(R=length(p))-t*.6,    // Radial coordinate with time variation
            exp(-p.z/R+.5),            // Height coordinate with depth scaling
            atan(p.x,p.y)-t*.3         // Angular coordinate with rotation
          );
          
          // Inner loop for detail generation
          for(e=--p.y;s<1e3;s+=s)
            e+=-abs(dot(cos(p.zxy*s),.2-sin(t*.3-p*s)))/s*.24;
        }
        
        outColor = o;  // Final color output
      }
    `

    // Shader compilation helper function
    // Creates and compiles either vertex or fragment shaders
    const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) {
        console.error("Failed to create shader")
        return null
      }
      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      // Check for compilation errors
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Shader compilation error: ${gl.getShaderInfoLog(shader)}`)
        gl.deleteShader(shader)
        return null
      }

      return shader
    }

    // Create and compile both shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    if (!vertexShader || !fragmentShader) return

    // Create and link WebGL program
    const program = gl.createProgram()
    if (!program) {
      console.error("Failed to create program")
      return
    }

    // Attach and link shaders to program
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    programRef.current = program

    // Check for linking errors
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(`Program linking error: ${gl.getProgramInfoLog(program)}`)
      return
    }

    // Set up vertex buffer for full-screen quad
    // Creates two triangles that cover the entire screen
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0,
        -1.0, // Triangle 1
        1.0,
        -1.0,
        -1.0,
        1.0,
        -1.0,
        1.0, // Triangle 2
        1.0,
        -1.0,
        1.0,
        1.0,
      ]),
      gl.STATIC_DRAW,
    )

    // Set up vertex attributes
    // Connects the position buffer to the vertex shader
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    // Get uniform locations for passing data to shaders
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution")
    const mouseUniformLocation = gl.getUniformLocation(program, "u_mouse")
    const timeUniformLocation = gl.getUniformLocation(program, "u_time")

    // Mouse tracking for interactive effects
    let mouseX = 0
    let mouseY = 0
    canvas.addEventListener("mousemove", (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    })

    let startTime: number

    // Animation render loop
    const render = () => {
      startTime = startTime || Date.now()
      const currentTime = (Date.now() - startTime) / 1000

      // Handle window resizing
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        resizeCanvas()
      }

      glRef.current?.useProgram(programRef.current) // Moved useProgram here

      // Set up WebGL viewport and clear
      glRef.current?.viewport(0, 0, canvas.width, canvas.height)
      glRef.current?.clearColor(0, 0, 0, 1)
      glRef.current?.clear(glRef.current.COLOR_BUFFER_BIT)

      // Update shader uniforms
      glRef.current?.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)
      glRef.current?.uniform2f(mouseUniformLocation, mouseX, mouseY)
      glRef.current?.uniform1f(timeUniformLocation, currentTime)

      // Draw the full-screen quad
      glRef.current?.drawArrays(glRef.current.TRIANGLES, 0, 6)

      // Schedule next frame
      requestAnimationFrame(render)
    }

    // Start the render loop
    render()

    // Cleanup function
    // Removes event listeners and deletes WebGL resources
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      glRef.current?.deleteProgram(programRef.current)
      glRef.current?.deleteShader(vertexShader)
      glRef.current?.deleteShader(fragmentShader)
      glRef.current?.deleteBuffer(positionBuffer)
    }
  }, [])

  // Render full-screen canvas
  return (
    <div className="relative md:w-full h-screen">
      <canvas ref={canvasRef} className="h-full md:w-full" />
    
    </div>
  )
}

