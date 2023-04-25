#include <stdio.h>

int main() {
    float celsius, fahrenheit;

    printf("Digite a temperatura em graus Celsius: ");
    scanf("%f", &celsius);

    fahrenheit = (celsius * 1.8) + 32;

    printf("%.2f graus Celsius equivalem a %.2f graus Fahrenheit.\n", celsius, fahrenheit);

    return 0;
}

//Este é um programa em C que solicita que o usuário insira uma temperatura em graus Celsius, converte essa temperatura para graus Fahrenheit e exibe o resultado na tela
 //Ele utiliza a fórmula de conversão de temperatura de Celsius para Fahrenheit e a função scanf para obter entrada de dados. O programa é uma demonstração simples do 
 // uso de cálculos matemáticos em C.




