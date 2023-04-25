#include <stdio.h>
#include <stdlib.h>

int main() {
    int idade;
    
    printf("Digite sua idade: ");
    scanf("%d", &idade);
    
    if (idade >= 18) {
        printf("Voce e maior de idade.\n");
    } else {
        printf("Voce e menor de idade.\n");
    }
    
    return 0;
}

//Este é um programa em C que solicita que o usuário digite sua idade e, em seguida, verifica se a idade é maior ou igual a 18 anos. Se a idade for maior ou igual a 18,
//o programa exibe uma mensagem indicando que o usuário é maior de idade. Caso contrário, exibe uma mensagem indicando que o usuário é menor de idade. O programa utiliza 
//a estrutura condicional "if-else" para realizar a verificação e a função scanf para obter entrada de dados. Ele é uma demonstração simples do uso de 
//estruturas condicionais em C.




