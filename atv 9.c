#include <stdio.h>

int main() {
    int num, i;

    printf("Digite um numero inteiro: ");
    scanf("%d", &num);

    for (i = 1; i <= 10; i++) {
        printf("%d x %d = %d\n", num, i, num * i);
    }

    return 0;
}

// Este é um programa em C que solicita que o usuário insira um número inteiro e, em seguida, exibe a tabuada desse número de 1 a 10. Ele utiliza um loop for para iterar
// através dos números de 1 a 10 e exibir o resultado da multiplicação entre o número inserido pelo usuário e o número do loop
