#include <stdio.h>
#include <stdlib.h>
int main() {
    int num1;

    printf("Digite um numero  ? ");
    scanf("%d", &num1);
    
	system("cls");
    
    printf("O antecessor de %d eh %d.\n", num1, num1 - 1);
    printf("O sucessor de %d eh %d.\n", num1, num1 + 1);

}

