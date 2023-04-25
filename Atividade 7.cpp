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

