import './app.scss';
import {useLayoutEffect, useRef} from "react";
import * as twgl from "twgl.js";
import {useStoreSubscribe} from "../helpers/use-store-subscribe";
import {appStore} from "../stores/app.store";


export function App() {
    const shader = useStoreSubscribe(appStore.fragmentShader);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const gl = canvas.getContext('webgl2');
        if (!gl) {
            return;
        }

        const programInfo = twgl.createProgramInfo(gl, [`
            #version 300 es
            precision highp float;
            in vec2 position;

            uniform vec3 iResolution;
            uniform float iTime;
            
            out vec2 fragCoord;
            
            void main() {
                gl_Position = vec4(position, 0, 1);
                
                // Position goes from -1 to 1. We want it to go from 0 to canvas width/height
                fragCoord = (position + 1.0) / 2.0 * iResolution.xy;   
            }
        `, shader]);

        const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
            position: {
                numComponents: 2,
                data: [
                    -1, -1,
                    1, -1,
                    -1, 1,
                    1, 1,
                    ],
            },
        });

        function render(time: number) {

            if (!canvas || !gl) {
                requestAnimationFrame(render);
                return;
            }

            twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            gl.useProgram(programInfo.program);

            twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

            twgl.setUniforms(programInfo, {
                iTime: time * 0.001,
                iResolution: [gl.canvas.width, gl.canvas.height, 1],
                points: [4,1,5,7,34,16] // scaled to 0..1
            });

            twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP);

            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    }, []);

    return (
        <div className="app">
            <canvas
                ref={canvasRef}
                width={768}
                height={768}
            />
        </div>
    );
}

export default App;
