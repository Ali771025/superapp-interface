import { useEffect, useRef } from 'react';

const FRAGMENT = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec3 iResolution;
uniform float iTime;
void main(){
  vec2 r=iResolution.xy; float t=iTime; vec3 FC=vec3(gl_FragCoord.xy,t); vec4 o=vec4(0.0);
  float s=0.0;
  for(float i=0.0,z=0.0,d=0.0;i++<80.0;o+=(cos(s+vec4(0.0,1.0,8.0,0.0))+1.0)/d){
    vec3 p=z*normalize(FC.rgb*2.0-r.xyy); vec3 a=normalize(cos(vec3(5.0,0.0,1.0)+t-d*4.0)); p.z+=5.0;
    a=a*dot(a,p)-cross(a,p); for(d=1.0;d++<9.0;) a-=sin(a*d+t).zxy/d;
    z+=d=.1*abs(length(p)-3.0)+.07*abs(cos(s=a.y));
  }
  o=tanh(o/5e3); fragColor=vec4(o.rgb,1.0);
}`;
const VERTEX = `#version 300 es
precision highp float; layout(location=0) in vec2 a_pos;
void main(){gl_Position=vec4(a_pos,0.0,1.0);}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source); gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
  return shader;
}

export function PhosphorOrbCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext('webgl2', { premultipliedAlpha:false, powerPreference:'low-power' });
    if (!canvas || !gl) return;
    const vs=compile(gl,gl.VERTEX_SHADER,VERTEX), fs=compile(gl,gl.FRAGMENT_SHADER,FRAGMENT);
    if (!vs || !fs) return;
    const program=gl.createProgram(); if(!program) return;
    gl.attachShader(program,vs); gl.attachShader(program,fs); gl.linkProgram(program);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);return;}
    const vao=gl.createVertexArray(), buffer=gl.createBuffer();
    gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    const resolution=gl.getUniformLocation(program,'iResolution'), time=gl.getUniformLocation(program,'iTime');
    const started=performance.now(); let disposed=false; let raf=0;
    const render=(now:number)=>{ if(disposed)return; const dpr=Math.min(1.5,window.devicePixelRatio||1); const rect=canvas.getBoundingClientRect();
      const w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr)); if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
      gl.useProgram(program); gl.uniform3f(resolution,w,h,dpr); gl.uniform1f(time,(now-started)/1000); gl.bindVertexArray(vao); gl.drawArrays(gl.TRIANGLES,0,3); raf=requestAnimationFrame(render); };
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced) render(started+600); else raf=requestAnimationFrame(render);
    return()=>{disposed=true;cancelAnimationFrame(raf);gl.deleteBuffer(buffer);gl.deleteVertexArray(vao);gl.deleteProgram(program);};
  },[]);
  return <canvas ref={ref} className="phosphor-orb-canvas" aria-hidden="true"/>;
}
