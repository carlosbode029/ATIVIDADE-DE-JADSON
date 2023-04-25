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

         //Certamente! Este é um programa em C que solicita que o usuário insira um número inteiro, e em seguida, calcula e exibe seu antecessor e sucessor na tela. 
	//Ele usa as funções scanf e printf para obter entrada e exibir saída, e a biblioteca "stdlib.h" para chamar a função "system" e limpar a tela antes de exibi
	//r os resultados. O cálculo do antecessor e do sucessor é realizado usando operações matemáticas simples de adição e subtração. O programa é uma demonstração 
	//básica de entrada e saída de dados e uso de operações aritméticas em C.




