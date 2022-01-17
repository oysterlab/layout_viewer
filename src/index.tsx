import './index.css'

import ReactDOM from 'react-dom'
import { useRef, useState } from 'react'
import { Canvas, extend, MeshProps, ReactThreeFiber, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Mesh, Vector3 } from 'three'

import SAMPLE from './sample/https___www_netflix_com_kr_en__1024_1366.json'

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
      x: rect.x / rootWidth,
      y: rect.y / rootWidth,
      width: rect.width / rootWidth,
      height: rect.height / rootWidth
    }
  }
}

const rects = flatten(SAMPLE).map((rect:any, _:number, rects:any[]) => normalize(rect, rects[0]))

console.log(rects)

extend({ OrbitControls })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>
    }
  }
}

function Box(props:MeshProps) {
  const ref = useRef<Mesh>()

  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)

  return (
    <mesh
      {...props}
      ref={ref}
      // scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => {
        console.log(props.name)
        hover(true)
      }}
      onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
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
  <Canvas camera={{ position: [0, 0, 10], fov: 70 }}>
    <CameraControls />
    <ambientLight />
    <pointLight position={[1, 10, 10]} />
    {
      rects.map(({id, name, norm:{x, y, width, height}, depth}:any) => {
        // if (y > 1) console.log(y)
        return <Box key={id} name={name} position={[x, y, depth * 0.1]} scale={[width, height, 0.01]}></Box>
      })
    }
  </Canvas>,
  document.getElementById('root'),
)
