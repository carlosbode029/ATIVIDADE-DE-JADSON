#include <stdio.h>

int main() {
    int num;

    printf("Digite um numero inteiro: ");
    scanf("%d", &num);

    if (num % 2 == 0) {
        printf("O numero digitado e par.\n");
    } else {
        printf("O numero digitado e impar.\n");
    }

    return 0;
}

 //Este é um programa em C que solicita ao usuário que digite um número inteiro e, em seguida, verifica se o número é par ou ímpar. Ele usa a função scanf para obter 
//o valor do usuário e a estrutura de decisão if-else para testar se o número é divisível por 2 ou não. O resultado é exibido na tela usando a função printf.




