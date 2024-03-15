#version 300 es
precision highp float;

// NOTE(decarv): varyings allow the fragment shader to have more info on pixels
// It is called a varying because it interpolates the values of colors between
// vertices
in vec4 v_color;
out vec4 outColor;

void main() {
    outColor = v_color;
}

// pesquisar se ja existe o processo e so completar se ja existir
// update se ja existir da um insert
