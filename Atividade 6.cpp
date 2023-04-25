#include <stdio.h>
#include <stdlib.h>

int main() {
    float numReal;
    
    printf("Informe o numero real: ");
    scanf("%f", &numReal);
    
    int parteInteira = (int)numReal;
    
    printf("A parte inteira do numero digitado e: %d\n", parteInteira);
    
}

//Este é um programa em C que solicita que o usuário insira um número real, e em seguida, extrai e exibe sua parte inteira na tela. Ele usa a função scanf para
//obter entrada e a função printf para exibir saída, e converte o número real em um inteiro usando casting. O programa é uma demonstração simples do uso de tipos de 
//dados e conversões em C.




