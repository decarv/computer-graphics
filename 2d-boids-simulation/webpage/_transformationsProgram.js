/* -------------------------------------------------------------------------------------------------------------- */
/* Transformations Program */
// gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
// gl.useProgram(transformationsProgram);
//
// // Preprocessamento: Pega local das variáveis dos shaders
// let a_positionLocation = gl.getAttribLocation(transformationsProgram, "a_position");
// let a_colorLocation = gl.getAttribLocation(transformationsProgram, "a_color");
// let u_centerLocation = gl.getUniformLocation(transformationsProgram, "u_center");
// let u_deltaTimeLocation = gl.getUniformLocation(transformationsProgram, "u_delta_time");
// let u_angleLocation = gl.getUniformLocation(transformationsProgram, "u_angle");
// let u_velocityLocation = gl.getUniformLocation(transformationsProgram, "u_velocity");
// let u_resolutionLocation = gl.getUniformLocation(transformationsProgram, "u_resolution");
//
// // Vertex Array Object
// // Tell WebGL which set of buffers to use and how to pull the data (attributes)
// // This is done through the VAO
// let vao = gl.createVertexArray(); // Collection of attribute state
// gl.bindVertexArray(vao);
//
// // Setup do buffer com dados do peixe
// // I will tell the GPU about the a_position
// let positionsBuffer = utils.makeBuffer(gl, fish.vertices);
// utils.setAttribute(gl, a_positionLocation, {size: 2, datatype: gl.FLOAT, normalize: false, stride: 0, offset: 0});
//
// // bindBuffer sets that buffer as the buffer to be worked on
// // Now I'm telling the GPU about the a_color -> refers to the last bound buffer
// // So the idea is to create the buffer, than to bind it to array buffer, than to fill in this buffer with data from
// // RAM, than to set the attributes of how to consume such buffer.
// // TODO
// // let colorBuffer = utils.makeBuffer(gl, fish.color);
// // utils.setAttribute(gl, a_colorLocation, {size: 4, datatype: gl.FLOAT, normalize: false, stride: 0, offset: 0});
//
// // We need to tell WebGL how to convert from the clip space values we'll be setting
// // gl_Position to back into pixels, often called screen space. To do this we call
// // gl.viewport and pass it the current size of the canvas.
// gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//
// // Passo dados para uniforms
// gl.uniform2f(u_velocityLocation, fish.velocity.x, fish.velocity.y);
// gl.uniform1f(u_angleLocation, fish.angle);
// fish.angle = 0;
// gl.uniform2f(u_centerLocation, fish.cx, fish.cy);
// gl.uniform1f(u_deltaTimeLocation, deltaTime);
// gl.uniform2f(u_resolutionLocation, gl.canvas.width, gl.canvas.height);
//
// // gl.drawArrays(gl.TRIANGLE_FAN, 0, fish.verticesCount);
//
// console.log(`After.x: ${fish.velocity.x}`)
// console.log(`After.y: ${fish.velocity.y}`)
// console.log(`After.angle: ${fish.angle}`)
//
// let tfBuffer = gl.createBuffer();
// gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, tfBuffer);
// gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, 1<<10, gl.STATIC_READ);
//
// let tf = gl.createTransformFeedback();
// gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
// gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, tfBuffer);
// gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
//
// gl.beginTransformFeedback(gl.POINTS);
// gl.drawArrays(gl.POINTS, 0, fish.verticesCount);
// gl.endTransformFeedback();
// gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
// gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, tfBuffer);
// gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, fish.vertices);
