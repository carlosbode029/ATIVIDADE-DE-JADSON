#include <stdio.h>
#include <stdlib.h>

int main() {
    char nome[20];
    int idade;

    printf("Informe seu nome: ");
    scanf("%s", nome);
    system("cls");
    printf("Informe sua idade: ");
    scanf("%d", &idade);
    system("cls");
    printf("Seja bem vindo %s", nome);

    return 0;
}

//O código tem como objetivo solicitar e armazenar o nome e a idade de um usuário e apresentar uma mensagem de boas-vindas com o nome fornecido
