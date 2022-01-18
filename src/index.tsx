import './index.css'

import ReactDOM from 'react-dom'
import { useRef, useState } from 'react'
import { Canvas, extend, ReactThreeFiber, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Mesh } from 'three'

import SAMPLE from './sample/https___www_netflix_com_kr_en__1024_1366.json'

const PALETTE = ["#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#00b7c7", "#5ad45a", "#8be04e", "#ebdc78"]
const palette = require('color-interpolate')(PALETTE)

const flatten = (root:any) => {
  const rects:any[] = []
  const _flatten = (rect:any, depth:number=0) => { 
    rects.push({
      ...rect,
      depth
    })
    rect.children.map((child:any) => _flatten(child, depth+1))
  }
  _flatten(root)
  return rects
}

const normalize = (rect:any, {width:rootWidth, height:rootHeight}:any) => {
  return {
    ...rect,
    norm: {
      x: rect.x / rootWidth + rect.width / rootWidth * 0.5,
      y: - (rect.y / rootWidth + rect.height / rootWidth * 0.5),
      width: rect.width / rootWidth,
      height: rect.height / rootWidth
    }
  }
}

const rects = flatten(SAMPLE).map((rect:any, _:number, rects:any[]) => normalize(rect, rects[0]))
const maxDepth = rects.reduce((max:number, rect:any) => max < rect.depth ? rect.depth : max, 0)

rects.forEach((rect:any) => rect.color = palette(rect.depth/maxDepth))

extend({ OrbitControls })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>
    }
  }
}

function Box(props:any) {
  const ref = useRef<Mesh>()

  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)

  return (
    <mesh
      {...props}
      ref={ref}
      onClick={(_) => click(!clicked)}
      onPointerOver={(event) => {
        console.log(props.name)
        hover(true)
        event.stopPropagation()
      }}
      onPointerOut={(_) => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={props.color} metalness={hovered ? 0.4 : 0.0} roughness={hovered ? 0.0 : 0.8} />
    </mesh>
  )
}

const CameraControls = () => {
  const {
    camera,
    gl: { domElement },
  } = useThree()

  const controls = useRef<OrbitControls>()
  useFrame((state) => controls.current?.update())
  return <orbitControls ref={controls} args={[camera, domElement]} />
};

ReactDOM.render(
  <Canvas camera={{ position: [0, -10, 10], fov: 30 }}>
    <CameraControls />
    <ambientLight />
    <pointLight position={[1, 10, 10]} />
    {
      rects.map(({id, name, color, norm:{x, y, width, height}, depth}:any) => {
        return <Box key={id} name={name} color={color} position={[x, y, depth * 0.15]} scale={[width, height, 0.03]}></Box>
      })
    }
  </Canvas>,
  document.getElementById('root'),
)
